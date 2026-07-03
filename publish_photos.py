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

Что делает кнопка «Опубликовать» (вся прежняя ручная цепочка):
  • каждый тег → категория сайта через portfolio_maps.py (как в import_new.py);
    если тег никуда не ведёт — ГРОМКО предупреждает, фото в эту категорию не попадёт;
  • копирует фото в public/images/portfolio/ как p-<hash>.<ext> (повтор не плодит дубли);
  • прописывает категории и порядок в data/portfolio-tags.json (новые фото — в начало);
  • npm run gen:portfolio → git add (только портфолио) → commit → push (= деплой);
  • опубликованные оригиналы переносит в NewPhoto/_published/.
"""
import os, sys, json, hashlib, shutil, subprocess, threading, collections
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from photo_tagger import CATEGORY_GROUPS          # тот же набор категорий, что в тэггере
from portfolio_maps import categories_for, unmapped, SKIP_TAGS

# ─── Пути ────────────────────────────────────────────────────────────────────
ROOT         = os.path.dirname(os.path.abspath(__file__))
NEWDIR       = os.path.join(ROOT, "NewPhoto")
PUBLISHED    = os.path.join(NEWDIR, "_published")
DEST         = os.path.join(ROOT, "public", "images", "portfolio")
MANIFEST     = os.path.join(ROOT, "data", "portfolio-tags.json")
TAGS_FILE    = os.path.join(ROOT, "photo_tags.json")     # отсюда берём extra_cats (общие с тэггером)
ASSIGN_FILE  = os.path.join(NEWDIR, ".assignments.json")
EXTS         = (".jpg", ".jpeg", ".png", ".webp", ".jfif")

# ─── Цвета ───────────────────────────────────────────────────────────────────
ORANGE = "#FF6B00"
GREEN  = "#1f9d3a"; GREEN_D = "#16802e"
BG = "#111"; BG2 = "#0d0d0d"; PANEL = "#0a0a0a"; CARD = "#1e1e1e"

_NO_WINDOW = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0

# базовые (неудаляемые) категории
BASE_CATS = {c for _, cats in CATEGORY_GROUPS for c in cats}


# ─── Данные ──────────────────────────────────────────────────────────────────
def load_manifest():
    if os.path.exists(MANIFEST):
        return json.load(open(MANIFEST, encoding="utf-8"))
    return {}


def scan_photos():
    os.makedirs(NEWDIR, exist_ok=True)
    return [f for f in sorted(os.listdir(NEWDIR))
            if os.path.isfile(os.path.join(NEWDIR, f))
            and f.lower().endswith(EXTS) and not f.startswith(".")]


def load_assignments():
    if os.path.exists(ASSIGN_FILE):
        try:
            return json.load(open(ASSIGN_FILE, encoding="utf-8"))
        except Exception:
            return {}
    return {}


def save_assignments(assign):
    os.makedirs(NEWDIR, exist_ok=True)
    json.dump(assign, open(ASSIGN_FILE, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)


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
        all_tags        = set(BASE_CATS) | {c for g in self.extra.values() for c in g}
        self.assign     = {k: [c for c in v if c in all_tags]
                           for k, v in load_assignments().items() if k in self.photos}
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
        self.photos = scan_photos()
        self.assign = {k: v for k, v in self.assign.items() if k in self.photos}
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
        ready = [f for f in self.photos if self.assign.get(f)]
        if not ready:
            messagebox.showinfo("Нечего публиковать",
                                "Сначала отметь хотя бы у одного фото категорию.")
            return
        no_cat = len(self.photos) - len(ready)
        msg = f"Опубликовать {len(ready)} фото на сайт?"
        if no_cat:
            msg += f"\n\n{no_cat} фото без категории будут пропущены (останутся в NewPhoto)."
        msg += "\n\nФото уедут в портфолио, изменения запушатся и сайт пересоберётся."
        if not messagebox.askyesno("Публикация", msg):
            return
        self.busy = True
        self.btn_publish.config(state="disabled", text="⏳  Публикую…")
        self.log.config(state="normal"); self.log.delete("1.0", "end"); self.log.config(state="disabled")
        threading.Thread(target=self._publish_worker, args=(ready,), daemon=True).start()

    def _run(self, cmd, label):
        self._log(f"$ {cmd if isinstance(cmd, str) else ' '.join(cmd)}")
        try:
            r = subprocess.run(cmd, cwd=ROOT, shell=isinstance(cmd, str),
                               capture_output=True, text=True, encoding="utf-8",
                               errors="replace", creationflags=_NO_WINDOW)
        except Exception as e:
            self._log(f"  ✖ {label}: {e}"); return False, str(e)
        out = (r.stdout or "") + (r.stderr or "")
        for line in out.splitlines():
            if line.strip():
                self._log("  " + line)
        if r.returncode != 0:
            self._log(f"  ✖ {label} — код {r.returncode}")
        return r.returncode == 0, out

    def _publish_worker(self, ready):
        try:
            manifest = load_manifest()
            os.makedirs(DEST, exist_ok=True); os.makedirs(PUBLISHED, exist_ok=True)

            minorder = {}
            for meta in manifest.values():
                for c, n in (meta.get("order") or {}).items():
                    minorder[c] = min(minorder.get(c, n), n)

            # план: тег → категория сайта (через portfolio_maps), предупреждения о незамапленных
            self._set_status("Готовлю файлы…", ORANGE)
            plan, warnings, no_cat_after = [], [], []
            for name in ready:
                src = os.path.join(NEWDIR, name)
                if not os.path.exists(src):
                    self._log(f"  пропуск (нет файла): {name}"); continue
                tags = [t for t in self.assign.get(name, []) if t not in SKIP_TAGS]
                cats = categories_for(tags)
                bad = unmapped(tags)
                if bad:
                    warnings.append((name, bad))
                if not cats:
                    no_cat_after.append(name); continue
                with open(src, "rb") as fh:
                    h = hashlib.md5(fh.read()).hexdigest()[:12]
                ext = os.path.splitext(src)[1].lower() or ".jpg"
                plan.append((name, src, f"p-{h}{ext}", cats))

            if warnings:
                self._log("⚠ Теги без категории — фото туда НЕ попадёт:")
                for name, bad in warnings:
                    self._log(f"    {name}: {', '.join(bad)}")
                self._log("  (добавь маппинг в portfolio_maps.py, если нужно)")

            if not plan:
                self.busy = False
                self.root.after(0, self._update_publish_btn)
                self._set_status("Нечего публиковать: ни один тег не ведёт в категорию.", "#e9a000")
                self.root.after(0, lambda: messagebox.showwarning(
                    "Нечего публиковать",
                    "Ни одно фото не попало в категорию сайта — все теги оказались "
                    "незамапленными. Смотри предупреждения в логе."))
                return

            # порядок: вся пачка перед существующими, внутри — в порядке плана
            percat_new = collections.defaultdict(list)
            for _, _, dest, cats in plan:
                existing = set(manifest.get(dest, {}).get("categories", []))
                for c in cats:
                    if c not in existing and dest not in percat_new[c]:
                        percat_new[c].append(dest)
            order_for = {}
            for c, dests in percat_new.items():
                base = minorder.get(c, 1) - len(dests)
                for i, dest in enumerate(dests):
                    order_for[(dest, c)] = base + i

            copied, published, bycat = 0, [], collections.Counter()
            for name, src, dest, cats in plan:
                dst = os.path.join(DEST, dest)
                if not os.path.exists(dst):
                    shutil.copy2(src, dst); copied += 1
                entry = manifest.get(dest, {"categories": [], "order": {}})
                ecats, eorder = set(entry.get("categories", [])), dict(entry.get("order", {}))
                for c in cats:
                    if c not in ecats:
                        ecats.add(c); bycat[c] += 1
                    if (dest, c) in order_for:
                        eorder[c] = order_for[(dest, c)]
                    elif c not in eorder:
                        eorder[c] = minorder.get(c, 1)
                manifest[dest] = {"categories": sorted(ecats), "order": eorder}
                published.append((name, dest))

            json.dump(dict(sorted(manifest.items())), open(MANIFEST, "w", encoding="utf-8"),
                      ensure_ascii=False, indent=2)
            self._log(f"Манифест обновлён. Новых файлов скопировано: {copied}.")
            for c, n in sorted(bycat.items(), key=lambda x: -x[1]):
                self._log(f"  +{n}  {c}")
            if no_cat_after:
                self._log(f"Пропущено (теги без категории): {len(no_cat_after)}")

            self._set_status("Пересобираю портфолио…", ORANGE)
            ok, _ = self._run("npm run gen:portfolio", "gen:portfolio")
            if not ok:
                raise RuntimeError("npm run gen:portfolio завершился с ошибкой — см. лог.")

            self._set_status("Коммичу и пушу…", ORANGE)
            paths = ["public/images/portfolio", "data/portfolio-tags.json", "data/portfolio.generated.ts"]
            self._run(["git", "add", "--"] + paths, "git add")
            ok, st = self._run(["git", "status", "--porcelain", "--"] + paths, "git status")
            if not st.strip():
                self._set_status("Изменений нет — всё уже на сайте.", "#888")
                self._log("Нечего коммитить: эти фото уже опубликованы.")
                self._finish_ui([], pushed=False); return

            cmsg = f"feat(portfolio): +{len(published)} фото"
            cat_list = ", ".join(c for c, _ in sorted(bycat.items(), key=lambda x: -x[1])[:4])
            if cat_list:
                cmsg += f" — {cat_list}"
            ok, _ = self._run(["git", "commit", "-m", cmsg], "git commit")
            if not ok:
                raise RuntimeError("git commit не прошёл — см. лог.")

            self._log("Отправляю на сервер (git push)…")
            ok, _ = self._run(["git", "push"], "git push")
            if not ok:
                self._set_status("Закоммичено локально, но push не прошёл — см. лог.", "#e9a000")
                self.root.after(0, lambda: messagebox.showwarning(
                    "Push не прошёл",
                    "Фото добавлены и закоммичены локально, но отправить на GitHub не вышло.\n"
                    "Проверь интернет/доступ и сделай push вручную.\n\nПодробности — в логе."))
                self._finish_ui(published, pushed=False); return
            self._finish_ui(published, pushed=True)

        except Exception as e:
            self._log(f"✖ ОШИБКА: {e}")
            self._set_status(f"Ошибка: {e}", "#e55")
            self.root.after(0, lambda: messagebox.showerror(
                "Ошибка публикации",
                f"{e}\n\nНичего не отправлено на сайт.\nПодробности — в логе."))
            self.busy = False
            self.root.after(0, self._update_publish_btn)

    def _finish_ui(self, published, pushed):
        moved = 0
        for name, _dest in published:
            src = os.path.join(NEWDIR, name)
            if os.path.exists(src):
                base, ext = os.path.splitext(name)
                target = os.path.join(PUBLISHED, name); k = 1
                while os.path.exists(target):
                    target = os.path.join(PUBLISHED, f"{base}_{k}{ext}"); k += 1
                try:
                    shutil.move(src, target); moved += 1
                except Exception as e:
                    self._log(f"  не убрать в _published: {name} ({e})")
            self.assign.pop(name, None)
        save_assignments(self.assign)

        def done():
            self.busy = False
            self.photos = scan_photos(); self.idx = 0
            self._show_photo()
            if pushed and published:
                self._set_status(f"Готово! {len(published)} фото отправлены. "
                                 "Сайт пересоберётся за пару минут.", GREEN)
                messagebox.showinfo("Опубликовано 🎉",
                    f"{len(published)} фото отправлены на сайт.\n"
                    f"Оригиналы перенесены в NewPhoto/_published ({moved}).\n\n"
                    "GitHub Actions пересоберёт clc-ufa.ru — обычно 1–3 минуты.")
        self.root.after(0, done)

    # ── Клавиши ──────────────────────────────────────────────────────────────
    def _bind_keys(self):
        self.root.bind("<Right>",  lambda e: self.next_photo())
        self.root.bind("<Return>", lambda e: self.next_photo())
        self.root.bind("<Left>",   lambda e: self.prev_photo())
        self.root.bind("<space>",  lambda e: self.skip_photo())
        self.root.bind("<Escape>", lambda e: self.root.destroy())


# ─── Запуск ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    try:
        from PIL import Image, ImageTk  # noqa: F401
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "-q"])
        from PIL import Image, ImageTk  # noqa: F401
    root = tk.Tk()
    PublishApp(root)
    root.mainloop()
