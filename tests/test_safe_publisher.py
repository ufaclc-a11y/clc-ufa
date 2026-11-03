"""Offline publisher regressions; no production network or GUI required."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


class MergeTests(unittest.TestCase):
    def test_additive_merge_preserves_remote_metadata_and_order(self):
        spec = importlib.util.find_spec('safe_photo_publisher')
        self.assertIsNotNone(spec, 'missing isolated additive publication core')
        from safe_photo_publisher import merge_manifest
        remote = {'old.jpg': {'categories': ['a'], 'order': {'a': -3}, 'caption': 'remote'},
                  'p-new.jpg': {'categories': ['b'], 'order': {'b': 7}, 'extra': True}}
        before = copy.deepcopy(remote)
        items = [{'dest': 'p-new.jpg', 'categories': ['a']}]
        merged = merge_manifest(remote, items)
        self.assertEqual(remote, before)
        self.assertEqual(merged['old.jpg'], before['old.jpg'])
        self.assertEqual(merged['p-new.jpg'], {'categories': ['b', 'a'],
                         'order': {'b': 7, 'a': -4}, 'extra': True})
        self.assertEqual(merge_manifest(merged, items), merged)
        self.assertNotIn('stale-local.jpg', merged)


class BatchTests(unittest.TestCase):
    def setUp(self):
        import tempfile
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.new = Path(self.temp.name) / 'NewPhoto'
        self.new.mkdir()
        (self.new / 'one.jpg').write_bytes(b'original')
        self.assign = {'one.jpg': ['tag'], 'unselected.jpg': ['other']}

    def test_snapshot_retry_and_changed_source_are_fail_closed(self):
        import safe_photo_publisher as core
        self.assertTrue(hasattr(core, 'prepare_batch'), 'missing durable immutable batch')
        batch = core.prepare_batch(self.new, [('one.jpg', ['a'], ['tag'])],
                                   lambda src, dst: dst.write_bytes(src.read_bytes()),
                                   lambda src: '.jpg')
        (self.new / 'one.jpg').write_bytes(b'changed')
        resumed = core.prepare_batch(self.new, [], None, None)
        self.assertEqual(resumed, batch)
        self.assertEqual((self.new / '.publisher' / 'payload' / batch['items'][0]['dest']).read_bytes(), b'original')
        with self.assertRaisesRegex(RuntimeError, 'verified'):
            core.archive_batch(self.new, batch, self.assign)
        batch['verified'] = True
        with self.assertRaisesRegex(RuntimeError, 'changed'):
            core.archive_batch(self.new, batch, self.assign)
        self.assertEqual(self.assign['one.jpg'], ['tag'])
        self.assertEqual((self.new / 'one.jpg').read_bytes(), b'changed')
        (self.new / 'one.jpg').write_bytes(b'original')
        updated = core.archive_batch(self.new, batch, self.assign)
        self.assertNotIn('one.jpg', updated)
        self.assertIn('unselected.jpg', updated)
        self.assertFalse((self.new / 'one.jpg').exists())
        self.assertEqual((self.new / '_published' / 'one.jpg').read_bytes(), b'original')

    def test_conversion_uses_frozen_original_with_source_extension(self):
        import safe_photo_publisher as core
        def convert(source, target):
            self.assertEqual(source.suffix, '.jpg', 'snapshot lost original format extension')
            target.write_bytes(source.read_bytes())
        batch = core.prepare_batch(self.new, [('one.jpg', ['a'], ['tag'])], convert, lambda src: '.jpg')
        self.assertEqual(batch['items'][0]['source'], 'one.jpg')

    def test_completion_receipt_write_failure_rolls_back_sources_and_assignments(self):
        import safe_photo_publisher as core
        from unittest.mock import patch
        batch = core.prepare_batch(self.new, [('one.jpg', ['a'], ['tag'])],
                         lambda src, dst: dst.write_bytes(src.read_bytes()), lambda src: '.jpg')
        batch['verified'] = True
        core.atomic_json(self.new / '.assignments.json', self.assign)
        real_save = core.save_batch
        def fail_completion(newdir, value):
            if value.get('complete'):
                raise OSError('receipt disk failure')
            return real_save(newdir, value)
        with patch.object(core, 'save_batch', side_effect=fail_completion):
            with self.assertRaises(OSError):
                core.archive_batch(self.new, batch, self.assign)
        self.assertTrue((self.new / 'one.jpg').exists(), 'receipt failure removed original')
        self.assertEqual(json.loads((self.new / '.assignments.json').read_text()), self.assign)
        self.assertFalse(batch.get('complete'))

    def test_exclusive_publisher_lock_releases_after_exception(self):
        import safe_photo_publisher as core
        self.assertTrue(hasattr(core, 'publisher_lock'), 'multiple windows can corrupt a pending batch')
        with self.assertRaisesRegex(RuntimeError, 'deliberate'):
            with core.publisher_lock(self.new):
                with self.assertRaisesRegex(RuntimeError, 'already'):
                    with core.publisher_lock(self.new):
                        self.fail('second publisher admitted')
                raise RuntimeError('deliberate')
        with core.publisher_lock(self.new):
            pass

    def test_rejects_traversal_and_unmapped_batch(self):
        import safe_photo_publisher as core
        self.assertTrue(hasattr(core, 'prepare_batch'), 'missing path validation')
        for name in ['../one.jpg', 'a\\\\b.jpg', 'C:one.jpg']:
            with self.assertRaises(ValueError):
                core.prepare_batch(self.new, [(name, ['a'], ['tag'])], None, None)
        with self.assertRaises(ValueError):
            core.prepare_batch(self.new, [('one.jpg', [], ['tag'])], None, None)
        self.assertFalse((self.new / '.publisher' / 'active.json').exists())


class GitTests(unittest.TestCase):
    def setUp(self):
        BatchTests.setUp(self)
        import subprocess
        import shutil
        self.repo = Path(self.temp.name) / 'dirty'
        self.remote = Path(self.temp.name) / 'origin.git'
        self.repo.mkdir()
        self.git(self.repo, 'init', '-b', 'main')
        self.git(self.repo, 'config', 'user.name', 'Fixture')
        self.git(self.repo, 'config', 'user.email', 'fixture@example.invalid')
        (self.repo / 'data').mkdir()
        (self.repo / 'scripts').mkdir()
        (self.repo / 'public/images/portfolio').mkdir(parents=True)
        self.base_manifest = {'old.jpg': {'categories': ['a'], 'order': {'a': 2}, 'remote': 'keep'}}
        (self.repo / 'data/portfolio-tags.json').write_text(json.dumps(self.base_manifest))
        (self.repo / 'data/portfolio.ts').write_text("const CATEGORY_META: { id: string; label: string }[] = [{ id: 'a', label: 'A' }]")
        (self.repo / 'public/images/portfolio/old.jpg').write_bytes(b'old')
        shutil.copyfile(Path(__file__).resolve().parents[1] / 'scripts/gen-portfolio.mjs', self.repo / 'scripts/gen-portfolio.mjs')
        self.git(self.repo, 'add', '.')
        self.git(self.repo, 'commit', '-m', 'base')
        self.git(self.repo, 'init', '--bare', str(self.remote))
        self.git(self.repo, 'remote', 'add', 'origin', str(self.remote))
        self.git(self.repo, 'push', 'origin', 'main')
        # All local state, including a local commit, staged and unstaged changes, stays untouched.
        (self.repo / 'private-local.txt').write_text('local-only')
        self.git(self.repo, 'add', 'private-local.txt')
        self.git(self.repo, 'commit', '-m', 'local only')
        (self.repo / 'data/portfolio-tags.json').write_text('{"stale-local.jpg": {"categories": ["bad"]}}')
        (self.repo / 'public/images/portfolio/removed.jpg').write_bytes(b'do not restore')
        (self.repo / 'staged.txt').write_text('staged')
        self.git(self.repo, 'add', 'staged.txt')
        import safe_photo_publisher as core
        self.batch = core.prepare_batch(self.new, [('one.jpg', ['a'], ['tag'])],
                         lambda src, dst: dst.write_bytes(src.read_bytes()), lambda src: '.jpg')

    @staticmethod
    def git(cwd, *args):
        import subprocess
        result = subprocess.run(['git', *args], cwd=cwd, text=True, capture_output=True, check=True)
        return result.stdout.strip()

    def test_unknown_remote_category_never_pushes(self):
        import safe_photo_publisher as core
        before = self.git(self.remote, 'rev-parse', 'main')
        self.batch['items'][0]['categories'] = ['not-a-real-category']
        with self.assertRaisesRegex(ValueError, 'category'):
            core.publish_batch(self.repo, self.new, self.batch)
        self.assertEqual(self.git(self.remote, 'rev-parse', 'main'), before)

    def test_only_selected_delta_pushes_and_retry_never_creates_second_commit(self):
        import safe_photo_publisher as core
        self.assertTrue(hasattr(core, 'publish_batch'), 'missing isolated git publication')
        before = (self.git(self.repo, 'status', '--porcelain'), self.git(self.repo, 'rev-parse', 'HEAD'),
                  (self.repo / 'data/portfolio-tags.json').read_bytes())
        sha = core.publish_batch(self.repo, self.new, self.batch)
        manifest = json.loads(self.git(self.remote, 'show', 'main:data/portfolio-tags.json'))
        self.assertEqual(manifest['old.jpg'], self.base_manifest['old.jpg'])
        self.assertEqual(manifest[self.batch['items'][0]['dest']]['categories'], ['a'])
        tree = self.git(self.remote, 'ls-tree', '-r', '--name-only', 'main')
        self.assertNotIn('removed.jpg', tree)
        self.assertNotIn('private-local.txt', tree)
        self.assertNotIn('stale-local.jpg', manifest)
        self.assertEqual(core.publish_batch(self.repo, self.new, self.batch), sha)
        self.assertEqual(self.git(self.remote, 'rev-parse', 'main'), sha)
        self.assertEqual(before, (self.git(self.repo, 'status', '--porcelain'), self.git(self.repo, 'rev-parse', 'HEAD'),
                                (self.repo / 'data/portfolio-tags.json').read_bytes()))
        self.assertEqual(core.load_batch(self.new)['pushed_sha'], sha)

    def test_successful_push_receipt_survives_temporary_cleanup_failure(self):
        import safe_photo_publisher as core
        from unittest.mock import patch
        leftovers = []
        real_cleanup = core.shutil.rmtree
        def fail_cleanup(path):
            leftovers.append(path)
            raise OSError('Windows file is still open')
        try:
            with patch.object(core.shutil, 'rmtree', side_effect=fail_cleanup):
                sha = core.publish_batch(self.repo, self.new, self.batch)
            self.assertEqual(core.load_batch(self.new)['pushed_sha'], sha)
            self.assertEqual(self.git(self.remote, 'rev-parse', 'main'), sha)
        finally:
            for path in leftovers:
                real_cleanup(path)

    def test_semantic_noop_does_not_commit_json_formatting(self):
        import safe_photo_publisher as core
        core.publish_batch(self.repo, self.new, self.batch)
        other = Path(self.temp.name) / 'formatter'
        self.git(self.repo, 'clone', '--branch', 'main', str(self.remote), str(other))
        self.git(other, 'config', 'user.name', 'Formatter')
        self.git(other, 'config', 'user.email', 'formatter@example.invalid')
        target = other / 'data/portfolio-tags.json'
        manifest = json.loads(target.read_text())
        target.write_text(json.dumps(manifest, indent=4) + '\n')
        self.git(other, 'add', '.')
        self.git(other, 'commit', '-m', 'format remote manifest')
        self.git(other, 'push', 'origin', 'main')
        before = self.git(self.remote, 'rev-parse', 'main')
        self.batch['candidate_sha'] = self.batch['pushed_sha'] = None
        self.assertEqual(core.publish_batch(self.repo, self.new, self.batch), before)
        self.assertEqual(self.git(self.remote, 'rev-parse', 'main'), before)

    def test_concurrent_main_advance_rebases_only_batch_delta(self):
        import safe_photo_publisher as core
        original_git = core.git
        changed = []
        def racing_git(cwd, *args, **kwargs):
            if args[0] == 'push' and not changed:
                changed.append(True)
                other = Path(self.temp.name) / 'concurrent'
                self.git(self.repo, 'clone', '--branch', 'main', str(self.remote), str(other))
                self.git(other, 'config', 'user.name', 'Concurrent')
                self.git(other, 'config', 'user.email', 'concurrent@example.invalid')
                manifest = dict(self.base_manifest)
                manifest['old.jpg']['caption'] = 'concurrent remote metadata'
                (other / 'data/portfolio-tags.json').write_text(json.dumps(manifest))
                (other / 'concurrent-code.txt').write_text('preserve new remote code')
                self.git(other, 'add', '.')
                self.git(other, 'commit', '-m', 'concurrent main update')
                self.git(other, 'push', 'origin', 'main')
            return original_git(cwd, *args, **kwargs)
        from unittest.mock import patch
        with patch.object(core, 'git', side_effect=racing_git):
            sha = core.publish_batch(self.repo, self.new, self.batch)
        manifest = json.loads(self.git(self.remote, 'show', 'main:data/portfolio-tags.json'))
        self.assertEqual(manifest['old.jpg']['caption'], 'concurrent remote metadata')
        self.assertEqual(self.git(self.remote, 'show', 'main:concurrent-code.txt'), 'preserve new remote code')
        self.assertEqual(self.git(self.remote, 'rev-parse', 'main'), sha)

    def test_accepted_but_remotely_removed_photo_is_not_restored(self):
        import safe_photo_publisher as core
        core.publish_batch(self.repo, self.new, self.batch)
        other = Path(self.temp.name) / 'remover'
        self.git(self.repo, 'clone', '--branch', 'main', str(self.remote), str(other))
        self.git(other, 'config', 'user.name', 'Remover')
        self.git(other, 'config', 'user.email', 'remover@example.invalid')
        self.git(other, 'rm', 'public/images/portfolio/' + self.batch['items'][0]['dest'])
        self.git(other, 'commit', '-m', 'intentional removal')
        self.git(other, 'push', 'origin', 'main')
        before = self.git(self.remote, 'rev-parse', 'main')
        with self.assertRaisesRegex(RuntimeError, 'removed'):
            core.publish_batch(self.repo, self.new, self.batch)
        self.assertEqual(self.git(self.remote, 'rev-parse', 'main'), before)
        self.assertTrue((self.new / 'one.jpg').exists())

    def test_rejected_push_is_bounded_and_retry_reconciles_ambiguous_acceptance(self):
        import safe_photo_publisher as core
        self.assertTrue(hasattr(core, 'publish_batch'), 'missing rejection handling')
        hook = self.remote / 'hooks/pre-receive'
        hook.write_text('#!/bin/sh\nexit 1\n')
        hook.chmod(0o755)
        with self.assertRaises(RuntimeError):
            core.publish_batch(self.repo, self.new, self.batch, attempts=2)
        self.assertFalse(self.batch['pushed_sha'])
        self.assertTrue((self.new / 'one.jpg').exists())
        hook.unlink()
        sha = core.publish_batch(self.repo, self.new, self.batch)
        # Simulate loss of successful-push receipt save: candidate is durable before wire push.
        self.batch['pushed_sha'] = None
        core.save_batch(self.new, self.batch)
        self.assertEqual(core.publish_batch(self.repo, self.new, self.batch), sha)
        self.assertEqual(self.git(self.remote, 'rev-parse', 'main'), sha)


class HttpTests(unittest.TestCase):
    def setUp(self):
        import safe_photo_publisher as core
        from unittest.mock import patch
        self.workers = []
        real_popen = core.subprocess.Popen
        def tracked_popen(*args, **kwargs):
            process = real_popen(*args, **kwargs)
            self.workers.append(process)
            return process
        self.addCleanup(self.assert_workers_reaped)
        self.popen_patch = patch.object(core.subprocess, 'Popen', side_effect=tracked_popen)
        self.popen_patch.start()
        self.addCleanup(self.popen_patch.stop)
        from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
        import threading
        self.sha = 'a' * 40
        self.workflow_run = {'id': 7, 'head_sha': self.sha, 'head_branch': 'main', 'event': 'push',
                    'path': '.github/workflows/deploy.yml', 'status': 'completed', 'conclusion': 'success'}
        self.status = 200
        self.image = b'image bytes'
        self.html = '<img alt="Категория — пример 1" src="/_next/image?url=%2Fimages%2Fportfolio%2Fp-new.jpg&amp;w=640&amp;q=75">'
        self.requests = []
        owner = self
        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                owner.requests.append((self.path, dict(self.headers)))
                self.send_response(owner.status)
                self.end_headers()
                if self.path == '/slow':
                    import time
                    time.sleep(0.3)
                    return
                if '/actions/' in self.path:
                    self.wfile.write(json.dumps({'workflow_runs': [owner.workflow_run]}).encode())
                elif self.path.startswith('/images/'):
                    self.wfile.write(owner.image)
                else:
                    self.wfile.write(owner.html.encode())
            def log_message(self, *args):
                pass
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.addCleanup(self.server.server_close)
        self.addCleanup(self.server.shutdown)
        self.base = 'http://127.0.0.1:' + str(self.server.server_port)

    def assert_workers_reaped(self):
        for process in self.workers:
            self.assertIsNotNone(process.returncode)
            self.assertIsNotNone(process.poll())
            for pipe in (process.stdin, process.stdout, process.stderr):
                self.assertTrue(pipe.closed)

    def test_response_size_limit_and_http_error_are_preserved(self):
        import safe_photo_publisher as core
        import time
        data = self.html.encode()
        self.assertEqual(core.http_bytes(self.base, time.monotonic() + 2, len(data)), data)
        with self.assertRaisesRegex(RuntimeError, 'too large'):
            core.http_bytes(self.base, time.monotonic() + 2, len(data) - 1)
        self.status = 503
        with self.assertRaisesRegex(RuntimeError, 'HTTP 503'):
            core.http_bytes(self.base, time.monotonic() + 2)

    def test_exact_workflow_sha_and_live_image_hash_category_are_required(self):
        import hashlib
        import safe_photo_publisher as core
        self.assertTrue(hasattr(core, 'wait_for_deploy'), 'missing exact deployment gate')
        self.assertEqual(core.wait_for_deploy(self.sha, api_base=self.base, timeout=1)['id'], 7)
        self.assertIn('head_sha=' + self.sha, self.requests[0][0])
        self.assertIn('/actions/workflows/deploy.yml/runs', self.requests[0][0])
        self.assertEqual(self.requests[0][1]['X-Github-Api-Version'], '2026-03-10')
        batch = {'items': [{'dest': 'p-new.jpg', 'categories': ['a'],
                            'payload_sha256': hashlib.sha256(self.image).hexdigest()}]}
        core.verify_live(batch, self.base, timeout=1)
        self.image = b'wrong'
        with self.assertRaises(RuntimeError):
            core.verify_live(batch, self.base, timeout=1)
        self.image = b'image bytes'
        self.html = '<script>p-new.jpg</script>'
        with self.assertRaises(RuntimeError):
            core.verify_live(batch, self.base, timeout=1)

    def test_recommendation_or_hero_image_is_not_category_membership(self):
        import safe_photo_publisher as core
        import hashlib
        self.html = '<img alt="Другая категория" src="/images/portfolio/p-new.jpg">'
        batch = {'items': [{'dest': 'p-new.jpg', 'categories': ['a'],
                            'payload_sha256': hashlib.sha256(self.image).hexdigest()}]}
        with self.assertRaisesRegex(RuntimeError, 'rendered'):
            core.verify_live(batch, self.base, timeout=1)

    def test_live_image_prefix_is_not_exact_image_evidence(self):
        import safe_photo_publisher as core
        import hashlib
        self.html = '<img alt="Категория — пример 1" src="/images/portfolio/p-new.jpg.not-selected">'
        batch = {'items': [{'dest': 'p-new.jpg', 'categories': ['a'],
                            'payload_sha256': hashlib.sha256(self.image).hexdigest()}]}
        with self.assertRaisesRegex(RuntimeError, 'rendered'):
            core.verify_live(batch, self.base, timeout=1)

    def test_slow_http_body_has_bounded_deadline(self):
        import safe_photo_publisher as core
        import time
        self.slow = True
        started = time.monotonic()
        with self.assertRaises((TimeoutError, OSError)):
            core.http_bytes(self.base + '/slow', time.monotonic() + 0.08)
        self.assertLess(time.monotonic() - started, 0.5)

    def test_wrong_sha_wrong_workflow_failure_http_and_deadline_retain_pending(self):
        import safe_photo_publisher as core
        self.assertTrue(hasattr(core, 'wait_for_deploy'), 'missing bounded deploy wait')
        for field, value in [('head_sha', 'b'*40), ('path', '.github/workflows/other.yml'),
                             ('event', 'workflow_dispatch'), ('head_branch', 'other')]:
            old = self.workflow_run[field]
            self.workflow_run[field] = value
            with self.assertRaises(TimeoutError):
                core.wait_for_deploy(self.sha, api_base=self.base, timeout=0.05)
            self.workflow_run[field] = old
        self.workflow_run['conclusion'] = 'failure'
        with self.assertRaises(RuntimeError):
            core.wait_for_deploy(self.sha, api_base=self.base, timeout=1)
        self.status = 503
        with self.assertRaises(Exception):
            core.wait_for_deploy(self.sha, api_base=self.base, timeout=1)


class HttpDeadlineTests(unittest.TestCase):
    def trickle(self, mode):
        # Original independent review-1 peer timings and 1.5x assertion, inverted.
        import safe_photo_publisher as core
        import socketserver
        import threading
        import time
        from unittest.mock import patch
        class Server(socketserver.ThreadingTCPServer):
            allow_reuse_address = True
        class Handler(socketserver.BaseRequestHandler):
            def handle(self):
                self.request.recv(8192)
                try:
                    if mode == 'headers':
                        self.request.sendall(b'HTTP/1.1 200 OK\r\n')
                        for _ in range(16):
                            self.request.sendall(b'X-Trickle: x\r\n')
                            time.sleep(.03)
                        self.request.sendall(b'Content-Length: 0\r\nConnection: close\r\n\r\n')
                    else:
                        self.request.sendall(b'HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n\r\n')
                        time.sleep(.16)
                        self.request.sendall(b'x')
                        time.sleep(.18)
                        self.request.sendall(b'y')
                except OSError:
                    pass
        server = Server(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever)
        thread.start()
        timeout = .08 if mode == 'headers' else .2
        workers = []
        real_popen = core.subprocess.Popen
        def tracked(*args, **kwargs):
            worker = real_popen(*args, **kwargs)
            workers.append(worker)
            return worker
        try:
            start = time.monotonic()
            with patch.object(core.subprocess, 'Popen', side_effect=tracked):
                with self.assertRaises(TimeoutError):
                    core.http_bytes('http://127.0.0.1:' + str(server.server_address[1]) + '/', start + timeout)
            self.assertLess(time.monotonic() - start, timeout * 1.5)
            self.assertEqual(len(workers), 1)
            self.assertIsNotNone(workers[0].returncode)
            self.assertTrue(all(pipe.closed for pipe in (workers[0].stdin, workers[0].stdout, workers[0].stderr)))
        finally:
            server.shutdown()
            server.server_close()
            thread.join()
        self.assertFalse(thread.is_alive())

    def test_original_trickled_headers(self):
        self.trickle('headers')

    def test_original_final_body_read(self):
        self.trickle('body')

    def test_deadline_kills_blocked_dns_and_connect_and_reaps_worker(self):
        import safe_photo_publisher as core
        import tempfile
        import time
        from unittest.mock import patch
        real_popen = core.subprocess.Popen
        for seam in ('getaddrinfo', 'create_connection'):
            with self.subTest(seam=seam), tempfile.TemporaryDirectory() as directory:
                marker = Path(directory) / 'entered'
                code = ("import sys,socket,time,runpy;sys.path.insert(0," + repr(str(Path(core.__file__).parent)) + ");"
                        "import safe_photo_publisher as c;from pathlib import Path;"
                        '\ndef blocked(*args, **kwargs):\n Path(' + repr(str(marker)) + ').write_text("entered");time.sleep(5)\n')
                code += 'socket.' + seam + '=blocked\nsys.argv=[c.__file__,"--http-worker"]\nrunpy.run_path(c.__file__,run_name="__main__")'
                workers = []
                def launch(args, **kwargs):
                    worker = real_popen([sys.executable, '-I', '-c', code], **kwargs)
                    workers.append(worker)
                    return worker
                start = time.monotonic()
                with patch.object(core.subprocess, 'Popen', side_effect=launch):
                    with self.assertRaises(TimeoutError):
                        core.http_bytes('http://127.0.0.1:1/', start + .3)
                self.assertLess(time.monotonic() - start, .45)
                self.assertTrue(marker.exists(), 'did not reach real urllib DNS/connect seam')
                self.assertIsNotNone(workers[0].returncode)
                self.assertTrue(all(pipe.closed for pipe in (workers[0].stdin, workers[0].stdout, workers[0].stderr)))

    def test_expired_deadline_starts_no_request(self):
        import safe_photo_publisher as core
        import time
        from unittest.mock import patch
        with patch.object(core.subprocess, 'Popen') as launch:
            with self.assertRaises(TimeoutError):
                core.http_bytes('http://127.0.0.1:1/', time.monotonic() - 1)
        launch.assert_not_called()

    def test_timeout_closes_peer_socket_without_live_request(self):
        import safe_photo_publisher as core
        import socketserver
        import threading
        import time
        disconnected = threading.Event()
        class Handler(socketserver.BaseRequestHandler):
            def handle(self):
                self.request.settimeout(1)
                self.request.recv(8192)
                self.request.sendall(b'HTTP/1.1 200 OK\r\n')
                if self.request.recv(1) == b'':
                    disconnected.set()
        with socketserver.ThreadingTCPServer(('127.0.0.1', 0), Handler) as server:
            thread = threading.Thread(target=server.serve_forever)
            thread.start()
            try:
                with self.assertRaises(TimeoutError):
                    core.http_bytes('http://127.0.0.1:' + str(server.server_address[1]), time.monotonic() + .2)
                self.assertTrue(disconnected.wait(.1), 'timed-out request still live at peer')
            finally:
                server.shutdown()
                thread.join()


class WorkerTests(unittest.TestCase):
    def setUp(self):
        BatchTests.setUp(self)
        import ast
        import os
        import types
        import safe_photo_publisher as core
        tree = ast.parse((Path(__file__).resolve().parents[1] / 'publish_photos.py').read_text())
        nodes = [node for node in tree.body if isinstance(node, (ast.FunctionDef, ast.ClassDef))]
        namespace = dict(vars(core))
        namespace.update({'os': os, 'json': json, 'Path': Path, 'ROOT': str(self.new.parent),
                          'NEWDIR': str(self.new), 'ASSIGN_FILE': str(self.new / '.assignments.json'),
                          'PUBLISHED': str(self.new / '_published'), 'DEST': str(self.new.parent / 'portfolio'),
                          'MANIFEST': str(self.new.parent / 'manifest.json'), 'CARD': 'card', 'collections': __import__('collections'), 'GREEN': 'green', 'ORANGE': 'orange',
                          'categories_for': lambda tags: ['a'], 'unmapped': lambda tags: [], 'SKIP_TAGS': set(),
                          'safe_publisher': core, 'EXTS': ('.jpg',),
                          'messagebox': types.SimpleNamespace(showerror=lambda *a: None, showinfo=lambda *a: None)})
        exec(compile(ast.Module(body=nodes, type_ignores=[]), 'publish_photos.py', 'exec'), namespace)
        namespace['optimize_image'] = lambda src, dst: Path(dst).write_bytes(Path(src).read_bytes())
        namespace['output_ext'] = lambda src: '.jpg'
        self.namespace = namespace
        self.app = namespace['PublishApp'].__new__(namespace['PublishApp'])
        self.app.assign = copy.deepcopy(self.assign)
        self.app.busy = True
        self.app.root = types.SimpleNamespace(after=lambda delay, fn: fn())
        self.app._log = lambda msg: None
        self.app._set_status = lambda *args: None
        self.app._update_publish_btn = lambda: None
        self.app._show_photo = lambda: None
        self.app._run = lambda *args, **kwargs: (False, 'blocked old publisher')
        core.atomic_json(self.new / '.assignments.json', self.assign)
        self.patch = __import__('unittest.mock', fromlist=['patch']).patch

    def test_pending_receipt_enables_retry_even_after_interrupted_archive(self):
        import safe_photo_publisher as core
        import types
        core.prepare_batch(self.new, [('one.jpg', ['a'], ['tag'])],
                           lambda src, dst: dst.write_bytes(src.read_bytes()), lambda src: '.jpg')
        self.app.photos = []
        self.app.busy = False
        config = {}
        self.app.btn_publish = types.SimpleNamespace(config=lambda **kwargs: config.update(kwargs))
        self.namespace['PublishApp']._update_publish_btn(self.app)
        self.assertEqual(config.get('state'), 'normal', 'pending receipt has no retry button')
        self.app.log = types.SimpleNamespace(config=lambda **kw: None, delete=lambda *a: None)
        self.namespace['messagebox'].askyesno = lambda *args: True
        self.namespace['threading'] = types.SimpleNamespace(Thread=lambda **kw: types.SimpleNamespace(start=lambda: config.update(started=True)))
        self.app.publish()
        self.assertTrue(config.get('started'), 'pending receipt cannot resume without source photos')

    def test_finish_failure_never_archives_or_erases_assignments(self):
        self.app._finish_ui([('one.jpg', 'p-test.jpg')], pushed=False)
        self.assertTrue((self.new / 'one.jpg').exists(), 'failure archived original')
        self.assertEqual(self.app.assign, self.assign, 'failure erased pending assignment')

    def test_live_verification_failure_leaves_pending_originals(self):
        import safe_photo_publisher as core
        with self.patch.object(core, 'publish_batch', return_value='a'*40), \
             self.patch.object(core, 'wait_for_deploy', return_value={'id': 7}), \
             self.patch.object(core, 'verify_live', side_effect=RuntimeError('live stale')):
            self.app._publish_worker(['one.jpg'])
        self.assertTrue((self.new / 'one.jpg').exists())
        self.assertEqual(self.app.assign, self.assign)
        self.assertFalse(core.load_batch(self.new)['verified'])
        self.assertFalse(self.app.busy)

    def test_initialization_preserves_unknown_and_temporarily_missing_assignments(self):
        import types
        import safe_photo_publisher as core
        saved = {'one.jpg': ['unknown old category'], 'missing.jpg': ['tag']}
        core.atomic_json(self.new / '.assignments.json', saved)
        self.namespace['BASE_CATS'] = {'tag'}
        self.namespace['BG'] = 'black'
        self.namespace['TAGS_FILE'] = str(self.new.parent / 'photo_tags.json')
        cls = self.namespace['PublishApp']
        root = types.SimpleNamespace(**{key: lambda *a, **kw: None for key in ['title', 'configure', 'geometry', 'minsize']})
        with self.patch.object(cls, '_build_ui'), self.patch.object(cls, '_bind_keys'), self.patch.object(cls, '_show_photo'):
            app = cls(root)
        self.assertEqual(app.assign, saved, 'startup discarded recoverable assignments')
        with self.patch.object(cls, '_show_photo'):
            app.refresh()
        self.assertEqual(app.assign, saved, 'refresh discarded recoverable assignments')

    def test_selection_is_frozen_while_worker_is_running(self):
        self.app.photos = ['one.jpg']
        self.app.idx = 0
        self.app._selected = lambda: ['changed tag']
        self.app._update_selected = lambda: None
        self.app._update_progress = lambda: None
        self.app._restore_checks = lambda: None
        self.app._on_check()
        self.assertEqual(self.app.assign, self.assign, 'busy worker allowed assignment edits')

    def test_category_delete_does_not_change_assignments_during_worker(self):
        import ast
        source = (Path(__file__).resolve().parents[1] / 'publish_photos.py').read_text()
        node = next(node for node in ast.walk(ast.parse(source))
                    if isinstance(node, ast.FunctionDef) and node.name == 'delete_extra')
        self.namespace.update({'self': self.app, 'CATEGORY_GROUPS': [], 'save_extra': lambda value: None})
        self.namespace['messagebox'].askyesno = lambda *args, **kwargs: True
        self.app.extra = {'group': ['tag']}
        self.app._render_categories = lambda: None
        self.app._restore_checks = lambda: None
        exec(compile(ast.Module(body=[node], type_ignores=[]), 'publish_photos.py', 'exec'), self.namespace)
        self.namespace['delete_extra']('group', 'tag')
        self.assertEqual(self.app.assign, self.assign, 'category delete changed busy selection')

    def test_worker_deploy_failure_retains_receipt_and_retries_same_batch(self):
        import safe_photo_publisher as core
        calls = []
        def fake_publish(root, newdir, batch, **kwargs):
            calls.append(batch['items'][0]['dest'])
            batch['pushed_sha'] = 'a'*40
            core.save_batch(newdir, batch)
            return batch['pushed_sha']
        with self.patch.object(core, 'publish_batch', side_effect=fake_publish), \
             self.patch.object(core, 'wait_for_deploy', side_effect=RuntimeError('deploy failed')), \
             self.patch.object(core, 'verify_live') as live:
            self.app._publish_worker(['one.jpg'])
            self.assertTrue((self.new / 'one.jpg').exists())
            self.assertEqual(self.app.assign, self.assign)
            self.assertIsNotNone(core.load_batch(self.new), 'worker did not persist batch')
            live.assert_not_called()
        with self.patch.object(core, 'publish_batch', side_effect=fake_publish), \
             self.patch.object(core, 'wait_for_deploy', return_value={'id': 7}), \
             self.patch.object(core, 'verify_live'):
            self.app._publish_worker(['one.jpg'])
        self.assertEqual(len(calls), 2)
        self.assertEqual(calls[0], calls[1])
        self.assertFalse((self.new / 'one.jpg').exists())
        self.assertNotIn('one.jpg', self.app.assign)
        self.assertTrue(core.load_batch(self.new)['complete'])


if __name__ == '__main__':
    unittest.main()
