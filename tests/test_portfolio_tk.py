"""Optional real Tk/Pillow smoke. Run under DISPLAY/Xvfb; never contacts production."""
import copy
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@unittest.skipUnless(os.environ.get('DISPLAY') and importlib.util.find_spec('tkinter') and importlib.util.find_spec('PIL'), 'requires real Tk/Pillow and DISPLAY')
class RealTkTests(unittest.TestCase):
    def assert_inside(self, widget, boundary):
        self.assertTrue(widget.winfo_ismapped(), str(widget))
        self.assertGreater(widget.winfo_width(), 1, str(widget))
        self.assertGreater(widget.winfo_height(), 1, str(widget))
        self.assertGreaterEqual(widget.winfo_rootx(), boundary.winfo_rootx(), str(widget))
        self.assertGreaterEqual(widget.winfo_rooty(), boundary.winfo_rooty(), str(widget))
        self.assertLessEqual(widget.winfo_rootx() + widget.winfo_width(), boundary.winfo_rootx() + boundary.winfo_width(), str(widget))
        self.assertLessEqual(widget.winfo_rooty() + widget.winfo_height(), boundary.winfo_rooty() + boundary.winfo_height(), str(widget))

    def test_all_primary_actions_fit_both_tabs_at_default_and_minimum_size(self):
        import tkinter as tk
        import publish_photos as app
        def walk(widget):
            for child in widget.winfo_children():
                yield child
                yield from walk(child)
        with tempfile.TemporaryDirectory() as directory:
            new = Path(directory) / 'NewPhoto'
            new.mkdir()
            app.Image.new('RGB', (480, 640), '#886644').save(new / 'portrait-layout-fixture.jpg')
            with patch.multiple(app, ROOT=directory, NEWDIR=str(new), ASSIGN_FILE=str(new / '.assignments.json'), TAGS_FILE=str(Path(directory) / 'photo_tags.json')):
                root = tk.Tk()
                try:
                    ui = app.PublishApp(root)
                    for size in ('1480x900', '1100x720'):
                        root.geometry(size + '+0+0')
                        for page in (0, 1):
                            ui.notebook.select(page)
                            # Long loaded-state summaries must not steal action space.
                            ui.site_tab.selected = {'photo-' + str(i) + '-long-name.jpg' for i in range(65)}
                            ui.site_tab._selection_summary()
                            root.update()
                            active = root.nametowidget(ui.notebook.select())
                            controls = [w for w in walk(active) if w.winfo_class() in ('Button', 'TButton', 'TCombobox', 'TEntry') and not str(w).startswith(str(ui.cat_inner) + '.')]
                            controls += [ui.btn_publish, ui.lbl_status, ui.log]
                            if page == 1:
                                controls += [ui.site_tab.page_label, ui.site_tab.selection_label, ui.site_tab.tree]
                            else:
                                controls += [ui.cat_canvas]
                            for control in controls:
                                with self.subTest(size=size, page=page, control=str(control)):
                                    parent = control.master
                                    while parent is not None:
                                        self.assert_inside(control, parent)
                                        parent = parent.master
                            if page == 0:
                                for control in walk(ui.cat_inner):
                                    if control.winfo_class() not in ('Button', 'Checkbutton'):
                                        continue
                                    offset = control.winfo_rooty() - ui.cat_inner.winfo_rooty()
                                    ui.cat_canvas.yview_moveto(max(0, offset - 8) / ui.cat_inner.winfo_height())
                                    root.update()
                                    with self.subTest(size=size, category=str(control)):
                                        self.assert_inside(control, ui.cat_canvas)
                                        self.assert_inside(control, root)
                                ui.cat_canvas.yview_moveto(0)
                finally:
                    root.destroy()

    def test_category_editor_scrolls_large_category_set_without_losing_choices(self):
        import tkinter as tk
        import types
        import portfolio_manager_ui as gallery
        root = tk.Tk()
        try:
            owner = types.SimpleNamespace(root=root, busy=False, cancel_pending_operation=lambda: None)
            frame = tk.Frame(root)
            tab = gallery.PortfolioTab(owner, frame, 'unused')
            tab.selected = {'one.jpg'}
            tab.snapshot = {'categories': ['cat' + str(i) for i in range(65)], 'manifest': {'one.jpg': {'categories': ['cat0']}}}
            submitted = []
            tab._apply_categories = submitted.append
            tab._edit_dialog()
            root.update()
            def walk(widget):
                for child in widget.winfo_children():
                    yield child
                    yield from walk(child)
            widgets = list(walk(root))
            scrollbars = [w for w in widgets if w.winfo_class() == 'TScrollbar']
            # Gallery has one scrollbar already; editor must have its own.
            self.assertGreaterEqual(len(scrollbars), 2)
            choices = [w for w in widgets if w.winfo_class() == 'TCheckbutton']
            last = next(w for w in choices if 'cat64' in str(w.cget('text')))
            last.invoke()
            submit = next(w for w in widgets if w.winfo_class() == 'TButton' and str(w.cget('text')).startswith('Показать точные'))
            submit.invoke()
            self.assertEqual(submitted, [['cat0', 'cat64']])
        finally:
            root.destroy()

    def test_confirmation_scrolls_all_65_details_and_defaults_to_cancel(self):
        import tkinter as tk
        import publish_photos as app
        root = tk.Tk()
        try:
            ui = app.PublishApp.__new__(app.PublishApp)
            ui.root = root
            details = '\n\n'.join('p-' + str(i) + '.jpg: a,b → убрать; URL может остаться' for i in range(65))
            observed = {}
            def inspect():
                def walk(widget):
                    for child in widget.winfo_children():
                        yield child
                        yield from walk(child)
                widgets = list(walk(root))
                texts = [w for w in widgets if isinstance(w, tk.Text)]
                if texts:
                    observed['text'] = texts[0].get('1.0', 'end')
                    observed['scroll'] = texts[0].cget('yscrollcommand')
                    warnings = [w for w in widgets if w.winfo_class() == 'TLabel' and 'прям' in str(w.cget('text')).lower() and 'физическ' in str(w.cget('text')).lower()]
                    observed['persistent_warning'] = bool(warnings) and all(w.winfo_ismapped() and w.winfo_rooty() + w.winfo_height() <= texts[0].winfo_rooty() for w in warnings)
                    observed['warning_text'] = ' '.join(str(w.cget('text')) for w in warnings)
                    observed['focus'] = str(root.focus_get())
                buttons = [w for w in widgets if w.winfo_class() in ('TButton', 'Button')]
                cancel = next((w for w in buttons if str(w.cget('text')) == 'Отмена'), None)
                if cancel:
                    cancel.invoke()
                else:
                    for w in root.winfo_children():
                        if isinstance(w, tk.Toplevel):
                            w.destroy()
            root.after(40, inspect)
            approved = ui._confirm_changes(details)
            self.assertFalse(approved)
            self.assertIn('p-64.jpg', observed['text'])
            self.assertIn('p-0.jpg', observed['text'])
            self.assertTrue(observed['scroll'])
            self.assertTrue(observed['persistent_warning'], 'asset/direct-URL warning must remain above scrolling details')
            self.assertIn('URL', observed['warning_text'])
            for i in range(65):
                self.assertIn('p-' + str(i) + '.jpg:', observed['text'])
        finally:
            root.destroy()

    def test_gallery_thumbnails_are_bounded_cached_and_lazy(self):
        import tkinter as tk
        import types
        import io
        import hashlib
        import time
        from PIL import Image
        import portfolio_manager_ui as gallery
        import portfolio_manager as manager
        stream = io.BytesIO()
        Image.new('RGB', (200, 100), '#ff6b00').save(stream, format='PNG')
        data = stream.getvalue()
        sha = hashlib.sha256(data).hexdigest()
        root = tk.Tk()
        try:
            owner = types.SimpleNamespace(root=root, busy=False, _update_publish_btn=lambda: None, cancel_pending_operation=lambda: None)
            frame = tk.Frame(root)
            frame.pack(fill='both', expand=True)
            tab = gallery.PortfolioTab(owner, frame, 'unused')
            snap = {'sha': 'a'*40, 'categories': ['a'], 'manifest': {f'p-{i}.png': {'categories': ['a']} for i in range(65)},
                    'hashes': {f'p-{i}.png': sha for i in range(65)}, 'history': manager.empty_history()}
            requests = []
            deadline = time.monotonic() + 5
            def fetched(url, deadline, limit):
                requests.append(url)
                return data
            with patch.object(gallery.safe, 'http_bytes', side_effect=fetched):
                tab._catalog_loaded(snap, None, 'fixture not deployed')
                def check():
                    if not getattr(tab, '_thumbnail_running', False) or time.monotonic() >= deadline:
                        root.quit()
                    else:
                        root.after(10, check)
                root.after(10, check)
                root.mainloop()
                self.assertEqual(len(requests), 12, 'only first page may download thumbnails')
                self.assertEqual(len(tab.thumbnails), 12)
                self.assertTrue(all(tab.tree.item(n, 'image') for n in tab.tree.get_children()))
                tab._render()
                self.assertEqual(len(requests), 12, 'rerender must reuse cache')
        finally:
            root.destroy()

    def test_two_tabs_gallery_filter_multiselect_busy_and_confirmation(self):
        import tkinter as tk
        import publish_photos as app
        import portfolio_manager as manager
        with tempfile.TemporaryDirectory() as directory:
            new = Path(directory) / 'NewPhoto'
            new.mkdir()
            app.safe_publisher.atomic_json(new / '.assignments.json', {'missing.jpg': ['original unknown']})
            with patch.multiple(app, ROOT=directory, NEWDIR=str(new), ASSIGN_FILE=str(new / '.assignments.json'), TAGS_FILE=str(Path(directory) / 'photo_tags.json')):
                root = tk.Tk()
                try:
                    ui = app.PublishApp(root)
                    root.update()
                    self.assertEqual([ui.notebook.tab(t, 'text') for t in ui.notebook.tabs()], ['Новые фото', 'Фото на сайте'])
                    tab = ui.site_tab
                    snap = {'sha': 'a'*40, 'remote': 'fixture', 'categories': ['a', 'b'], 'labels': {'a': 'A', 'b': 'B'},
                            'manifest': {'one.jpg': {'categories': ['a', 'b'], 'order': {'a': 1, 'b': 3}}, 'two.jpg': {'categories': ['a'], 'order': {'a': 2}}},
                            'hashes': {'one.jpg': '1'*64, 'two.jpg': '2'*64}, 'history': manager.empty_history()}
                    index = {'version': 1, 'categories': {'a': ['one.jpg', 'two.jpg'], 'b': ['one.jpg']}, 'sha256': snap['hashes']}
                    snap['expected_index'] = copy.deepcopy(index)
                    with patch.object(tab, '_load_thumbnails'):
                        tab._catalog_loaded(copy.deepcopy(snap), index, None)
                        self.assertIn('соответствует main', tab.status.get())
                        stale = copy.deepcopy(index)
                        stale['categories']['a'].reverse()
                        tab._catalog_loaded(copy.deepcopy(snap), stale, None)
                        self.assertIn('отличается', tab.status.get())
                        tab._catalog_loaded(copy.deepcopy(snap), index, None)
                        self.assertIn('A — a', tab.category_box['values'])
                        self.assertEqual(len(tab.tree.get_children()), 2)
                        tab.tree.selection_set(['one.jpg', 'two.jpg'])
                        tab._selection_changed()
                        self.assertEqual(tab.selected, {'one.jpg', 'two.jpg'})
                        tab.search.set('one')
                        tab._render()
                        self.assertEqual(tab.tree.get_children(), ('one.jpg',))
                        self.assertEqual(tab.selected, {'one.jpg', 'two.jpg'})
                        tab.search.set('')
                        tab.category.set('B — b')
                        tab._render()
                        self.assertEqual(tab.tree.get_children(), ('one.jpg',))
                    before = copy.deepcopy(ui.assign)
                    with patch.object(ui, '_confirm_changes', return_value=False) as confirm:
                        tab._remove_all()
                        self.assertIn('one.jpg', confirm.call_args.args[0])
                        self.assertIn('URL', confirm.call_args.args[0])
                    self.assertFalse(app.safe_publisher.load_batch(new))
                    ui.busy = True
                    ui._update_publish_btn()
                    self.assertEqual(str(tab.remove_all_button['state']), 'disabled')
                    ui.busy = False
                    ui._update_publish_btn()
                    self.assertEqual(ui.assign, before)
                finally:
                    root.destroy()


if __name__ == '__main__':
    unittest.main()
