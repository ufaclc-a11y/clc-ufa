"""
import_new.py — ДОзагрузка новых фото в portfolio (новая модель: один файл = одно фото).

Берёт новые записи photo_tags.json (+ старые, что раньше выпадали из-за
незамапленного тега) и для каждой:
  * копирует исходник ОДИН раз в public/images/portfolio/ под именем p-<hash>.<ext>
    (имя по содержимому → повторный запуск идемпотентен, дублей не плодит);
  * прописывает в data/portfolio-tags.json ВСЕ его категории (многокатегорийность);
  * ГРОМКО предупреждает о тегах, не привязанных к категории (иначе фото молча выпало бы).

Категория-папка больше НЕ кодируется в имени файла — связь в манифесте.

  python import_new.py          # dry-run: показать план + предупреждения
  python import_new.py --apply   # выполнить копирование и обновить манифест
Затем: npm run gen:portfolio
"""
import json, os, glob, hashlib, shutil, subprocess, sys, collections

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from portfolio_maps import categories_for, unmapped, ALL_PREFIX, SKIP_TAGS

ROOT     = "D:/clc-ufa3"
TAGS     = f"{ROOT}/photo_tags.json"
DEST     = f"{ROOT}/public/images/portfolio"
MANIFEST = f"{ROOT}/data/portfolio-tags.json"
APPLY    = "--apply" in sys.argv

state  = json.load(open(TAGS, encoding="utf-8"))
tagged = state["tagged"]
dirs   = state.get("photo_dirs", [])
head   = json.loads(subprocess.check_output(["git", "show", "HEAD:photo_tags.json"]).decode("utf-8"))["tagged"]
manifest = json.load(open(MANIFEST, encoding="utf-8")) if os.path.exists(MANIFEST) else {}

def find_src(name):
    for d in dirs:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return p
    return None

# Список на загрузку: новые ключи + старые, что раньше выпадали (тег не маппился, теперь маппится)
new_keys = [k for k in tagged if k not in head]
prev_dropped = [k for k, t in head.items() if not categories_for(t) and categories_for(tagged.get(k, t))]
import_list = list(dict.fromkeys(new_keys + prev_dropped))

# Текущий максимум order по каждой категории — чтобы дописывать в конец
maxorder = collections.defaultdict(int)
for meta in manifest.values():
    for c, n in (meta.get("order") or {}).items():
        maxorder[c] = max(maxorder[c], n)

planned, warnings, missing = [], [], []
for name in import_list:
    src = find_src(name)
    if not src:
        missing.append(name); continue
    tags = [t for t in tagged.get(name, []) if t not in SKIP_TAGS]
    cats = categories_for(tags)
    bad  = unmapped(tags)
    if bad:
        warnings.append((name, bad))
    if not cats:
        continue  # совсем нечего раскладывать
    ext  = os.path.splitext(src)[1].lower() or ".jpg"
    dest_name = f"p-{hashlib.md5(open(src,'rb').read()).hexdigest()[:12]}{ext}"
    order = {}
    for c in cats:
        maxorder[c] += 1
        order[c] = maxorder[c]
    planned.append((src, dest_name, cats, order))

# ── Предупреждения о незамапленных тегах ─────────────────────────────────────
if warnings:
    print("⚠  ВНИМАНИЕ: теги без категории — фото по ним НЕ попадёт в эти разделы:")
    for name, bad in warnings:
        print(f"     {name}: {bad}")
    print("   Добавь их в portfolio_maps.py, если нужно их учитывать.\n")

# ── Отчёт ────────────────────────────────────────────────────────────────────
print(f"К загрузке: {len(import_list)} исходников (новых {len(new_keys)} + ранее выпавших {len(prev_dropped)})")
print(f"Будет добавлено файлов: {len(planned)}")
bycat = collections.Counter(c for _, _, cats, _ in planned for c in cats)
for c, n in sorted(bycat.items()):
    print(f"  +{n:2d}  {c}")
if missing:
    print(f"\nНе найден исходник ({len(missing)}): " + ", ".join(missing))

if not APPLY:
    print("\n[dry-run] Ничего не скопировано. Запусти с --apply.")
    sys.exit(0)

# ── Применение ───────────────────────────────────────────────────────────────
for src, dest_name, cats, order in planned:
    shutil.copy2(src, os.path.join(DEST, dest_name))
    manifest[dest_name] = {"categories": sorted(cats), "order": order}

json.dump(dict(sorted(manifest.items())), open(MANIFEST, "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)
print(f"\n[apply] Скопировано файлов: {len(planned)}; манифест обновлён.")
print("Дальше: npm run gen:portfolio, затем tsc/lint/test/build.")
