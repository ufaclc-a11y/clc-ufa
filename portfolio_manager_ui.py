"""Tk site-gallery tab. No network or GUI creation at import time."""
import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
import io
import hashlib
from collections import OrderedDict
from PIL import Image, ImageTk
import portfolio_manager as manager
import safe_photo_publisher as safe


class PortfolioTab:
    PAGE_SIZE = 12

    def __init__(self, owner, frame, root_path):
        self.owner, self.frame, self.root_path = owner, frame, root_path
        self.snapshot = None
        self.selected = set()
        self.page = 0
        self.generation = 0
        self.thumbnails = OrderedDict()
        self.status = tk.StringVar(value='Каталог не загружен. Нажмите «Свежий каталог main». Локальные данные не считаются текущим сайтом.')
        frame.columnconfigure(0, weight=1)
        frame.rowconfigure(3, weight=1)
        status_label = ttk.Label(frame, textvariable=self.status, wraplength=1000)
        status_label.grid(row=0, column=0, sticky='ew', padx=14, pady=(12, 6))
        filters = ttk.Frame(frame)
        filters.grid(row=1, column=0, sticky='ew', padx=14, pady=6)
        ttk.Button(filters, text='Свежий каталог main', command=self.refresh).pack(side='left', padx=(0, 16))
        ttk.Button(frame, text='Отменить непринятое изменение (проверка main)…', command=owner.cancel_pending_operation).grid(row=2, column=0, sticky='w', padx=14)
        ttk.Label(filters, text='Поиск имени / подписи:').pack(side='left')
        self.search = tk.StringVar()
        search = ttk.Entry(filters, textvariable=self.search, width=28)
        search.pack(side='left', padx=8)
        search.bind('<Return>', lambda event: self._filter())
        ttk.Button(filters, text='Найти', command=self._filter).pack(side='left')
        self.category = tk.StringVar(value='Все категории')
        self.category_box = ttk.Combobox(filters, textvariable=self.category, values=['Все категории'], state='readonly', width=30)
        self.category_box.pack(side='left', padx=12)
        self.category_box.bind('<<ComboboxSelected>>', lambda event: self._filter())
        body = ttk.Frame(frame)
        body.grid(row=3, column=0, sticky='nsew', padx=14, pady=6)
        style = ttk.Style(frame)
        style.configure('Portfolio.Treeview', rowheight=72)
        self.tree = ttk.Treeview(body, columns=('categories',), selectmode='extended', style='Portfolio.Treeview')
        self.tree.heading('#0', text='Миниатюра / файл (Ctrl / Shift — несколько)')
        self.tree.heading('categories', text='Категории main')
        self.tree.column('#0', width=470)
        self.tree.column('categories', width=420)
        scroll = ttk.Scrollbar(body, orient='vertical', command=self.tree.yview)
        self.tree.configure(yscrollcommand=scroll.set)
        self.tree.pack(side='left', fill='both', expand=True)
        scroll.pack(side='right', fill='y')
        self.tree.bind('<<TreeviewSelect>>', lambda event: self._selection_changed())
        navigation = ttk.Frame(frame)
        navigation.grid(row=4, column=0, sticky='ew', padx=14, pady=4)
        ttk.Button(navigation, text='← Страница', command=lambda: self._page(-1)).pack(side='left')
        ttk.Button(navigation, text='Страница →', command=lambda: self._page(1)).pack(side='left', padx=5)
        self.page_label = ttk.Label(navigation)
        self.page_label.pack(side='left', padx=12)
        ttk.Button(navigation, text='Выбрать все найденные', command=self._select_filtered).pack(side='left', padx=5)
        ttk.Button(navigation, text='Снять выбор', command=self._clear).pack(side='left', padx=5)
        self.selection_label = ttk.Label(frame, text='Выбрано: 0', wraplength=1300)
        self.selection_label.grid(row=5, column=0, sticky='ew', padx=14, pady=5)
        frame.bind('<Configure>', lambda event: self.selection_label.configure(wraplength=max(100, event.width - 28)))
        actions = ttk.Frame(frame)
        actions.grid(row=6, column=0, sticky='ew', padx=14, pady=(4, 12))
        actions.columnconfigure((0, 1), weight=1)
        ttk.Button(actions, text='Изменить категории…', command=self._edit_dialog).grid(row=0, column=0, sticky='ew', padx=(0, 7), pady=3)
        ttk.Button(actions, text='Убрать из категории фильтра…', command=self._remove_category).grid(row=0, column=1, sticky='ew', padx=7, pady=3)
        self.remove_all_button = ttk.Button(actions, text='Убрать из всего портфолио…', command=self._remove_all)
        self.remove_all_button.grid(row=1, column=0, sticky='ew', padx=(0, 7), pady=3)
        ttk.Button(actions, text='Журнал / восстановить…', command=self._history_dialog).grid(row=1, column=1, sticky='ew', padx=7, pady=3)
        self._rendering = False

    def invalidate(self, detail):
        self.snapshot = None
        self.generation += 1
        self.status.set(detail + ' Старый список — только справочный, не свежий каталог.')

    def refresh(self):
        if self.owner.busy:
            return
        self.owner.busy = True
        self.owner._update_publish_btn()
        self.invalidate('Читаю свежий Git main и полный индекс живого сайта…')
        threading.Thread(target=self._refresh_worker, daemon=True).start()

    def _refresh_worker(self):
        snapshot, index, error = None, None, None
        try:
            snapshot = manager.read_catalog(self.root_path)
            try:
                index = safe.public_index('https://clc-ufa.ru', time.monotonic() + 20)
            except Exception as exc:
                error = str(exc)
        except Exception as exc:
            error = str(exc)
        self.owner.root.after(0, lambda: self._catalog_loaded(snapshot, index, error))

    def _catalog_loaded(self, snapshot, live_index, error):
        self.owner.busy = False
        self.owner._update_publish_btn()
        self.snapshot = snapshot
        if snapshot is None:
            self.status.set('Каталог не обновлён: ' + str(error) + '. Старый список не считается текущим.')
            return
        self.selected.clear()
        self.page = 0
        self.thumbnails.clear()
        choices = ['Все категории'] + [snapshot.get('labels', {}).get(c, c) + ' — ' + c for c in snapshot['categories']]
        self.category_box.configure(values=choices)
        if self.category.get() not in choices:
            self.category.set('Все категории')
        # Only exact exhaustive generator parity proves this catalog is live.
        live = live_index is not None and live_index == snapshot.get('expected_index')
        detail = 'Живой сайт соответствует main' if live else 'main прочитан; живой сайт отличается / ещё не подтверждён'
        self.status.set(detail + ' ' + snapshot['sha'][:12] + ('. ' + str(error) if error else ''))
        self._render()

    def _category_id(self):
        return self.category.get().rsplit(' — ', 1)[-1]

    def _filtered(self):
        if not self.snapshot:
            return []
        query = self.search.get().strip().casefold()
        cat = self._category_id()
        return [name for name, meta in self.snapshot['manifest'].items()
                if (cat == 'Все категории' or cat in meta['categories'])
                and (not query or query in (name + ' ' + str(meta.get('caption', ''))).casefold())]

    def _filter(self):
        if self.owner.busy:
            return
        self.page = 0
        self._render()

    def _render(self):
        if self.owner.busy:
            return
        names = self._filtered()
        self.page = min(self.page, max(0, (len(names) - 1) // self.PAGE_SIZE))
        page = names[self.page * self.PAGE_SIZE:(self.page + 1) * self.PAGE_SIZE]
        self.generation += 1
        self._rendering = True
        self.tree.delete(*self.tree.get_children())
        for name in page:
            meta = self.snapshot['manifest'][name]
            self.tree.insert('', 'end', iid=name, text=name, values=(', '.join(meta['categories']),))
        self.tree.selection_set([name for name in page if name in self.selected])
        self._rendering = False
        self.page_label.configure(text=f'{self.page + 1} / {max(1, (len(names) + self.PAGE_SIZE - 1) // self.PAGE_SIZE)} · найдено {len(names)}')
        self._selection_summary()
        self._load_thumbnails(page, self.generation)

    def _selection_changed(self):
        if self.owner.busy or self._rendering:
            return
        visible = set(self.tree.get_children())
        self.selected.difference_update(visible)
        self.selected.update(self.tree.selection())
        self._selection_summary()

    def _selection_summary(self):
        preview = ', '.join(sorted(self.selected)[:8])
        if len(self.selected) > 8:
            preview += ' … (полный список в подтверждении)'
        self.selection_label.configure(text=f'Выбрано: {len(self.selected)} · {preview}')

    def _page(self, delta):
        if not self.owner.busy:
            self.page = max(0, self.page + delta)
            self._render()

    def _select_filtered(self):
        if not self.owner.busy:
            self.selected.update(self._filtered())
            self._render()

    def _clear(self):
        if not self.owner.busy:
            self.selected.clear()
            self._render()

    def _load_thumbnails(self, names, generation):
        if not self.snapshot:
            return
        pending = []
        for name in names[:self.PAGE_SIZE]:
            cached = self.thumbnails.get(name)
            sha = self.snapshot['hashes'][name]
            if cached and cached[0] == sha:
                self.tree.item(name, image=cached[1])
                self.thumbnails.move_to_end(name)
            else:
                pending.append((name, sha))
        self._thumbnail_request = (pending, generation)
        if pending and not getattr(self, '_thumbnail_running', False):
            self._thumbnail_running = True
            threading.Thread(target=self._thumbnail_worker, args=(pending, generation), daemon=True).start()

    def _post(self, callback):
        try:
            self.owner.root.after(0, callback)
        except (RuntimeError, tk.TclError):
            # Window already closed; any owned HTTP subprocess has already ended.
            pass

    def _thumbnail_worker(self, pending, generation):
        from urllib.parse import quote
        try:
            for name, sha in pending:
                if generation != self.generation:
                    break
                try:
                    body = safe.http_bytes('https://clc-ufa.ru/images/portfolio/' + quote(safe.safe_name(name)),
                                           time.monotonic() + 8, 8 * 1024 * 1024)
                    if hashlib.sha256(body).hexdigest() != sha:
                        continue  # Unreleased main images must not display unrelated live bytes.
                    with Image.open(io.BytesIO(body)) as image:
                        image.thumbnail((88, 64), Image.Resampling.LANCZOS)
                        thumb = io.BytesIO()
                        image.convert('RGB').save(thumb, format='PNG')
                    data = thumb.getvalue()
                    self._post(lambda n=name, s=sha, d=data: self._receive_thumbnail(n, s, d, generation))
                except Exception:
                    continue  # Thumbnail failure never mutates data or proves publication.
        finally:
            self._post(lambda: self._thumbnails_finished(generation))

    def _receive_thumbnail(self, name, sha, data, generation):
        if generation != self.generation or not self.snapshot or self.snapshot['hashes'].get(name) != sha:
            return
        with Image.open(io.BytesIO(data)) as image:
            photo = ImageTk.PhotoImage(image, master=self.frame)
        self.thumbnails[name] = (sha, photo)
        self.thumbnails.move_to_end(name)
        while len(self.thumbnails) > self.PAGE_SIZE * 2:
            self.thumbnails.popitem(last=False)
        if self.tree.exists(name):
            self.tree.item(name, image=photo)

    def _thumbnails_finished(self, generation):
        self._thumbnail_running = False
        pending, requested = self._thumbnail_request
        if requested != generation and pending and self.snapshot:
            self._load_thumbnails([name for name, _ in pending], requested)

    def _edit_dialog(self):
        if self.owner.busy or not self.snapshot or not self.selected:
            return
        dialog = tk.Toplevel(self.frame)
        dialog.title('Категории выбранных фото')
        dialog.geometry('760x720')
        dialog.grab_set()
        ttk.Label(dialog, text='Выбранный набор заменит категории КАЖДОГО выбранного фото.\nСнимок ниже не изменяется до окончательного подтверждения.', wraplength=700).pack(padx=14, pady=12)
        common = set.intersection(*(set(self.snapshot['manifest'][n]['categories']) for n in self.selected))
        variables = {}
        body = ttk.Frame(dialog)
        body.pack(fill='both', expand=True, padx=14)
        canvas = tk.Canvas(body, highlightthickness=0)
        scroll = ttk.Scrollbar(body, orient='vertical', command=canvas.yview)
        canvas.configure(yscrollcommand=scroll.set)
        grid = ttk.Frame(canvas)
        canvas.create_window((0, 0), window=grid, anchor='nw')
        grid.bind('<Configure>', lambda event: canvas.configure(scrollregion=canvas.bbox('all')))
        canvas.pack(side='left', fill='both', expand=True)
        scroll.pack(side='right', fill='y')
        for index, cat in enumerate(self.snapshot['categories']):
            value = tk.BooleanVar(value=cat in common)
            variables[cat] = value
            label = self.snapshot.get('labels', {}).get(cat, cat)
            ttk.Checkbutton(grid, text=label + ' (' + cat + ')', variable=value).grid(row=index, column=0, sticky='w', padx=4, pady=3)
        def apply():
            cats = [cat for cat, value in variables.items() if value.get()]
            dialog.destroy()
            self._apply_categories(cats)
        ttk.Button(dialog, text='Показать точные изменения…', command=apply).pack(pady=12)

    def _history_dialog(self):
        if self.owner.busy or not self.snapshot:
            return
        dialog = tk.Toplevel(self.frame)
        dialog.title('Журнал main — восстановление связей')
        dialog.geometry('1000x650')
        dialog.grab_set()
        ttk.Label(dialog, text='Возврат только выбранного действия. Более позднее изменение тех же фото блокирует возврат.').pack(padx=12, pady=12)
        tree = ttk.Treeview(dialog, columns=('action', 'files'), show='headings', selectmode='browse')
        tree.heading('action', text='Действие / возврат')
        tree.heading('files', text='Фото и изменения категорий')
        tree.column('action', width=240)
        tree.column('files', width=700)
        tree.pack(fill='both', expand=True, padx=12)
        for action in reversed(self.snapshot['history']['actions']):
            details = []
            for name, change in action['changes'].items():
                details.append(name + ': ' + ','.join((change['before'] or {}).get('categories', [])) + ' → ' + ','.join((change['after'] or {}).get('categories', [])))
            tree.insert('', 'end', iid=action['id'], values=(('Возврат ' + action['undo_of'][:8] if action.get('undo_of') else 'Изменение') + ' ' + action['id'][:12], '; '.join(details)))
        def restore():
            chosen = tree.selection()
            if chosen:
                dialog.destroy()
                self._restore_action(chosen[0])
        ttk.Button(dialog, text='Восстановить состояние ДО выбранного действия…', command=restore).pack(pady=12)

    def _apply_categories(self, categories):
        if self.owner.busy or not self.snapshot:
            return
        try:
            operation = manager.prepare_edit(self.snapshot, sorted(self.selected), categories)
            self.owner._submit_operation(operation)
        except (ValueError, KeyError, RuntimeError) as error:
            messagebox.showerror('Изменения не подготовлены', str(error))

    def _remove_all(self):
        self._apply_categories([])

    def _remove_category(self):
        if self.owner.busy or not self.snapshot:
            return
        cat = self._category_id()
        if cat == 'Все категории':
            messagebox.showerror('Выберите категорию', 'Сначала выберите конкретную категорию в фильтре.')
            return
        try:
            combined = None
            for name in sorted(self.selected):
                cats = self.snapshot['manifest'][name]['categories']
                if cat not in cats:
                    continue
                part = manager.prepare_edit(self.snapshot, [name], [c for c in cats if c != cat])
                if combined is None:
                    combined = part
                else:
                    combined['changes'].update(part['changes'])
            if combined is None:
                raise ValueError('Нет выбранных фото в этой категории')
            self.owner._submit_operation(combined)
        except (ValueError, KeyError, RuntimeError) as error:
            messagebox.showerror('Изменения не подготовлены', str(error))

    def _restore_action(self, action_id):
        if self.owner.busy or not self.snapshot:
            return
        try:
            self.owner._submit_operation(manager.prepare_undo(self.snapshot, action_id))
        except (ValueError, KeyError, RuntimeError) as error:
            messagebox.showerror('Восстановление остановлено', str(error))
