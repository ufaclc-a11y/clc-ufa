"""Fail-closed photo publication. Standard library only; GUI supplies image conversion."""
import copy
from contextlib import contextmanager
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import tempfile
import subprocess
import sys
import time
from html.parser import HTMLParser
from urllib.parse import urlencode, unquote, urlsplit, parse_qs
from urllib.request import Request, urlopen
from urllib.error import HTTPError


@contextmanager
def publisher_lock(newdir):
    """OS-owned lock, automatically released after crash; never delete a stale lock file."""
    path = Path(newdir) / '.publisher.lock'
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('a+b') as stream:
        if stream.tell() == 0:
            stream.write(b'0')
            stream.flush()
        stream.seek(0)
        try:
            if os.name == 'nt':
                import msvcrt
                msvcrt.locking(stream.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(stream.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError:
            raise RuntimeError('Publisher already open for this NewPhoto folder') from None
        try:
            yield
        finally:
            stream.seek(0)
            if os.name == 'nt':
                import msvcrt
                msvcrt.locking(stream.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                import fcntl
                fcntl.flock(stream.fileno(), fcntl.LOCK_UN)


def http_bytes(url, deadline, limit=32 * 1024 * 1024):
    """Own one killable stdlib worker for the entire DNS/TLS/header/body operation.

    Socket timeouts bound individual reads, not trickled headers or DNS. Keep
    urllib in a process instead of an uninterruptible thread or private socket
    wrapper. Startup and IPC consume the same absolute budget; always reap it.
    """
    if deadline <= time.monotonic():
        raise TimeoutError('HTTP deadline exceeded')
    if limit < 0:
        raise ValueError('HTTP response limit must be nonnegative')
    payload = json.dumps([url, deadline, limit]).encode('utf-8')
    with subprocess.Popen(
            [sys.executable, '-I', str(Path(__file__).resolve()), '--http-worker'],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0) as worker:
        try:
            body, error = worker.communicate(payload, timeout=max(0, deadline - time.monotonic()))
        except BaseException as exc:
            worker.kill()
            worker.communicate()
            if isinstance(exc, subprocess.TimeoutExpired):
                raise TimeoutError('HTTP deadline exceeded') from None
            raise
        if time.monotonic() > deadline:
            raise TimeoutError('HTTP deadline exceeded')
        if worker.returncode:
            message = error.decode('utf-8', errors='replace')
            if worker.returncode == 2:
                raise TimeoutError(message)
            if worker.returncode == 3:
                raise RuntimeError(message)
            raise OSError('HTTP worker failed: ' + message)
        if len(body) > limit:
            raise RuntimeError('HTTP response too large')
        return body


def _http_bytes_worker(url, deadline, limit):
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise TimeoutError('HTTP deadline exceeded')
    request = Request(url, headers={'User-Agent': 'CLC-safe-photo-publisher/1',
                      'Accept': 'application/vnd.github+json',
                      'X-GitHub-Api-Version': '2026-03-10', 'Cache-Control': 'no-cache'})
    try:
        opened = urlopen(request, timeout=min(10, remaining))
    except HTTPError as error:
        status = error.code
        error.close()
        raise RuntimeError('HTTP ' + str(status) + '; retain pending batch and retry later') from None
    with opened as response:
        if response.status != 200:
            raise RuntimeError('Unexpected HTTP status: ' + str(response.status))
        chunks, size = [], 0
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise TimeoutError('HTTP body deadline exceeded')
            # Size checks stay local; the parent enforces the absolute deadline.
            chunk = response.read1(min(65536, limit + 1 - size))
            if not chunk:
                break
            chunks.append(chunk)
            size += len(chunk)
            if size > limit:
                raise RuntimeError('HTTP response too large')
        if time.monotonic() > deadline:
            raise TimeoutError('HTTP deadline exceeded')
        return b''.join(chunks)


def wait_for_deploy(sha, api_base='https://api.github.com', timeout=1200, poll=30):
    """GET public workflow-specific runs; exact push/main SHA, never another green run."""
    if not re.fullmatch(r'[0-9a-f]{40}', sha):
        raise ValueError('Invalid deployment SHA')
    deadline = time.monotonic() + timeout
    query = urlencode({'head_sha': sha, 'branch': 'main', 'event': 'push', 'per_page': 100})
    url = api_base.rstrip('/') + '/repos/ufaclc-a11y/clc-ufa/actions/workflows/deploy.yml/runs?' + query
    while time.monotonic() < deadline:
        data = json.loads(http_bytes(url, deadline, 2 * 1024 * 1024))
        runs = [run for run in data['workflow_runs']
                if run.get('head_sha') == sha and run.get('head_branch') == 'main'
                and run.get('event') == 'push' and run.get('path') == '.github/workflows/deploy.yml']
        if runs:
            run = max(runs, key=lambda value: (value['id'], value.get('run_attempt', 1)))
            if run.get('status') == 'completed':
                if run.get('conclusion') != 'success':
                    raise RuntimeError('Exact deploy workflow did not succeed: ' + str(run.get('conclusion')))
                return run
        time.sleep(min(max(30, poll), max(0, deadline - time.monotonic())))
    raise TimeoutError('Exact deploy workflow not successful before deadline; retry same batch')


class _Images(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = []

    def handle_starttag(self, tag, attrs):
        # data/portfolio.ts makeItems supplies this alt only to category grid items.
        # Hero and neighbouring-category thumbnails must not prove membership.
        if tag == 'img' and re.search(r' — пример [1-9][0-9]*$', dict(attrs).get('alt') or ''):
            for key, value in attrs:
                if key not in ('src', 'srcset') or not value:
                    continue
                for part in value.split(','):
                    parsed = urlsplit(part.strip().split()[0])
                    if parsed.path == '/_next/image':
                        nested = parse_qs(parsed.query).get('url', [''])[0]
                        self.sources.append(unquote(urlsplit(nested).path))
                    else:
                        self.sources.append(unquote(parsed.path))


def verify_live(batch, base='https://clc-ufa.ru', timeout=120):
    deadline = time.monotonic() + timeout
    pages = {}
    for item in batch['items']:
        path = '/images/portfolio/' + safe_name(item['dest'])
        body = http_bytes(base.rstrip('/') + path, deadline)
        if hashlib.sha256(body).hexdigest() != item['payload_sha256']:
            raise RuntimeError('Live image differs from selected batch: ' + item['dest'])
        for cat in item['categories']:
            if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', cat):
                raise ValueError('Unsafe category')
            if cat not in pages:
                parser = _Images()
                parser.feed(http_bytes(base.rstrip('/') + '/portfolio/' + cat, deadline).decode('utf-8'))
                pages[cat] = parser.sources
            if path not in pages[cat]:
                raise RuntimeError('Image not rendered in live category ' + cat + ': ' + item['dest'])



REMOTE = 'https://github.com/ufaclc-a11y/clc-ufa.git'


def git(cwd, *args, check=True):
    env = os.environ.copy()
    # Never inherit another repository/index/worktree from the launch environment.
    for key in list(env):
        if key.startswith('GIT_') and key not in ('GIT_SSH', 'GIT_SSH_COMMAND', 'GIT_ASKPASS', 'GIT_TERMINAL_PROMPT'):
            env.pop(key)
    result = subprocess.run(['git', *args], cwd=cwd, capture_output=True,
                            text=True, encoding='utf-8', errors='replace',
                            timeout=180, env=env,
                            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
    if check and result.returncode:
        raise RuntimeError('git ' + args[0] + ' failed: ' + result.stderr.strip())
    return result


def publish_batch(root, newdir, batch, attempts=3, log=lambda message: None):
    """Use an independent repository, not ROOT's index, commits or worktrees."""
    if not 1 <= attempts <= 3:
        raise ValueError('Publication attempts must be between 1 and 3')
    root, newdir = Path(root), Path(newdir)
    configured = git(root, 'remote', 'get-url', 'origin', check=False)
    remote = configured.stdout.strip() if configured.returncode == 0 else REMOTE
    if batch.get('remote') and batch['remote'] != remote:
        raise RuntimeError('Remote changed since batch preparation; retain receipt')
    batch['remote'] = remote
    save_batch(newdir, batch)
    identity = {}
    for key in ('user.name', 'user.email'):
        value = git(root, 'config', '--get', key, check=False)
        if value.returncode == 0:
            identity[key] = value.stdout.strip()
    for attempt in range(attempts):
        log('Чистая копия свежего main, попытка ' + str(attempt + 1))
        # A cleanup failure must not mask durable successful-push evidence.
        temporary = tempfile.mkdtemp(prefix='clc-publish-')
        try:
            work = Path(temporary)
            git(work, 'init')
            git(work, 'remote', 'add', 'origin', remote)
            for key, value in identity.items():
                git(work, 'config', key, value)
            git(work, 'fetch', '--no-tags', 'origin', 'main')
            base = git(work, 'rev-parse', 'FETCH_HEAD').stdout.strip()
            git(work, 'checkout', '--detach', base)
            candidate = batch.get('pushed_sha') or batch.get('candidate_sha')
            accepted = False
            if candidate:
                if not re.fullmatch(r'[0-9a-f]{40}', candidate):
                    raise RuntimeError('Invalid receipt SHA')
                accepted = git(work, 'merge-base', '--is-ancestor', candidate, base, check=False).returncode == 0
                if batch.get('pushed_sha') and not accepted:
                    raise RuntimeError('Accepted publication no longer on main; manual recovery required')
            manifest_path = work / 'data/portfolio-tags.json'
            remote_manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
            category_source = (work / 'data/portfolio.ts').read_text(encoding='utf-8')
            category_meta = re.search(r'const CATEGORY_META\b[^=]*=\s*\[(.*?)\]', category_source, re.S)
            if not category_meta:
                raise ValueError('Cannot verify remote category metadata')
            known_categories = set(re.findall(r"id:\s*'([a-z0-9-]+)'", category_meta.group(1)))
            for item in batch['items']:
                if not item['categories'] or not set(item['categories']).issubset(known_categories):
                    raise ValueError('Unknown remote portfolio category for ' + item['dest'])
            directory = work / 'public/images/portfolio'
            directory.mkdir(parents=True, exist_ok=True)
            paths = []
            for item in batch['items']:
                name = safe_name(item['dest'])
                target = directory / name
                payload = newdir / '.publisher/payload' / name
                if digest(payload) != item['payload_sha256']:
                    raise RuntimeError('Prepared payload changed')
                if target.is_symlink():
                    raise RuntimeError('Symbolic remote photo path')
                if target.exists() and digest(target) != item['payload_sha256']:
                    raise RuntimeError('Remote photo name collision: ' + name)
                if accepted:
                    if (not target.is_file() or not set(item['categories']).issubset(
                            remote_manifest.get(name, {}).get('categories', []))):
                        raise RuntimeError('Accepted batch was removed/changed remotely; will not restore it')
                elif not target.exists():
                    shutil.copyfile(payload, target)
                    paths.append('public/images/portfolio/' + name)
            if accepted:
                batch['pushed_sha'] = candidate
                save_batch(newdir, batch)
                return candidate
            merged = merge_manifest(remote_manifest, batch['items'])
            if merged != remote_manifest:
                atomic_json(manifest_path, merged)
            subprocess.run(['node', 'scripts/gen-portfolio.mjs'], cwd=work,
                           check=True, capture_output=True, timeout=120,
                           creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
            paths += ['data/portfolio-tags.json', 'data/portfolio.generated.ts']
            git(work, 'add', '--', *paths)
            if git(work, 'diff', '--cached', '--quiet', check=False).returncode == 0:
                # No-op still needs this exact main's successful deploy and live checks.
                batch['candidate_sha'] = base
                batch['pushed_sha'] = base
                save_batch(newdir, batch)
                return base
            git(work, 'commit', '-m', 'feat(portfolio): publish selected photo batch')
            sha = git(work, 'rev-parse', 'HEAD').stdout.strip()
            batch['candidate_sha'] = sha
            save_batch(newdir, batch)  # BEFORE push, including lost acknowledgement recovery.
            pushed = git(work, 'push', 'origin', 'HEAD:main', check=False)
            if pushed.returncode == 0:
                batch['pushed_sha'] = sha
                save_batch(newdir, batch)
                return sha
            log('Push не подтверждён; сверяю свежий main, оригиналы остаются на месте.')
        finally:
            try:
                shutil.rmtree(temporary)
            except OSError as error:
                log('Временную копию можно удалить вручную: ' + temporary + ' (' + str(error) + ')')
    raise RuntimeError('Push not confirmed after bounded retries; receipt and originals retained')



def atomic_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=path.name + '.', dir=path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            json.dump(value, stream, ensure_ascii=False, indent=2)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def safe_name(name):
    if (not isinstance(name, str) or name in ('', '.', '..')
            or any(c in name for c in '/\\\\:') or name.startswith('.')
            or name.endswith((' ', '.'))):
        raise ValueError('Unsafe photo path: ' + str(name))
    return name


def save_batch(newdir, batch):
    atomic_json(Path(newdir) / '.publisher' / 'active.json', batch)


def load_batch(newdir):
    path = Path(newdir) / '.publisher' / 'active.json'
    if path.exists():
        batch = json.loads(path.read_text(encoding='utf-8'))
        if batch.get('version') != 1:
            raise RuntimeError('Unknown publisher receipt version; retain it for recovery')
        return batch
    return None


def prepare_batch(newdir, selected, convert, extension):
    """Resume frozen content first, irrespective of subsequent UI assignments."""
    newdir = Path(newdir)
    state = newdir / '.publisher'
    batch = load_batch(newdir)
    if batch and not batch.get('complete'):
        for item in batch['items']:
            safe_name(item['source']); safe_name(item['dest'])
            if digest(state / 'payload' / item['dest']) != item['payload_sha256']:
                raise RuntimeError('Prepared payload changed; retain receipt for recovery')
        return batch
    if batch:
        atomic_json(state / 'last-completed.json', batch)
    if not selected:
        raise ValueError('No mapped photos selected')
    # Validate the entire selection before any conversion.
    for name, categories, tags in selected:
        safe_name(name)
        if not categories or any(not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', c) for c in categories):
            raise ValueError('No valid mapped categories for ' + name)
        if (newdir / name).is_symlink() or not (newdir / name).is_file():
            raise ValueError('Missing or symbolic source: ' + name)
    state.mkdir(parents=True, exist_ok=True)
    (state / 'raw').mkdir(exist_ok=True)
    (state / 'payload').mkdir(exist_ok=True)
    items = []
    for index, (name, categories, tags) in enumerate(selected):
        source = newdir / name
        raw = state / 'raw' / (str(index) + source.suffix.lower())
        data = source.read_bytes()
        raw.write_bytes(data)
        sha = hashlib.sha256(data).hexdigest()
        ext = extension(str(source))
        if ext not in ('.jpg', '.jpeg', '.png', '.webp', '.jfif'):
            raise ValueError('Unsupported output format')
        # Keep the established name scheme, but reject any remote hash collision.
        dest = 'p-' + hashlib.md5(data).hexdigest()[:12] + ext
        payload = state / 'payload' / dest
        convert(raw, payload)
        if digest(source) != sha:
            raise RuntimeError('Source changed during preparation: ' + name)
        items.append({'source': name, 'raw': raw.name, 'source_sha256': sha,
                      'dest': dest, 'payload_sha256': digest(payload),
                      'categories': list(dict.fromkeys(categories)), 'tags': list(tags)})
    batch = {'version': 1, 'items': items, 'candidate_sha': None,
             'pushed_sha': None, 'verified': False, 'complete': False}
    save_batch(newdir, batch)
    return batch


def archive_batch(newdir, batch, assignments):
    """Copy first, validate all sources, then remove; journal recoverable archive paths."""
    if not batch.get('verified'):
        raise RuntimeError('Batch is not verified on the live site')
    newdir = Path(newdir)
    archive = newdir / '_published'
    archive.mkdir(exist_ok=True)
    for item in batch['items']:
        source = newdir / safe_name(item['source'])
        if source.exists():
            if source.is_symlink() or digest(source) != item['source_sha256']:
                raise RuntimeError('Source changed before archival: ' + item['source'])
        elif not item.get('archive') or not (archive / safe_name(item['archive'])).is_file():
            raise RuntimeError('Source missing before archival: ' + item['source'])
        if item.get('archive'):
            if digest(archive / safe_name(item['archive'])) != item['source_sha256']:
                raise RuntimeError('Archive changed: ' + item['source'])
            continue
        target = archive / item['source']
        count = 1
        while target.exists():
            target = archive / (Path(item['source']).stem + '_' + str(count) + Path(item['source']).suffix)
            count += 1
        # Exclusive creation: never overwrite another original.
        with target.open('xb') as stream:
            stream.write(source.read_bytes())
            stream.flush()
            os.fsync(stream.fileno())
        if digest(target) != item['source_sha256']:
            raise RuntimeError('Source changed during archival: ' + item['source'])
        item['archive'] = target.name
        save_batch(newdir, batch)
    removed = []
    try:
        for item in batch['items']:
            source = newdir / item['source']
            if source.exists():
                if digest(source) != item['source_sha256']:
                    raise RuntimeError('Source changed before removal: ' + item['source'])
                source.unlink()
                removed.append(item)
        updated = copy.deepcopy(assignments)
        for item in batch['items']:
            # A newly edited assignment must not be erased by an old batch.
            if updated.get(item['source']) == item['tags']:
                updated.pop(item['source'], None)
        atomic_json(newdir / '.assignments.json', updated)
        batch['complete'] = True
        save_batch(newdir, batch)
    except Exception:
        batch['complete'] = False
        for item in removed:
            source = newdir / item['source']
            if not source.exists():
                with source.open('xb') as stream:
                    stream.write((archive / item['archive']).read_bytes())
        atomic_json(newdir / '.assignments.json', assignments)
        raise
    return updated



def merge_manifest(remote, items):
    """Add only requested memberships; never replace remote metadata/order."""
    result = copy.deepcopy(remote)
    minimum = {}
    for meta in result.values():
        for cat, order in meta.get('order', {}).items():
            minimum[cat] = min(minimum.get(cat, order), order)
    additions = {}
    for item in items:
        entry = result.setdefault(item['dest'], {'categories': [], 'order': {}})
        for cat in item['categories']:
            if cat not in entry['categories']:
                entry['categories'].append(cat)
                additions.setdefault(cat, []).append(item['dest'])
    for cat, names in additions.items():
        base = minimum.get(cat, 1) - len(names)
        for offset, name in enumerate(names):
            result[name].setdefault('order', {})[cat] = base + offset
    return result


if __name__ == '__main__':
    if sys.argv[1:] != ['--http-worker']:
        raise SystemExit('This module is imported by publish_photos.py')
    try:
        sys.stdout.buffer.write(_http_bytes_worker(*json.loads(sys.stdin.buffer.read())))
    except TimeoutError as exc:
        sys.stderr.write(str(exc))
        raise SystemExit(2)
    except RuntimeError as exc:
        sys.stderr.write(str(exc))
        raise SystemExit(3)
    except Exception:
        # No URLs, proxy credentials or unbounded upstream errors in IPC diagnostics.
        sys.stderr.write('HTTP transport error')
        raise SystemExit(4)
