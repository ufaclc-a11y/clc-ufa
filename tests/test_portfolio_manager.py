"""Offline unified manager witnesses. Real core/GUI methods, local Git/HTTP only."""
import copy
import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


class MutationTests(unittest.TestCase):
    def test_edit_preserves_unrelated_order_metadata_and_freezes_remote_scope(self):
        import portfolio_manager as manager
        original = {'one.jpg': {'categories': ['a', 'b'], 'order': {'a': 2, 'b': 8, 'unknown historical key': 42}, 'caption': 'keep'}}
        snapshot = {'manifest': original, 'hashes': {'one.jpg': '1'*64}, 'history': manager.empty_history(), 'remote': 'fixture://exact-remote'}
        op = manager.prepare_edit(snapshot, ['one.jpg'], ['b'])
        self.assertEqual(op.get('remote'), snapshot['remote'])
        result, journal = manager.apply_operation(original, snapshot['history'], op)
        self.assertEqual(result['one.jpg']['order'], {'b': 8, 'unknown historical key': 42})
        undo = manager.prepare_undo(dict(snapshot, manifest=result, history=journal), op['id'])
        self.assertEqual(undo.get('remote'), snapshot['remote'])

    def test_remove_one_all_and_undo_preserve_metadata_order_and_unrelated_changes(self):
        import portfolio_manager as manager
        original = {'one.jpg': {'categories': ['a', 'b'], 'order': {'a': -7, 'b': 9}, 'caption': 'keep'},
                    'two.jpg': {'categories': ['a'], 'order': {'a': 2}, 'extra': [1]}}
        snapshot = {'manifest': copy.deepcopy(original), 'history': manager.empty_history(),
                    'hashes': {'one.jpg': '1'*64, 'two.jpg': '2'*64}, 'sha': 'a'*40}
        op = manager.prepare_edit(snapshot, ['one.jpg'], ['b'])
        manifest, history = manager.apply_operation(original, snapshot['history'], op)
        self.assertEqual(manifest['one.jpg'], {'categories': ['b'], 'order': {'b': 9}, 'caption': 'keep'})
        manifest['two.jpg']['extra'] = ['later']
        snap2 = dict(snapshot, manifest=manifest, history=history)
        undo = manager.prepare_undo(snap2, op['id'])
        restored, history2 = manager.apply_operation(manifest, history, undo)
        self.assertEqual(restored['one.jpg'], original['one.jpg'])
        self.assertEqual(restored['two.jpg']['extra'], ['later'])
        allop = manager.prepare_edit(dict(snapshot, manifest=restored, history=history2), ['one.jpg'], [])
        removed, journal = manager.apply_operation(restored, history2, allop)
        self.assertNotIn('one.jpg', removed)
        back, _ = manager.apply_operation(removed, journal, manager.prepare_undo(dict(snapshot, manifest=removed, history=journal), allop['id']))
        self.assertEqual(back, restored)
        self.assertEqual(original['two.jpg']['extra'], [1])


class GitMutationTests(unittest.TestCase):
    from test_safe_publisher import GitTests as _Fixture
    setUp = _Fixture.setUp
    git = staticmethod(_Fixture.git)

    def test_sparse_publication_and_catalog_never_hydrate_unrelated_assets_keep_ancestry(self):
        import portfolio_manager as manager
        import safe_photo_publisher as core
        from unittest.mock import patch
        other = Path(self.temp.name) / 'seed-sparse'
        self.git(self.repo, 'clone', '--branch', 'main', str(self.remote), str(other))
        self.git(other, 'config', 'user.name', 'Seeder')
        self.git(other, 'config', 'user.email', 'seeder@example.invalid')
        for folder in ('temporary screenshots', 'public/videos'):
            (other / folder).mkdir(parents=True)
            (other / folder / 'never-hydrate.bin').write_bytes(b'fixture for huge unrelated asset')
        self.git(other, 'add', '.')
        self.git(other, 'commit', '-m', 'unrelated assets')
        self.git(other, 'push', 'origin', 'main')
        real_git = core.git
        checked = []
        def inspect_checkout(cwd, *args, **kwargs):
            result = real_git(cwd, *args, **kwargs)
            if args[0] == 'checkout':
                checked.append(True)
                self.assertFalse((Path(cwd) / 'temporary screenshots/never-hydrate.bin').exists())
                self.assertFalse((Path(cwd) / 'public/videos/never-hydrate.bin').exists())
                self.assertTrue((Path(cwd) / 'public/images/portfolio/old.jpg').exists())
                self.assertEqual(real_git(cwd, 'rev-parse', '--is-shallow-repository').stdout.strip(), 'false')
            return result
        with patch.object(core, 'git', side_effect=inspect_checkout):
            snapshot = manager.read_catalog(self.repo)
            core.publish_batch(self.repo, self.new, manager.prepare_edit(snapshot, ['old.jpg'], []))
        self.assertEqual(len(checked), 2)
        self.assertIn('temporary screenshots/never-hydrate.bin', self.git(self.remote, 'ls-tree', '-r', '--name-only', 'main'))

    def test_unrelated_concurrent_journal_append_survives_nonfastforward_retry(self):
        import portfolio_manager as manager
        import safe_photo_publisher as core
        from unittest.mock import patch
        other = Path(self.temp.name) / 'seed-other'
        self.git(self.repo, 'clone', '--branch', 'main', str(self.remote), str(other))
        self.git(other, 'config', 'user.name', 'Seeder')
        self.git(other, 'config', 'user.email', 'seeder@example.invalid')
        manifest = copy.deepcopy(self.base_manifest)
        manifest['other.jpg'] = {'categories': ['a'], 'order': {'a': 100}, 'caption': 'other metadata'}
        manifest['untouched.jpg'] = {'categories': ['a'], 'order': {'a': 200}, 'unknown': {'retain': [1, 2]}}
        for name in ('other.jpg', 'untouched.jpg'):
            (other / 'public/images/portfolio' / name).write_bytes(name.encode())
        (other / 'data/portfolio-tags.json').write_text(json.dumps(manifest))
        self.git(other, 'add', '.')
        self.git(other, 'commit', '-m', 'seed other targets')
        self.git(other, 'push', 'origin', 'main')
        snapshot = manager.read_catalog(self.repo)
        ours = manager.prepare_edit(snapshot, ['old.jpg'], [])
        theirs = manager.prepare_edit(snapshot, ['other.jpg'], [])
        real_git = core.git
        raced = []
        def racing(cwd, *args, **kwargs):
            if args[0] == 'push' and not raced:
                raced.append(True)
                remote_new = Path(self.temp.name) / 'other-receipt'
                remote_new.mkdir()
                core.publish_batch(self.repo, remote_new, theirs)
            return real_git(cwd, *args, **kwargs)
        with patch.object(core, 'git', side_effect=racing):
            core.publish_batch(self.repo, self.new, ours)
        result = json.loads(self.git(self.remote, 'show', 'main:data/portfolio-tags.json'))
        self.assertEqual(result, {'untouched.jpg': manifest['untouched.jpg']})
        journal = json.loads(self.git(self.remote, 'show', 'main:data/portfolio-history.json'))
        self.assertEqual([a['id'] for a in journal['actions']], [theirs['id'], ours['id']])
        undo = manager.prepare_undo(manager.read_catalog(self.repo), ours['id'])
        core.publish_batch(self.repo, self.new, undo)
        result = json.loads(self.git(self.remote, 'show', 'main:data/portfolio-tags.json'))
        self.assertEqual(result['old.jpg'], manifest['old.jpg'])
        self.assertNotIn('other.jpg', result)

    def test_real_lost_push_ack_has_one_destructive_commit_and_one_journal_action(self):
        import portfolio_manager as manager
        import safe_photo_publisher as core
        from unittest.mock import patch
        import subprocess
        op = manager.prepare_edit(manager.read_catalog(self.repo), ['old.jpg'], [])
        real_git = core.git
        pushes = []
        def ambiguous(cwd, *args, **kwargs):
            if args[0] == 'push':
                self.assertEqual(core.load_batch(self.new)['candidate_sha'], real_git(cwd, 'rev-parse', 'HEAD').stdout.strip())
                result = real_git(cwd, *args, **kwargs)
                self.assertEqual(result.returncode, 0)
                pushes.append(True)
                return subprocess.CompletedProcess(result.args, 1, '', 'lost ACK after actual acceptance')
            return real_git(cwd, *args, **kwargs)
        with patch.object(core, 'git', side_effect=ambiguous):
            sha = core.publish_batch(self.repo, self.new, op)
        self.assertEqual(len(pushes), 1)
        self.assertEqual(self.git(self.remote, 'rev-parse', 'main'), sha)
        journal = json.loads(self.git(self.remote, 'show', 'main:data/portfolio-history.json'))
        self.assertEqual([a['id'] for a in journal['actions']], [op['id']])
        self.assertEqual(core.publish_batch(self.repo, self.new, op), sha)

    def test_target_race_conflict_can_cancel_only_proven_unaccepted_operation(self):
        import portfolio_manager as manager
        import safe_photo_publisher as core
        from unittest.mock import patch
        op = manager.prepare_edit(manager.read_catalog(self.repo), ['old.jpg'], [])
        real_git = core.git
        raced = []
        def racing(cwd, *args, **kwargs):
            if args[0] == 'push' and not raced:
                raced.append(True)
                other = Path(self.temp.name) / 'editor'
                self.git(self.repo, 'clone', '--branch', 'main', str(self.remote), str(other))
                self.git(other, 'config', 'user.name', 'Editor')
                self.git(other, 'config', 'user.email', 'editor@example.invalid')
                manifest = copy.deepcopy(self.base_manifest)
                manifest['old.jpg']['caption'] = 'concurrent target edit'
                (other / 'data/portfolio-tags.json').write_text(json.dumps(manifest))
                self.git(other, 'add', '.')
                self.git(other, 'commit', '-m', 'target race')
                self.git(other, 'push', 'origin', 'main')
            return real_git(cwd, *args, **kwargs)
        with patch.object(core, 'git', side_effect=racing):
            with self.assertRaisesRegex(RuntimeError, 'conflict'):
                core.publish_batch(self.repo, self.new, op)
        before = self.git(self.remote, 'rev-parse', 'main')
        self.assertIsNotNone(op['candidate_sha'])
        manager.cancel_operation(self.repo, self.new)
        self.assertTrue(core.load_batch(self.new)['cancelled'])
        self.assertTrue(core.load_batch(self.new)['complete'])
        self.assertEqual(self.git(self.remote, 'rev-parse', 'main'), before)
        fresh = manager.read_catalog(self.repo)
        self.assertEqual(fresh['manifest']['old.jpg']['caption'], 'concurrent target edit')
        accepted = manager.prepare_edit(fresh, ['old.jpg'], [])
        core.publish_batch(self.repo, self.new, accepted)
        with self.assertRaisesRegex(RuntimeError, 'accepted'):
            manager.cancel_operation(self.repo, self.new)
        self.assertFalse(core.load_batch(self.new)['complete'])

    def test_fresh_catalog_scoped_delete_retry_undo_and_stale_upload_tombstone(self):
        import safe_photo_publisher as core
        import portfolio_manager as manager
        # Discard only fixture pending status, not originals or tags.
        self.batch['complete'] = True
        core.save_batch(self.new, self.batch)
        snapshot = manager.read_catalog(self.repo)
        self.assertEqual(snapshot['manifest'], self.base_manifest)
        self.assertEqual(snapshot.get('expected_index', {}).get('categories'), {'a': ['old.jpg']})
        op = manager.prepare_edit(snapshot, ['old.jpg'], [])
        core.save_batch(self.new, op)
        sha = core.publish_batch(self.repo, self.new, op)
        self.assertEqual(core.load_batch(self.new)['version'], 2)
        self.assertEqual(core.publish_batch(self.repo, self.new, op), sha)
        self.assertEqual(json.loads(self.git(self.remote, 'show', 'main:data/portfolio-tags.json')), {})
        self.assertEqual(self.git(self.remote, 'show', 'main:public/images/portfolio/old.jpg'), 'old')
        stale = copy.deepcopy(self.batch)
        stale['complete'] = False
        stale['items'][0]['dest'] = 'old.jpg'
        stale['items'][0]['payload_sha256'] = core.digest(self.repo / 'public/images/portfolio/old.jpg')
        (self.new / '.publisher/payload/old.jpg').write_bytes(b'old')
        with self.assertRaisesRegex(RuntimeError, 'removed|tombstone'):
            core.publish_batch(self.repo, self.new, stale)
        op['complete'] = True
        core.save_batch(self.new, op)
        fresh = manager.read_catalog(self.repo)
        undo = manager.prepare_undo(fresh, op['id'])
        core.save_batch(self.new, undo)
        restored_sha = core.publish_batch(self.repo, self.new, undo)
        self.assertNotEqual(restored_sha, sha)
        self.assertEqual(json.loads(self.git(self.remote, 'show', 'main:data/portfolio-tags.json')), self.base_manifest)
        with self.assertRaisesRegex(RuntimeError, 'conflict'):
            core.publish_batch(self.repo, self.new, manager.prepare_edit(snapshot, ['old.jpg'], []))


class FullIndexTests(unittest.TestCase):
    from test_safe_publisher import HttpTests as _Fixture
    setUp = _Fixture.setUp
    assert_workers_reaped = _Fixture.assert_workers_reaped

    def test_65_same_category_exhaustive_index_hashes_and_fail_closed_mismatch(self):
        import hashlib
        import safe_photo_publisher as core
        sha = hashlib.sha256(self.image).hexdigest()
        names = ['p-' + str(i) + '.jpg' for i in range(65)]
        index = {'version': 1, 'categories': {'a': names}, 'sha256': {n: sha for n in names}}
        self.html = json.dumps(index)
        batch = {'items': [{'dest': n, 'categories': ['a'], 'payload_sha256': sha} for n in names],
                 'expected_index': copy.deepcopy(index)}
        core.verify_live(batch, self.base, timeout=20)
        self.assertEqual(sum(p.startswith('/images/') for p, _ in self.requests), 65)
        self.html = '<html>old 48 preview only</html>'
        with self.assertRaisesRegex(RuntimeError, 'index'):
            core.verify_live(batch, self.base, timeout=2)
        index['categories']['a'].pop()
        self.html = json.dumps(index)
        with self.assertRaisesRegex(RuntimeError, 'index'):
            core.verify_live(batch, self.base, timeout=2)
        self.html = json.dumps(batch['expected_index'])
        self.image = b'wrong'
        with self.assertRaisesRegex(RuntimeError, 'differs'):
            core.verify_live(batch, self.base, timeout=2)


class GuiOperationTests(unittest.TestCase):
    from test_safe_publisher import WorkerTests as _Fixture
    setUp = _Fixture.setUp

    def test_actual_gui_worker_deploy_failure_retry_preserves_all_input_and_receipt(self):
        import portfolio_manager as manager
        import safe_photo_publisher as core
        snapshot = {'manifest': {'old.jpg': {'categories': ['a'], 'order': {'a': -5}, 'caption': 'keep'}},
                    'hashes': {'old.jpg': '1'*64}, 'history': manager.empty_history()}
        operation = manager.prepare_edit(snapshot, ['old.jpg'], [])
        core.save_batch(self.new, operation)
        before = copy.deepcopy(self.app.assign)
        calls = []
        def publish(root, newdir, receipt, **kwargs):
            calls.append(receipt['id'])
            receipt['pushed_sha'] = 'a'*40
            core.save_batch(newdir, receipt)
            return receipt['pushed_sha']
        with self.patch.object(core, 'publish_batch', side_effect=publish), self.patch.object(core, 'wait_for_deploy', side_effect=RuntimeError('deploy failed')):
            self.app._operation_worker(operation)
        self.assertFalse(core.load_batch(self.new)['complete'])
        self.assertEqual(self.app.assign, before)
        self.assertEqual((self.new / 'one.jpg').read_bytes(), b'original')
        with self.patch.object(core, 'publish_batch', side_effect=publish), self.patch.object(core, 'wait_for_deploy', return_value={'id': 3}), self.patch.object(core, 'verify_live'):
            self.app._operation_worker(core.load_batch(self.new))
        self.assertEqual(calls, [operation['id'], operation['id']])
        self.assertTrue(core.load_batch(self.new)['complete'])
        self.assertEqual(self.app.assign, before)
        self.assertEqual((self.new / 'one.jpg').read_bytes(), b'original')

    def test_removing_custom_checkbox_never_discards_existing_input_tags(self):
        import ast
        self.app.busy = False
        self.app.extra = {'group': ['tag']}
        self.app._render_categories = lambda: None
        self.app._restore_checks = lambda: None
        source = Path(__file__).resolve().parents[1] / 'publish_photos.py'
        node = next(n for n in ast.walk(ast.parse(source.read_text())) if isinstance(n, ast.FunctionDef) and n.name == 'delete_extra')
        self.namespace.update(self=self.app, CATEGORY_GROUPS=[], save_extra=lambda value: None)
        self.namespace['messagebox'].askyesno = lambda *a, **kw: True
        exec(compile(ast.Module(body=[node], type_ignores=[]), str(source), 'exec'), self.namespace)
        self.namespace['delete_extra']('group', 'tag')
        self.assertEqual(self.app.assign, self.assign)

    def test_extra_category_json_write_is_atomic_and_malformed_input_is_not_erased(self):
        import safe_photo_publisher as core
        path = self.new.parent / 'photo_tags.json'
        self.namespace['TAGS_FILE'] = str(path)
        saved = {'extra_cats': {}, 'owner': {'keep': ['all']}}
        core.atomic_json(path, saved)
        with self.patch.object(core, 'atomic_json', wraps=core.atomic_json) as writer:
            self.namespace['save_extra']({'group': ['custom']})
            writer.assert_called_once()
        self.assertEqual(json.loads(path.read_text())['owner'], saved['owner'])
        path.write_text('{broken original')
        with self.assertRaises(ValueError):
            self.namespace['save_extra']({'group': []})
        self.assertEqual(path.read_text(), '{broken original')

    def test_normal_close_keeps_singleton_until_busy_operation_finishes(self):
        closed = []
        self.app.root.destroy = lambda: closed.append(True)
        self.app.busy = True
        self.app._close()
        self.assertFalse(closed)
        self.app.busy = False
        self.app._close()
        self.assertEqual(closed, [True])

    def test_navigation_cannot_change_worker_selection(self):
        self.app.busy = True
        self.app.photos = ['one.jpg', 'two.jpg']
        self.app.idx = 0
        self.app.next_photo()
        self.assertEqual(self.app.idx, 0)

    def test_publish_button_resumes_pending_edit_not_upload_preparation(self):
        import types
        import portfolio_manager as manager
        import safe_photo_publisher as core
        op = manager.prepare_edit({'manifest': {'old.jpg': {'categories': ['a']}}, 'hashes': {'old.jpg': '1'*64}, 'history': manager.empty_history()}, ['old.jpg'], [])
        core.save_batch(self.new, op)
        self.app.busy = False
        self.app.photos = ['one.jpg']
        launched = []
        self.app._confirm_changes = lambda detail: True
        self.namespace['threading'] = types.SimpleNamespace(Thread=lambda **kw: types.SimpleNamespace(start=lambda: launched.append(kw)))
        self.app.btn_publish = types.SimpleNamespace(config=lambda **kw: None)
        self.app.log = types.SimpleNamespace(config=lambda **kw: None, delete=lambda *a: None)
        self.app.publish()
        self.assertEqual(launched[0]['target'].__name__, '_operation_worker')
        self.assertEqual(launched[0]['args'][0]['id'], op['id'])
        self.assertEqual(core.load_batch(self.new), op)

    def test_submission_requires_detailed_confirmation_and_never_overwrites_pending_upload(self):
        import portfolio_manager as manager
        import safe_photo_publisher as core
        self.app.busy = False
        snapshot = {'manifest': {'old.jpg': {'categories': ['a', 'b'], 'order': {'a': -5, 'b': 7}}},
                    'hashes': {'old.jpg': '1'*64}, 'history': manager.empty_history()}
        op = manager.prepare_edit(snapshot, ['old.jpg'], [])
        confirmations = []
        self.app._confirm_changes = lambda detail: confirmations.append(detail) or False
        self.app._submit_operation(op)
        self.assertFalse(core.load_batch(self.new))
        self.assertIn('old.jpg', confirmations[0])
        self.assertIn('a', confirmations[0])
        self.assertIn('b', confirmations[0])
        self.assertIn('URL', confirmations[0])
        upload = core.prepare_batch(self.new, [('one.jpg', ['a'], ['tag'])], lambda s, d: d.write_bytes(s.read_bytes()), lambda s: '.jpg')
        self.app._confirm_changes = lambda *a, **kw: self.fail('must not replace pending upload')
        self.app._submit_operation(op)
        self.assertEqual(core.load_batch(self.new), upload)

    def test_checkbox_edits_preserve_unknown_original_tags(self):
        self.app.busy = False
        self.app.photos = ['one.jpg']
        self.app.idx = 0
        self.app.assign = {'one.jpg': ['old unknown', 'known']}
        self.app.check_vars = {'known': None, 'new': None}
        self.app._selected = lambda: ['new']
        self.app._update_selected = lambda: None
        self.app._update_progress = lambda: None
        self.app._on_check()
        self.assertEqual(self.app.assign['one.jpg'], ['new', 'old unknown'])


class GalleryEntryTests(unittest.TestCase):
    def test_actual_gallery_actions_scope_remove_category_and_recovery(self):
        import ast
        import types
        import portfolio_manager as manager
        source = Path(__file__).resolve().parents[1] / 'portfolio_manager_ui.py'
        self.assertTrue(source.exists(), 'missing site gallery UI')
        tree = ast.parse(source.read_text())
        nodes = [n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.ClassDef))]
        ns = {'manager': manager, 'messagebox': types.SimpleNamespace(showerror=lambda *a, **kw: self.fail(str(a)))}
        exec(compile(ast.Module(body=nodes, type_ignores=[]), str(source), 'exec'), ns)
        tab = ns['PortfolioTab'].__new__(ns['PortfolioTab'])
        operations = []
        tab.owner = types.SimpleNamespace(busy=False, _submit_operation=operations.append)
        tab.selected = {'one.jpg', 'two.jpg'}
        tab.snapshot = {'manifest': {'one.jpg': {'categories': ['a', 'b'], 'order': {'a': 1, 'b': 8}},
                                     'two.jpg': {'categories': ['a'], 'order': {'a': 4}, 'caption': 'keep'}},
                        'hashes': {'one.jpg': '1'*64, 'two.jpg': '2'*64}, 'history': manager.empty_history()}
        tab.category = types.SimpleNamespace(get=lambda: 'a')
        tab._remove_category()
        manifest, journal = manager.apply_operation(tab.snapshot['manifest'], tab.snapshot['history'], operations[-1])
        self.assertEqual(manifest['one.jpg']['categories'], ['b'])
        self.assertNotIn('two.jpg', manifest)
        tab.snapshot.update(manifest=manifest, history=journal)
        tab._restore_action(operations[-1]['id'])
        restored, _ = manager.apply_operation(manifest, journal, operations[-1])
        self.assertEqual(restored['two.jpg']['caption'], 'keep')
        self.assertEqual(restored['one.jpg']['order'], {'a': 1, 'b': 8})
        tab.owner.busy = True
        tab._remove_category()
        self.assertEqual(len(operations), 2)


class RealWorkflowTests(unittest.TestCase):
    def setUp(self):
        from test_safe_publisher import WorkerTests, GitTests, HttpTests
        WorkerTests.setUp(self)
        GitTests.setUp(self)
        self.namespace.update(ROOT=str(self.repo), NEWDIR=str(self.new), ASSIGN_FILE=str(self.new / '.assignments.json'))
        HttpTests.setUp(self)
        self.image = b'old'
        import safe_photo_publisher as core
        core.atomic_json(self.new / '.assignments.json', self.assign)

    from test_safe_publisher import GitTests as _GitFixture
    git = staticmethod(_GitFixture.git)

    def assert_workers_reaped(self):
        # Tracker also sees real Git/Node commands in this integration. Unlike
        # HTTP workers those do not own a stdin pipe.
        for process in self.workers:
            self.assertIsNotNone(process.returncode)
            for pipe in (process.stdin, process.stdout, process.stderr):
                if pipe is not None:
                    self.assertTrue(pipe.closed)

    def test_actual_gui_cancel_worker_archives_only_unaccepted_edit(self):
        import portfolio_manager as manager
        import safe_photo_publisher as core
        operation = manager.prepare_edit(manager.read_catalog(self.repo), ['old.jpg'], [])
        core.save_batch(self.new, operation)
        before = (self.new / 'one.jpg').read_bytes()
        self.app._cancel_operation_worker()
        self.assertTrue(core.load_batch(self.new)['cancelled'])
        self.assertEqual((self.new / 'one.jpg').read_bytes(), before)
        self.assertEqual(self.app.assign, self.assign)

    def test_actual_upload_worker_65_one_category_no_split_all_original_tags_retained_in_receipt(self):
        import safe_photo_publisher as core
        from unittest.mock import patch
        # Fixture starts with a frozen one-photo v1 batch; complete that fixture
        # before requesting a genuinely new 65-photo selection.
        self.batch['complete'] = True
        core.save_batch(self.new, self.batch)
        names = ['source-' + str(i) + '.jpg' for i in range(65)]
        for i, name in enumerate(names):
            (self.new / name).write_bytes(('original-' + str(i)).encode())
        assignments = {name: ['tag', 'second original tag'] for name in names}
        assignments['missing.jpg'] = ['unknown historical tag']
        core.atomic_json(self.new / '.assignments.json', assignments)
        self.app.assign = copy.deepcopy(assignments)
        real_publish, real_wait, real_verify = core.publish_batch, core.wait_for_deploy, core.verify_live
        def publish(*args, **kwargs):
            sha = real_publish(*args, **kwargs)
            self.workflow_run['head_sha'] = sha
            self.html = json.dumps(args[2]['expected_index'])
            self.images = {item['dest']: (self.new / '.publisher/payload' / item['dest']).read_bytes() for item in args[2]['items']}
            return sha
        with patch.object(core, 'publish_batch', side_effect=publish), \
             patch.object(core, 'wait_for_deploy', side_effect=lambda sha: real_wait(sha, self.base, timeout=2)), \
             patch.object(core, 'verify_live', side_effect=lambda batch: real_verify(batch, self.base, timeout=30)):
            self.app._publish_worker(names)
        receipt = core.load_batch(self.new)
        self.assertTrue(receipt['complete'])
        self.assertEqual(len(receipt['items']), 65)
        self.assertEqual(len({item['dest'] for item in receipt['items']}), 65)
        self.assertEqual(sum(p.startswith('/images/') for p, _ in self.requests), 65)
        for item in receipt['items']:
            self.assertEqual(item['tags'], assignments[item['source']])
            self.assertEqual((self.new / '_published' / item['archive']).read_bytes(), (self.new / '.publisher/raw' / item['raw']).read_bytes())
        self.assertEqual(self.app.assign, {'missing.jpg': ['unknown historical tag']})
        manifest = json.loads(self.git(self.remote, 'show', 'main:data/portfolio-tags.json'))
        self.assertEqual(len(manifest), 66)
        self.assertEqual(manifest['old.jpg'], self.base_manifest['old.jpg'])

    def test_actual_gui_delete_failed_deploy_retry_exact_workflow_full_index_and_bytes(self):
        import portfolio_manager as manager
        import safe_photo_publisher as core
        from unittest.mock import patch
        operation = manager.prepare_edit(manager.read_catalog(self.repo), ['old.jpg'], [])
        core.save_batch(self.new, operation)
        real_publish, real_wait, real_verify = core.publish_batch, core.wait_for_deploy, core.verify_live
        def publish(*args, **kwargs):
            sha = real_publish(*args, **kwargs)
            self.workflow_run['head_sha'] = sha
            self.html = json.dumps(args[2]['expected_index'])
            return sha
        before = (self.git(self.repo, 'status', '--porcelain'), self.git(self.repo, 'rev-parse', 'HEAD'),
                  (self.new / 'one.jpg').read_bytes(), (self.new / '.assignments.json').read_bytes())
        self.workflow_run['conclusion'] = 'failure'
        with patch.object(core, 'publish_batch', side_effect=publish), \
             patch.object(core, 'wait_for_deploy', side_effect=lambda sha: real_wait(sha, self.base, timeout=2)), \
             patch.object(core, 'verify_live', side_effect=lambda batch: real_verify(batch, self.base, timeout=2)):
            self.app._operation_worker(operation)
            self.assertFalse(core.load_batch(self.new)['complete'])
            accepted_sha = core.load_batch(self.new)['pushed_sha']
            self.workflow_run['conclusion'] = 'success'
            self.app._operation_worker(core.load_batch(self.new))
        self.assertTrue(core.load_batch(self.new)['complete'])
        self.assertEqual(core.load_batch(self.new)['pushed_sha'], accepted_sha)
        self.assertEqual(self.git(self.remote, 'rev-parse', 'main'), accepted_sha)
        self.assertEqual(len(json.loads(self.git(self.remote, 'show', 'main:data/portfolio-history.json'))['actions']), 1)
        self.assertIn('/portfolio-index.json', [path for path, _ in self.requests])
        self.assertIn('/images/portfolio/old.jpg', [path for path, _ in self.requests])
        self.assertEqual(before, (self.git(self.repo, 'status', '--porcelain'), self.git(self.repo, 'rev-parse', 'HEAD'),
                                 (self.new / 'one.jpg').read_bytes(), (self.new / '.assignments.json').read_bytes()))


if __name__ == '__main__':
    unittest.main()
