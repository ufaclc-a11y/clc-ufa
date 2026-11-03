"""
publish_photos.py — одно окно: разметить новые фото и одной кнопкой отправить их на сайт.

Категоризатор — ТОТ ЖЕ, что в photo_tagger.py: сгруппированные теги в 3 колонки,
можно добавлять (＋) и удалять (×) категории. Списки берутся прямо из photo_tagger.py
(CATEGORY_GROUPS), добавленные категории хранятся в photo_tags.json — общие для обоих окон.

Как пользоваться:
  1. Положи новые фото в папку  NewPhoto/  (рядом со скриптом).
  2. Запусти publish_photos.cmd (или `python publish_photos.py`).
  3. Для каждого фото отметь категории галочками (можно несколько).
  4. Нажми «🚀 Опубликовать на сайт».

Что делает кнопка «Опубликовать»:
  • сохраняет только выбранную пачку и разметку в NewPhoto/.publisher;
  • добавляет её поверх свежего main в независимой временной копии;
  • не меняет локальные код, манифест, индекс, ветку и коммиты;
  • ждёт успешный deploy.yml для точного SHA и проверяет живые фото/категории;
  • лишь затем архивирует неизменённые оригиналы и снимает разметку пачки.
При ошибке повторяет ту же пачку по квитанции. См. docs/photo-publisher.md.
"""
import os, sys, json, shutil, subprocess, threading
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk, ImageOps

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from photo_tagger import CATEGORY_GROUPS          # тот же набор категорий, что в тэггере
from portfolio_maps import categories_for, unmapped
import safe_photo_publisher as safe_publisher

# ─── Пути ────────────────────────────────────────────────────────────────────
ROOT         = os.path.dirname(os.path.abspath(__file__))
NEWDIR       = os.path.join(ROOT, "NewPhoto")
TAGS_FILE    = os.path.join(ROOT, "photo_tags.json")     # отсюда берём extra_cats (общие с тэггером)
ASSIGN_FILE  = os.path.join(NEWDIR, ".assignments.json")
EXTS         = (".jpg", ".jpeg", ".png", ".webp", ".jfif")

# ─── Цвета ───────────────────────────────────────────────────────────────────
ORANGE = "#FF6B00"
GREEN  = "#1f9d3a"; GREEN_D = "#16802e"
BG = "#111"; BG2 = "#0d0d0d"; PANEL = "#0a0a0a"; CARD = "#1e1e1e"

# базовые (неудаляемые) категории
BASE_CATS = {c for _, cats in CATEGORY_GROUPS for c in cats}


# ─── Оптимизация фото под быструю загрузку страниц ───────────────────────────
MAX_SIDE     = 1920     # длинная сторона (как в scripts/compress-images.mjs)
JPEG_QUALITY = 82       # качество JPEG (визуально без потерь, но заметно легче)

def _has_real_transparency(img):
    """PNG/RGBA с реально прозрачными пикселями (а не полностью непрозрачным альфа)."""
    if img.mode == "P":
        return "transparency" in img.info
    if img.mode in ("RGBA", "LA"):
        try:
            return img.getchannel("A").getextrema()[0] < 255
        except Exception:
            return True
    return False

def output_ext(src):
    """Расширение публикуемого файла: фото → .jpg, с прозрачностью → сохраняем формат."""
    try:
        with Image.open(src) as im:
            if _has_real_transparency(im):
                return os.path.splitext(src)[1].lower() or ".png"
    except Exception:
        return os.path.splitext(src)[1].lower() or ".jpg"
    return ".jpg"

def optimize_image(src, dst):
    """Ресайз до MAX_SIDE + пережатие. Фото → JPEG, прозрачные → PNG. Поворот по EXIF.
    Если оптимизация не уменьшила файл (и формат тот же) — оставляем оригинал.
    Возвращает (размер_до, размер_после) в байтах."""
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)          # применяем поворот из EXIF
        if max(im.size) > MAX_SIDE:
            im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
        if dst.lower().endswith(".png"):
            im.save(dst, "PNG", optimize=True)
        elif dst.lower().endswith(".webp"):
            im.save(dst, "WEBP", quality=JPEG_QUALITY, method=5)
        else:
            im.convert("RGB").save(dst, "JPEG", quality=JPEG_QUALITY,
                                   optimize=True, progressive=True)
    # если формат тот же и меньше не стало — вернём оригинал (не портим то, что уже лёгкое)
    if (os.path.splitext(src)[1].lower() == os.path.splitext(dst)[1].lower()
            and os.path.getsize(dst) >= os.path.getsize(src)):
        shutil.copy2(src, dst)
    return os.path.getsize(src), os.path.getsize(dst)


# ─── Данные ──────────────────────────────────────────────────────────────────
def scan_photos():
    os.makedirs(NEWDIR, exist_ok=True)
    return [f for f in sorted(os.listdir(NEWDIR))
            if os.path.isfile(os.path.join(NEWDIR, f))
            and f.lower().endswith(EXTS) and not f.startswith(".")]


def load_assignments():
    if os.path.exists(ASSIGN_FILE):
        with open(ASSIGN_FILE, encoding="utf-8") as stream:
            return json.load(stream)
    return {}


def save_assignments(assign):
    os.makedirs(NEWDIR, exist_ok=True)
    safe_publisher.atomic_json(ASSIGN_FILE, assign)


def load_extra():
    if os.path.exists(TAGS_FILE):
        try:
            return json.load(open(TAGS_FILE, encoding="utf-8")).get("extra_cats", {})
        except Exception:
            return {}
    return {}


def save_extra(extra):
    data = {}
    if os.path.exists(TAGS_FILE):
        try:
            data = json.load(open(TAGS_FILE, encoding="utf-8"))
        except Exception:
            data = {}
    data["extra_cats"] = extra
    json.dump(data, open(TAGS_FILE, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)


# ─── Приложение ──────────────────────────────────────────────────────────────
class PublishApp:
    def __init__(self, root):
        self.root = root
        root.title("🚀 CLC — Публикация фото на сайт")
        root.configure(bg=BG)
        root.geometry("1480x900")
        root.minsize(1100, 720)

        self.extra      = load_extra()
        self.photos     = scan_photos()
        self.assign     = load_assignments()  # retain old/unknown tags for recoverable retries
        self.idx        = 0
        self.img_ref    = None
        self.check_vars = {}     # tag -> BooleanVar
        self.busy       = False

        self._build_ui()
        self._bind_keys()
        self._show_photo()

    # ── UI ───────────────────────────────────────────────────────────────────
    def _build_ui(self):
        top = tk.Frame(self.root, bg=BG2, pady=8)
        top.pack(fill="x")
        self.lbl_progress = tk.Label(top, text="", bg=BG2, fg=ORANGE,
                                     font=("Consolas", 14, "bold"))
        self.lbl_progress.pack(side="left", padx=16)
        self.lbl_file = tk.Label(top, text="", bg=BG2, fg="#666", font=("Consolas", 11))
        self.lbl_file.pack(side="left", padx=4)
        self._flat_btn(top, "📁  Открыть папку NewPhoto", self.open_folder).pack(side="right", padx=8)
        self._flat_btn(top, "🔄  Обновить список", self.refresh).pack(side="right", padx=4)

        main = tk.Frame(self.root, bg=BG)
        main.pack(fill="both", expand=True, padx=10, pady=8)

        # Левая колонка: фото + навигация
        left = tk.Frame(main, bg=BG, width=500)
        left.pack(side="left", fill="y")
        left.pack_propagate(False)
        self.img_label = tk.Label(left, bg=PANEL, fg="#555", font=("Arial", 13))
        self.img_label.pack(fill="both", expand=True)
        nav = tk.Frame(left, bg=BG, pady=8)
        nav.pack(fill="x")
        self._nav_btn(nav, "◀  Назад", self.prev_photo).pack(side="left", padx=4)
        self._nav_btn(nav, "Пропустить", self.skip_photo, bg="#1a1a1a", fg="#777").pack(side="left", padx=4)
        self._nav_btn(nav, "Дальше  ▶", self.next_photo).pack(side="right", padx=4)

        # Правая колонка: категории (как в photo_tagger)
        right = tk.Frame(main, bg=BG)
        right.pack(side="right", fill="both", expand=True, padx=(12, 0))
        tk.Label(right, text="КАТЕГОРИИ", bg=BG, fg=ORANGE,
                 font=("Consolas", 12, "bold")).pack(anchor="w")
        tk.Label(right, text="Можно выбрать несколько  •  ＋ добавить, × удалить категорию",
                 bg=BG, fg="#666", font=("Arial", 10)).pack(anchor="w", pady=(0, 8))

        cat_wrap = tk.Frame(right, bg=BG)
        cat_wrap.pack(fill="both", expand=True)
        self.cat_canvas = tk.Canvas(cat_wrap, bg=BG, highlightthickness=0)
        sb = tk.Scrollbar(cat_wrap, orient="vertical", command=self.cat_canvas.yview)
        self.cat_inner = tk.Frame(self.cat_canvas, bg=BG)
        self.cat_inner.bind("<Configure>", lambda e: self.cat_canvas.configure(
            scrollregion=self.cat_canvas.bbox("all")))
        self.cat_canvas.create_window((0, 0), window=self.cat_inner, anchor="nw")
        self.cat_canvas.configure(yscrollcommand=sb.set)
        self.cat_canvas.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")
        self.cat_canvas.bind_all("<MouseWheel>",
                                 lambda e: self.cat_canvas.yview_scroll(-1 * (e.delta // 120), "units"))

        tk.Button(right, text="＋  Добавить категорию", command=self.add_category,
                  bg=BG, fg=ORANGE, relief="flat", font=("Arial", 11), cursor="hand2",
                  pady=8, activebackground="#1a1a1a").pack(fill="x", pady=(8, 0))
        self.lbl_selected = tk.Label(right, text="", bg=BG, fg=ORANGE, font=("Arial", 10),
                                     wraplength=620, justify="left", anchor="w")
        self.lbl_selected.pack(fill="x", pady=(6, 0))

        # Низ: публикация + лог
        bottom = tk.Frame(self.root, bg=BG2)
        bottom.pack(fill="x", side="bottom")
        bar = tk.Frame(bottom, bg=BG2, pady=10)
        bar.pack(fill="x")
        self.lbl_status = tk.Label(bar, text="", bg=BG2, fg="#888",
                                   font=("Consolas", 11), anchor="w")
        self.lbl_status.pack(side="left", padx=16, fill="x", expand=True)
        self.btn_publish = tk.Button(
            bar, text="🚀  ОПУБЛИКОВАТЬ НА САЙТ", command=self.publish,
            bg=GREEN, fg="white", relief="flat", font=("Arial", 14, "bold"),
            cursor="hand2", padx=28, pady=12, bd=0,
            activebackground=GREEN_D, activeforeground="white")
        self.btn_publish.pack(side="right", padx=16)

        logwrap = tk.Frame(bottom, bg=BG2)
        logwrap.pack(fill="x", padx=16, pady=(0, 10))
        self.log = tk.Text(logwrap, height=6, bg=PANEL, fg="#bbb", font=("Consolas", 9),
                           relief="flat", bd=0, wrap="word", state="disabled")
        logsb = tk.Scrollbar(logwrap, command=self.log.yview)
        self.log.configure(yscrollcommand=logsb.set)
        self.log.pack(side="left", fill="both", expand=True)
        logsb.pack(side="right", fill="y")

        self._render_categories()

    def _flat_btn(self, parent, text, cmd):
        return tk.Button(parent, text=text, command=cmd, bg="#1a1a1a", fg=ORANGE,
                         relief="flat", font=("Arial", 10), cursor="hand2",
                         padx=12, pady=5, bd=0,
                         activebackground="#2a2a2a", activeforeground=ORANGE)

    def _nav_btn(self, parent, text, cmd, bg=CARD, fg="white"):
        return tk.Button(parent, text=text, command=cmd, bg=bg, fg=fg, relief="flat",
                         font=("Arial", 12), cursor="hand2", padx=18, pady=9, bd=0,
                         activebackground="#3a3a3a", activeforeground="white")

    # ── Категории (порт из photo_tagger) ──────────────────────────────────────
    def _render_categories(self):
        for w in self.cat_inner.winfo_children():
            w.destroy()
        self.check_vars.clear()

        cols = [tk.Frame(self.cat_inner, bg=BG) for _ in range(3)]
        for i, c in enumerate(cols):
            c.grid(row=0, column=i, sticky="nsew", padx=(0, 10))
            self.cat_inner.columnconfigure(i, weight=1, uniform="cat")

        col_map = {
            "Лазерная резка": cols[0], "Гравировка на металле": cols[0], "Фрезерная резка": cols[0],
            "УФ-печать": cols[1], "Гравировка на неметаллах": cols[1], "Служебные": cols[1],
            "Изделия из фанеры / акрила / дерева": cols[2],
        }

        def delete_extra(group_name, cat_name):
            if self.busy:
                return
            if not messagebox.askyesno("Удалить категорию",
                                       f'Удалить «{cat_name}» из «{group_name}»?', parent=self.root):
                return
            if group_name in self.extra and cat_name in self.extra[group_name]:
                self.extra[group_name].remove(cat_name)
            for gname, cats in CATEGORY_GROUPS:
                if gname == group_name and cat_name in cats:
                    cats.remove(cat_name); break
            for fname, tags in self.assign.items():
                if cat_name in tags:
                    tags.remove(cat_name)
            save_extra(self.extra); save_assignments(self.assign)
            self._render_categories()
            self._restore_checks()

        def render_group(parent, group_name, cats):
            extra_set = set(self.extra.get(group_name, []))
            combined = list(dict.fromkeys(cats + list(extra_set)))
            if group_name != "Служебные":
                combined = sorted(combined, key=lambda s: s.lower())
            tk.Label(parent, text=group_name.upper(), bg=BG, fg=ORANGE,
                     font=("Consolas", 9, "bold"), anchor="w").pack(fill="x", pady=(12, 3), padx=2)
            for cat in combined:
                is_extra = cat not in BASE_CATS
                row = tk.Frame(parent, bg=BG)
                row.pack(fill="x", pady=1)
                var = tk.BooleanVar()
                self.check_vars[cat] = var
                tk.Checkbutton(row, variable=var, text=cat, bg=BG, fg="#ccc",
                               selectcolor="#2a2a2a", activebackground=BG, activeforeground="white",
                               font=("Arial", 11), cursor="hand2", anchor="w",
                               command=self._on_check).pack(side="left", fill="x", expand=True, padx=4)
                if is_extra:
                    tk.Button(row, text="×", command=lambda g=group_name, c=cat: delete_extra(g, c),
                              bg=BG, fg="#555", relief="flat", font=("Arial", 12, "bold"),
                              cursor="hand2", padx=4, pady=0, bd=0,
                              activebackground=BG, activeforeground="#ff4444").pack(side="right", padx=(0, 4))

        for group_name, cats in CATEGORY_GROUPS:
            render_group(col_map.get(group_name, cols[0]), group_name, cats)

        self._restore_checks()

    def add_category(self):
        groups = [g for g, _ in CATEGORY_GROUPS if g != "Служебные"]
        win = tk.Toplevel(self.root); win.title("Добавить категорию")
        win.configure(bg=BG); win.geometry("420x400"); win.grab_set()
        tk.Label(win, text="Выберите раздел:", bg=BG, fg="white",
                 font=("Arial", 11)).pack(pady=(16, 6))
        gvar = tk.StringVar(value=groups[0])
        for g in groups:
            tk.Radiobutton(win, text=g, variable=gvar, value=g, bg=BG, fg="#ccc",
                           selectcolor="#333", activebackground=BG,
                           font=("Arial", 10)).pack(anchor="w", padx=20)
        tk.Label(win, text="Название категории:", bg=BG, fg="white",
                 font=("Arial", 11)).pack(pady=(14, 4))
        entry = tk.Entry(win, font=("Arial", 12), bg=CARD, fg="white",
                         insertbackground="white", relief="flat", bd=6)
        entry.pack(fill="x", padx=20); entry.focus()

        def confirm():
            name = entry.get().strip(); group = gvar.get()
            if not name:
                return
            existing = [c for _, cats in CATEGORY_GROUPS for c in cats]
            existing += [c for grp in self.extra.values() for c in grp]
            if name in existing:
                messagebox.showwarning("Дубль", f'Категория «{name}» уже есть.', parent=win); return
            self.extra.setdefault(group, []).append(name)
            save_extra(self.extra)
            for gname, cats in CATEGORY_GROUPS:
                if gname == group:
                    cats.append(name); cats.sort(key=lambda s: s.lower()); break
            self._render_categories(); self._restore_checks()
            win.destroy()

        tk.Button(win, text="Добавить", command=confirm, bg=ORANGE, fg="white",
                  relief="flat", font=("Arial", 11, "bold"), pady=8,
                  cursor="hand2").pack(fill="x", padx=20, pady=14)
        win.bind("<Return>", lambda e: confirm())

    def _restore_checks(self):
        sel = set(self.assign.get(self._current(), []))
        for cat, var in self.check_vars.items():
            var.set(cat in sel)
        self._update_selected()

    def _selected(self):
        return [cat for cat, var in self.check_vars.items() if var.get()]

    def _on_check(self):
        if self.busy:
            self._restore_checks()
            return
        name = self._current()
        if name:
            sel = self._selected()
            if sel:
                self.assign[name] = sel
            else:
                self.assign.pop(name, None)
            save_assignments(self.assign)
        self._update_selected()
        self._update_progress()
        self._update_publish_btn()

    def _update_selected(self):
        sel = self._selected()
        self.lbl_selected.config(text=("✓ " + "    ✓ ".join(sel)) if sel else "")

    # ── Показ фото ─────────────────────────────────────────────────────────────
    def _current(self):
        return self.photos[self.idx] if self.photos else None

    def _update_progress(self):
        total = len(self.photos)
        done = sum(1 for f in self.photos if self.assign.get(f))
        cur = self.idx + 1 if total else 0
        self.lbl_progress.config(
            text=f"  {cur} / {total}   •   размечено: {done}   •   без категории: {total - done}")

    def _show_photo(self):
        name = self._current()
        self._update_progress()
        if not name:
            self.img_label.config(image="",
                                  text="Папка NewPhoto пуста.\n\nПоложи фото и нажми «Обновить список».")
            self.lbl_file.config(text="")
            for var in self.check_vars.values():
                var.set(False)
            self._update_selected(); self._update_publish_btn()
            return
        self.lbl_file.config(text=name)
        self._draw_image(os.path.join(NEWDIR, name))
        self._restore_checks()
        self._update_publish_btn()

    def _draw_image(self, path):
        try:
            img = Image.open(path)
            img.thumbnail((480, 640), Image.LANCZOS)
            self.img_ref = ImageTk.PhotoImage(img)
            self.img_label.config(image=self.img_ref, text="")
        except Exception as e:
            self.img_label.config(image="", text=f"Не открыть фото:\n{e}", fg="#e55")

    def _update_publish_btn(self):
        if self.busy:
            return
        pending = safe_publisher.load_batch(NEWDIR)
        if pending and not pending.get('complete'):
            self.btn_publish.config(state="normal", text="⏳  ПОВТОРИТЬ ПРОВЕРКУ / ПУБЛИКАЦИЮ ПАЧКИ")
            return
        n = sum(1 for f in self.photos if self.assign.get(f))
        if n:
            self.btn_publish.config(state="normal", text=f"🚀  ОПУБЛИКОВАТЬ НА САЙТ  ({n})")
        else:
            self.btn_publish.config(state="disabled", text="🚀  ОПУБЛИКОВАТЬ НА САЙТ")

    # ── Навигация ──────────────────────────────────────────────────────────────
    def next_photo(self):
        if self.photos and self.idx < len(self.photos) - 1:
            self.idx += 1; self._show_photo()

    def prev_photo(self):
        if self.photos and self.idx > 0:
            self.idx -= 1; self._show_photo()

    def skip_photo(self):
        self.next_photo()

    def refresh(self):
        if self.busy:
            return
        self.photos = scan_photos()
        self.idx = min(self.idx, max(0, len(self.photos) - 1))
        self._show_photo()

    def open_folder(self):
        os.makedirs(NEWDIR, exist_ok=True)
        if os.name == "nt":
            os.startfile(NEWDIR)
        else:
            subprocess.Popen(["xdg-open", NEWDIR])

    # ── Лог ─────────────────────────────────────────────────────────────────────
    def _log(self, msg):
        def _():
            self.log.config(state="normal")
            self.log.insert("end", msg + "\n"); self.log.see("end")
            self.log.config(state="disabled")
        self.root.after(0, _)

    def _set_status(self, msg, color="#888"):
        self.root.after(0, lambda: self.lbl_status.config(text=msg, fg=color))

    # ── Публикация ───────────────────────────────────────────────────────────────
    def publish(self):
        if self.busy:
            return
        pending = safe_publisher.load_batch(NEWDIR)
        resuming = pending and not pending.get('complete')
        ready = [f for f in self.photos if self.assign.get(f)]
        if not ready and not resuming:
            messagebox.showinfo("Нечего публиковать",
                                "Сначала отметь хотя бы у одного фото категорию.")
            return
        no_cat = len(self.photos) - len(ready)
        msg = ("Продолжить сохранённую пачку? Новые фото пока не добавляются."
               if resuming else f"Опубликовать {len(ready)} фото на сайт?")
        if no_cat and not resuming:
            msg += f"\n\n{no_cat} фото без категории будут пропущены (останутся в NewPhoto)."
        msg += "\n\nФото уедут в портфолио, изменения запушатся и сайт пересоберётся."
        if not messagebox.askyesno("Публикация", msg):
            return
        self.busy = True
        self.btn_publish.config(state="disabled", text="⏳  Публикую…")
        self.log.config(state="normal"); self.log.delete("1.0", "end"); self.log.config(state="disabled")
        threading.Thread(target=self._publish_worker, args=(ready,), daemon=True).start()

    def _publish_worker(self, ready):
        try:
            self._set_status("Готовлю или восстанавливаю выбранную пачку…", ORANGE)
            selected = []
            pending = safe_publisher.load_batch(NEWDIR)
            if not pending or pending.get('complete'):
                for name in ready:
                    tags = list(self.assign.get(name, []))
                    bad = unmapped(tags)
                    if bad:
                        raise ValueError(f"{name}: теги без категории: {', '.join(bad)}. Исправьте разметку.")
                    cats = categories_for(tags)
                    if cats:
                        selected.append((name, cats, tags))
            batch = safe_publisher.prepare_batch(
                NEWDIR, selected,
                lambda src, dst: optimize_image(str(src), str(dst)), output_ext)
            self._set_status("Отправляю выбранную пачку из чистой копии main…", ORANGE)
            sha = safe_publisher.publish_batch(ROOT, NEWDIR, batch, log=self._log)
            self._log(f"main принял SHA {sha}. Это ещё не подтверждение сайта.")
            self._set_status("Жду успешный deploy.yml именно этого SHA (до 20 минут)…", ORANGE)
            run = safe_publisher.wait_for_deploy(sha)
            batch['workflow_run_id'] = run['id']
            safe_publisher.save_batch(NEWDIR, batch)
            self._set_status("Проверяю изображения и категории на clc-ufa.ru…", ORANGE)
            safe_publisher.verify_live(batch)
            batch['verified'] = True
            safe_publisher.save_batch(NEWDIR, batch)
            self.root.after(0, lambda: self._finish_ui(batch, pushed=True))
        except Exception as error:
            self._publication_failed(str(error))

    def _publication_failed(self, detail):
        self._log("✖ Публикация не подтверждена: " + detail)
        self._set_status("Не подтверждено. Оригиналы и разметка сохранены; повторите публикацию.", "#e9a000")
        def failed():
            self.busy = False
            self._update_publish_btn()
            messagebox.showerror("Публикация не подтверждена",
                detail + "\n\nPush мог уже пройти. Оригиналы, разметка и квитанция сохранены. "
                "Нажмите «Опубликовать» ещё раз: продолжится та же пачка без новых дублей. "
                "Не удаляйте NewPhoto/.publisher.")
        self.root.after(0, failed)

    def _finish_ui(self, published, pushed):
        if not pushed:
            self.busy = False
            self._update_publish_btn()
            return
        try:
            self.assign = safe_publisher.archive_batch(NEWDIR, published, load_assignments())
        except Exception as error:
            self._publication_failed(str(error))
            return
        self.busy = False
        self.photos = scan_photos()
        self.idx = 0
        self._show_photo()
        self._set_status("Готово: deploy и живые категории проверены; оригиналы в _published.", GREEN)
        messagebox.showinfo("Опубликовано", "Успешный deploy и фото в категориях clc-ufa.ru проверены.\n"
                           "Оригиналы сохранены в NewPhoto/_published.")


    # ── Клавиши ──────────────────────────────────────────────────────────────
    def _bind_keys(self):
        self.root.bind("<Right>",  lambda e: self.next_photo())
        self.root.bind("<Return>", lambda e: self.next_photo())
        self.root.bind("<Left>",   lambda e: self.prev_photo())
        self.root.bind("<space>",  lambda e: self.skip_photo())
        self.root.bind("<Escape>", lambda e: self.root.destroy())


# ─── Запуск ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    with safe_publisher.publisher_lock(NEWDIR):
        root = tk.Tk()
        PublishApp(root)
        root.mainloop()
