"""
Тегирование фотографий для сайта CLC-UFA
Показывает фото по одному — выбираем категории, сохраняем в photo_tags.json
Управление: → / Enter — сохранить и далее | ← — назад | Пробел — пропустить | Esc — выход
"""
import tkinter as tk
from tkinter import messagebox, filedialog
from PIL import Image, ImageTk
import json, os, glob, sys

RESULTS_FILE = "D:/clc-ufa3/photo_tags.json"

# ── Категории с группировкой (сортировка по алфавиту, дубли удалены) ─────────
def _dedup_sorted(lst):
    return sorted(set(lst), key=lambda s: s.lower())

CATEGORY_GROUPS = [
    ("Лазерная резка", _dedup_sorted([
        "Лазерная резка акрила",
        "Лазерная резка картона",
        "Лазерная резка трафаретов",
        "Лазерная резка фанеры",
    ])),
    ("УФ-печать", _dedup_sorted([
        "UV DTF-наклейки",
        "Печать на акриле",
        "Печать на коже",
        "Печать на пластике",
        "Печать на фанере",
    ])),
    ("Гравировка на металле", _dedup_sorted([
        "Гравировка на адресниках",
        "Гравировка на жетонах",
        "Гравировка на кружках",
        "Гравировка на кулонах",
        "Гравировка на медалях",
        "Гравировка на ножах",
        "Гравировка на термосе",
    ])),
    ("Фрезерная резка", _dedup_sorted([
        "Изготовление менажниц",
        "Фрезеровка МДФ",
        "Фрезеровка ПВХ",
        "Фрезеровка акрила",
        "Фрезеровка дерева",
        "Фрезеровка фанеры",
    ])),
    ("Гравировка на неметаллах", _dedup_sorted([
        "Гравировка на брелоках",
        "Гравировка на дереве",
        "Гравировка на коже",
        "Гравировка на менажницах",
        "Гравировка на органайзерах",
        "Гравировка на пластике",
        "Гравировка на фанере",
        "Гравировка на экокоже",
    ])),
    ("Изделия из фанеры / акрила / дерева", _dedup_sorted([
        "Акриловое клише",
        "Бейджики",
        "Брелоки",
        "Вывески",
        "Заготовки для творчества",
        "Копилки",
        "Кормушки",
        "Ключница",
        "Медали",
        "Медальница",
        "Наградные статуэтки",
        "Номерки для гардеробов",
        "Органайзеры",
        "Таблички и указатели",
        "Тейбл тенты и менюхолдеры",
        "Хештеги",
        "Часы",
        "Шилдики из АБС пластика",
        "Шкатулки из фанеры",
    ])),
    ("Служебные", [
        "Пропустить (не в тему)",
    ]),
]

# Плоский список всех категорий
ALL_CATS = [cat for _, cats in CATEGORY_GROUPS for cat in cats]

# ─── Состояние ───────────────────────────────────────────────────────────────

DEFAULT_DIRS = ["D:/TGArhiv/photos"]

def load_state():
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {"tagged": {}, "extra_cats": {}, "photo_dirs": DEFAULT_DIRS}

def save_state(state):
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def collect_photos(dirs):
    exts = ["*.jpg","*.jpeg","*.JPG","*.JPEG","*.png","*.PNG",
            "*.webp","*.WEBP","*.jfif","*.JFIF"]
    seen, result = set(), []
    for d in dirs:
        if not os.path.isdir(d):
            continue
        for ext in exts:
            for p in glob.glob(os.path.join(d, ext)):
                name = os.path.basename(p)
                if name not in seen:
                    seen.add(name)
                    result.append(p)
    return sorted(result)

# ─── Приложение ──────────────────────────────────────────────────────────────

class PhotoTagger:
    def __init__(self, root):
        self.root = root
        self.root.title("📷 CLC Photo Tagger")
        self.root.configure(bg="#111")
        self.root.geometry("1400x820")
        self.root.resizable(True, True)

        self.state   = load_state()
        self.tagged  = self.state["tagged"]
        self.extra   = self.state.get("extra_cats", {})
        self.dirs    = self.state.get("photo_dirs", DEFAULT_DIRS)

        # Фото из всех папок
        self.photos = collect_photos(self.dirs)

        if not self.photos:
            messagebox.showerror("Ошибка",
                f"Фото не найдены.\nПапки поиска:\n" + "\n".join(self.dirs))
            root.destroy(); return

        # Начинаем с первого необработанного
        tagged_names = set(self.tagged.keys())
        first_untagged = next((i for i, p in enumerate(self.photos)
                               if os.path.basename(p) not in tagged_names), 0)
        self.idx = first_untagged

        self.check_vars = {}
        self.img_ref    = None

        self._build_ui()
        self._bind_keys()
        self._show_photo()

    # ── Построение интерфейса ────────────────────────────────────────────────

    def _build_ui(self):
        # ── Топ-бар
        top = tk.Frame(self.root, bg="#0d0d0d", pady=7)
        top.pack(fill="x")
        self.lbl_progress = tk.Label(top, text="", bg="#0d0d0d",
                                     fg="#FF6B00", font=("Consolas", 13, "bold"))
        self.lbl_progress.pack(side="left", padx=16)
        self.lbl_file = tk.Label(top, text="", bg="#0d0d0d",
                                 fg="#555", font=("Consolas", 11))
        self.lbl_file.pack(side="left", padx=8)

        tk.Button(top, text="📁  Добавить папку с фото",
                  command=self.add_photo_dir,
                  bg="#1e1e1e", fg="#FF6B00", relief="flat",
                  font=("Arial", 10), cursor="hand2",
                  padx=12, pady=4,
                  activebackground="#2a2a2a", activeforeground="#FF6B00"
                  ).pack(side="right", padx=12)

        # ── Основная область
        main = tk.Frame(self.root, bg="#111")
        main.pack(fill="both", expand=True, padx=10, pady=8)

        # ── Левая: фото + навигация (fill по высоте, фиксированная ширина ~1/3)
        left = tk.Frame(main, bg="#111", width=480)
        left.pack(side="left", fill="y")
        left.pack_propagate(False)

        self.img_label = tk.Label(left, bg="#0a0a0a")
        self.img_label.pack(fill="both", expand=True)

        nav = tk.Frame(left, bg="#111", pady=8)
        nav.pack(fill="x", side="bottom")

        def btn(parent, text, cmd, **kw):
            defaults = dict(bg="#2a2a2a", fg="white", relief="flat",
                            font=("Arial", 12), cursor="hand2",
                            padx=16, pady=9, bd=0,
                            activebackground="#3a3a3a", activeforeground="white")
            defaults.update(kw)
            b = tk.Button(parent, text=text, command=cmd, **defaults)
            b.pack(side="left", padx=4)
            return b

        btn(nav, "◀  Назад",    self.prev_photo)
        btn(nav, "Пропустить",  self.skip_photo, bg="#1e1e1e", fg="#666")

        self.btn_ok = tk.Button(
            nav, text="✓  Сохранить  →", command=self.save_and_next,
            bg="#FF6B00", fg="white", relief="flat",
            font=("Arial", 13, "bold"), cursor="hand2",
            padx=24, pady=9, bd=0,
            activebackground="#e55e00", activeforeground="white"
        )
        self.btn_ok.pack(side="right", padx=4)

        tk.Label(nav, text="Enter / →", bg="#111", fg="#444",
                 font=("Consolas", 10)).pack(side="right", padx=6)

        # ── Правая: категории (fill both, expand)
        right = tk.Frame(main, bg="#111")
        right.pack(side="right", fill="both", expand=True, padx=(12, 0))

        tk.Label(right, text="КАТЕГОРИИ", bg="#111", fg="#FF6B00",
                 font=("Consolas", 11, "bold")).pack(anchor="w", pady=(0, 2))
        tk.Label(right, text="Можно выбрать несколько  •  Enter — сохранить и далее",
                 bg="#111", fg="#555", font=("Arial", 10)).pack(anchor="w", pady=(0, 10))

        # Scrollable canvas для категорий
        cat_wrap = tk.Frame(right, bg="#111")
        cat_wrap.pack(fill="both", expand=True)

        self.cat_canvas = tk.Canvas(cat_wrap, bg="#111", highlightthickness=0)
        sb = tk.Scrollbar(cat_wrap, orient="vertical", command=self.cat_canvas.yview)
        self.cat_inner = tk.Frame(self.cat_canvas, bg="#111")
        self.cat_inner.bind("<Configure>", lambda e: self.cat_canvas.configure(
            scrollregion=self.cat_canvas.bbox("all")))
        self.cat_canvas.create_window((0, 0), window=self.cat_inner, anchor="nw")
        self.cat_canvas.configure(yscrollcommand=sb.set)
        self.cat_canvas.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")
        self.cat_canvas.bind("<MouseWheel>", lambda e:
            self.cat_canvas.yview_scroll(-1*(e.delta//120), "units"))

        # Кнопка + новая категория
        tk.Button(right, text="＋  Добавить категорию",
                  command=self.add_category,
                  bg="#111", fg="#FF6B00", relief="flat",
                  font=("Arial", 11), cursor="hand2",
                  pady=8, activebackground="#1a1a1a"
                  ).pack(fill="x", pady=(8, 0))

        self.lbl_selected = tk.Label(right, text="", bg="#111",
                                     fg="#FF6B00", font=("Arial", 10),
                                     wraplength=400, justify="left")
        self.lbl_selected.pack(anchor="w", pady=(6, 0))

        self._render_categories()

    def _render_categories(self):
        for w in self.cat_inner.winfo_children():
            w.destroy()
        self.check_vars.clear()

        # Три колонки
        cols = [tk.Frame(self.cat_inner, bg="#111") for _ in range(3)]
        for i, c in enumerate(cols):
            c.grid(row=0, column=i, sticky="nsew", padx=(0, 8))
            self.cat_inner.columnconfigure(i, weight=1)

        # Распределение по 3 колонкам:
        # Col 0: Лазерная резка, Гравировка на металле, Фрезерная резка
        # Col 1: УФ-печать, Гравировка на неметаллах, Служебные
        # Col 2: Изделия из фанеры / акрила / дерева
        col_map = {
            "Лазерная резка":                       cols[0],
            "Гравировка на металле":                cols[0],
            "Фрезерная резка":                      cols[0],
            "УФ-печать":                            cols[1],
            "Гравировка на неметаллах":             cols[1],
            "Служебные":                            cols[1],
            "Изделия из фанеры / акрила / дерева":  cols[2],
        }

        # Множество базовых категорий (не удаляемых)
        base_cats = {c for _, cats in CATEGORY_GROUPS for c in cats}

        def delete_extra(group_name, cat_name):
            if not messagebox.askyesno(
                "Удалить категорию",
                f'Удалить «{cat_name}» из группы «{group_name}»?',
                parent=self.root
            ):
                return
            # Убираем из extra
            if group_name in self.extra and cat_name in self.extra[group_name]:
                self.extra[group_name].remove(cat_name)
            # Убираем из CATEGORY_GROUPS в памяти
            for gname, cats in CATEGORY_GROUPS:
                if gname == group_name and cat_name in cats:
                    cats.remove(cat_name)
                    break
            # Убираем из тегов всех уже размеченных фото
            for fname, tags in self.tagged.items():
                if cat_name in tags:
                    tags.remove(cat_name)
            self.state["extra_cats"] = self.extra
            self.state["tagged"]     = self.tagged
            save_state(self.state)
            self._render_categories()
            # Восстанавливаем текущие чеки
            cur = self.tagged.get(os.path.basename(self.photos[self.idx]), [])
            for c, v in self.check_vars.items():
                v.set(c in cur)

        def render_group(parent, group_name, cats):
            extra_set = set(self.extra.get(group_name, []))
            combined  = list(dict.fromkeys(cats + list(extra_set)))
            if group_name != "Служебные":
                combined = sorted(combined, key=lambda s: s.lower())
            tk.Label(parent, text=group_name.upper(),
                     bg="#111", fg="#FF6B00",
                     font=("Consolas", 9, "bold"),
                     anchor="w").pack(fill="x", pady=(12, 3), padx=2)
            for cat in combined:
                is_extra = cat not in base_cats
                row = tk.Frame(parent, bg="#111")
                row.pack(fill="x", pady=1)

                var = tk.BooleanVar()
                self.check_vars[cat] = var
                cb = tk.Checkbutton(
                    row, variable=var, text=cat,
                    bg="#111", fg="#ccc",
                    selectcolor="#2a2a2a",
                    activebackground="#111",
                    activeforeground="white",
                    font=("Arial", 11),
                    cursor="hand2",
                    anchor="w",
                    command=self._update_selected_label
                )
                cb.pack(side="left", fill="x", expand=True, padx=4)

                if is_extra:
                    tk.Button(
                        row, text="×",
                        command=lambda g=group_name, c=cat: delete_extra(g, c),
                        bg="#111", fg="#555",
                        relief="flat", font=("Arial", 12, "bold"),
                        cursor="hand2", padx=4, pady=0,
                        activebackground="#111", activeforeground="#ff4444",
                        bd=0
                    ).pack(side="right", padx=(0, 4))

        for group_name, cats in CATEGORY_GROUPS:
            col = col_map.get(group_name, cols[0])
            render_group(col, group_name, cats)

        tk.Frame(self.cat_inner, bg="#222", height=1).grid(
            row=1, column=0, columnspan=3, sticky="ew", pady=4)

    def _update_selected_label(self):
        selected = self._get_selected()
        if selected:
            self.lbl_selected.config(text="✓ " + "\n✓ ".join(selected))
        else:
            self.lbl_selected.config(text="")

    # ── Фото ─────────────────────────────────────────────────────────────────

    def _show_photo(self):
        if not self.photos:
            return
        path = self.photos[self.idx]
        name = os.path.basename(path)
        done = len(self.tagged)
        total = len(self.photos)

        self.lbl_progress.config(
            text=f"  {self.idx + 1} / {total}  |  Обработано: {done}"
        )
        self.lbl_file.config(text=name)

        self._current_path = path
        self._redraw_image()

        # Восстанавливаем теги
        existing = self.tagged.get(name, [])
        for cat, var in self.check_vars.items():
            var.set(cat in existing)
        self._update_selected_label()

    def _redraw_image(self):
        path = getattr(self, "_current_path", None)
        if not path or not os.path.exists(path):
            return
        try:
            img = Image.open(path)
            img.thumbnail((460, 720), Image.LANCZOS)
            self.img_ref = ImageTk.PhotoImage(img)
            self.img_label.config(image=self.img_ref, text="")
        except Exception as e:
            self.img_label.config(image="", text=f"Ошибка:\n{e}",
                                  fg="red", font=("Arial", 12))

    # ── Действия ─────────────────────────────────────────────────────────────

    def _get_selected(self):
        return [cat for cat, var in self.check_vars.items() if var.get()]

    def _save_current(self):
        name = os.path.basename(self.photos[self.idx])
        selected = self._get_selected()
        if selected:
            self.tagged[name] = selected
        self.state["tagged"] = self.tagged
        self.state["extra_cats"] = self.extra
        save_state(self.state)

    def save_and_next(self):
        self._save_current()
        self._go_next()

    def skip_photo(self):
        self._go_next()

    def _go_next(self):
        if self.idx < len(self.photos) - 1:
            self.idx += 1
            self._show_photo()
        else:
            done = len(self.tagged)
            messagebox.showinfo(
                "Готово!",
                f"Все {len(self.photos)} фото просмотрены.\n"
                f"Обработано: {done}\n\n"
                f"Результат: {RESULTS_FILE}"
            )

    def prev_photo(self):
        if self.idx > 0:
            self.idx -= 1
            self._show_photo()

    def add_category(self):
        # Выбираем группу
        groups = [g for g, _ in CATEGORY_GROUPS if g != "Служебные"]
        win = tk.Toplevel(self.root)
        win.title("Добавить категорию")
        win.configure(bg="#111")
        win.geometry("400x380")
        win.grab_set()

        tk.Label(win, text="Выберите раздел:", bg="#111", fg="white",
                 font=("Arial", 11)).pack(pady=(16, 6))

        group_var = tk.StringVar(value=groups[0])
        for g in groups:
            tk.Radiobutton(win, text=g, variable=group_var, value=g,
                           bg="#111", fg="#ccc", selectcolor="#333",
                           activebackground="#111", font=("Arial", 10)
                           ).pack(anchor="w", padx=20)

        tk.Label(win, text="Название категории:", bg="#111", fg="white",
                 font=("Arial", 11)).pack(pady=(14, 4))
        entry = tk.Entry(win, font=("Arial", 12), bg="#1e1e1e", fg="white",
                         insertbackground="white", relief="flat", bd=6)
        entry.pack(fill="x", padx=20)
        entry.focus()

        def confirm():
            name = entry.get().strip()
            group = group_var.get()
            if not name:
                return
            # Проверка на дубль во всех группах
            all_existing = [c for _, cats in CATEGORY_GROUPS for c in cats]
            all_existing += [c for grp in self.extra.values() for c in grp]
            if name in all_existing:
                messagebox.showwarning("Дубль",
                    f'Категория «{name}» уже существует.', parent=win)
                return
            if group not in self.extra:
                self.extra[group] = []
            self.extra[group].append(name)
            self.state["extra_cats"] = self.extra
            save_state(self.state)
            # Добавляем в CATEGORY_GROUPS в памяти и сортируем
            for gname, cats in CATEGORY_GROUPS:
                if gname == group:
                    cats.append(name)
                    cats.sort(key=lambda s: s.lower())
                    break
            self._render_categories()
            cur = self.tagged.get(os.path.basename(self.photos[self.idx]), [])
            for cat, var in self.check_vars.items():
                var.set(cat in cur)
            win.destroy()

        tk.Button(win, text="Добавить", command=confirm,
                  bg="#FF6B00", fg="white", relief="flat",
                  font=("Arial", 11, "bold"), pady=8, cursor="hand2"
                  ).pack(fill="x", padx=20, pady=14)
        win.bind("<Return>", lambda e: confirm())

    # ── Добавление папки ─────────────────────────────────────────────────────

    def add_photo_dir(self):
        folder = filedialog.askdirectory(
            title="Выберите папку с фотографиями",
            parent=self.root
        )
        if not folder:
            return
        folder = folder.replace("\\", "/")
        if folder in self.dirs:
            messagebox.showinfo("Уже добавлена",
                f"Папка уже в списке:\n{folder}", parent=self.root)
            return

        self.dirs.append(folder)
        self.state["photo_dirs"] = self.dirs
        save_state(self.state)

        # Подгружаем новые фото
        old_count = len(self.photos)
        self.photos = collect_photos(self.dirs)
        new_count   = len(self.photos) - old_count

        messagebox.showinfo("Готово",
            f"Добавлена папка:\n{folder}\n\n"
            f"Новых фото: {new_count}\n"
            f"Всего теперь: {len(self.photos)}",
            parent=self.root
        )
        self._show_photo()

    # ── Горячие клавиши ──────────────────────────────────────────────────────

    def _bind_keys(self):
        self.root.bind("<Right>",       lambda e: self.save_and_next())
        self.root.bind("<Return>",      lambda e: self.save_and_next())
        self.root.bind("<Left>",        lambda e: self.prev_photo())
        self.root.bind("<space>",       lambda e: self.skip_photo())
        self.root.bind("<Escape>",      lambda e: (self._save_current(), self.root.destroy()))
        self.root.bind("<Control-s>",   lambda e: self._save_current())

# ─── Запуск ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    try:
        from PIL import Image, ImageTk
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "-q"])
        from PIL import Image, ImageTk

    root = tk.Tk()
    app = PhotoTagger(root)
    root.mainloop()
