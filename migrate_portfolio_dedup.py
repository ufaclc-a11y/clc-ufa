"""
migrate_portfolio_dedup.py — дедупликация portfolio: одно фото = один файл.

Группирует файлы public/images/portfolio/ по содержимому (md5). В каждой группе
байт-идентичных копий оставляет один «выживший» файл, остальные удаляет, а все
прямые ссылки на удалённые имена в *.ts/*.tsx переписывает на выжившее имя
(картинка та же — копии идентичны). Категории фото = объединение префиксов всех
его копий; пишется в data/portfolio-tags.json ({ "файл.jpg": ["cat1","cat2"] }).

Выбор выжившего: предпочитаем уже «закреплённое» имя (на которое есть ссылка в
коде) — так меньше рерайтов и меньше изменений URL в sitemap.

  python migrate_portfolio_dedup.py          # dry-run: отчёт + запись манифеста
  python migrate_portfolio_dedup.py --apply   # + рерайт ссылок + удаление дублей
"""
import os, glob, re, json, hashlib, subprocess, sys, collections

sys.stdout.reconfigure(encoding="utf-8")

ROOT     = "D:/clc-ufa3"
DEST     = os.path.join(ROOT, "public/images/portfolio")
MANIFEST = os.path.join(ROOT, "data/portfolio-tags.json")
APPLY    = "--apply" in sys.argv
NAME_RE  = re.compile(r"^(.+)-(\d+)\.(jpe?g|png|webp)$", re.I)


def md5(path):
    return hashlib.md5(open(path, "rb").read()).hexdigest()


# ── Закреплённые имена (есть прямая ссылка в коде/данных) ─────────────────────
grep = subprocess.run(
    ["git", "grep", "-ohE", r"/images/portfolio/[A-Za-z0-9_-]+\.(jpe?g|png|webp)",
     "--", "*.ts", "*.tsx"],
    capture_output=True, text=True, cwd=ROOT,
).stdout
pinned = {os.path.basename(x) for x in grep.splitlines()}
pinned.discard("filename.jpg")

# ── Группировка по содержимому ────────────────────────────────────────────────
groups = collections.defaultdict(list)
for p in glob.glob(os.path.join(DEST, "*")):
    if os.path.isfile(p):
        groups[md5(p)].append(os.path.basename(p))


def prefix_of(name):
    m = NAME_RE.match(name)
    return m.group(1) if m else None

def order_of(name):
    m = NAME_RE.match(name)
    return int(m.group(2)) if m else 0


def pick_survivor(files):
    pin = sorted(f for f in files if f in pinned)
    pool = pin if pin else sorted(files)
    # предпочитаем имя, подходящее под шаблон prefix-NNN
    matched = [f for f in pool if NAME_RE.match(f)]
    return (matched or pool)[0]


manifest   = {}
rename_map = {}   # удаляемое_имя -> выжившее
order_hint = {}   # выжившее -> {cat: min_order} (для стабильного порядка)

for files in groups.values():
    survivor = pick_survivor(files)
    cats = collections.defaultdict(lambda: 10**9)
    for f in files:
        c = prefix_of(f)
        if c:
            cats[c] = min(cats[c], order_of(f))
        if f != survivor:
            rename_map[f] = survivor
    manifest[survivor] = sorted(cats)
    order_hint[survivor] = dict(cats)

# манифест с порядком: { file: { "categories": [...], "order": {cat:n} } }
manifest_full = {
    f: {"categories": manifest[f], "order": order_hint[f]}
    for f in sorted(manifest)
}

# ── Отчёт ────────────────────────────────────────────────────────────────────
total = sum(len(v) for v in groups.values())
print(f"Файлов: {total}  | уникальных: {len(groups)}  | к удалению: {len(rename_map)}")
print(f"Закреплённых ссылок: {len(pinned)}  | будет переписано имён: {len(set(rename_map))}")
multi = sum(1 for v in manifest.values() if len(v) > 1)
print(f"Фото в >1 категории: {multi}")

# проверка: каждое закреплённое имя либо выживает, либо имеет рерайт на выжившего
broken = [p for p in pinned if p in rename_map and rename_map[p] not in manifest]
print(f"Закреплённых без валидного рерайта (должно быть 0): {len(broken)}")

# ── Запись манифеста (безопасно, регенерируемо) ──────────────────────────────
json.dump(manifest_full, open(MANIFEST, "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)
print(f"\nМанифест записан: {MANIFEST}")

if not APPLY:
    print("\n[dry-run] Ссылки не переписаны, файлы не удалены. Запусти с --apply.")
    sys.exit(0)

# ── Рерайт ссылок в *.ts/*.tsx ────────────────────────────────────────────────
files_ts = subprocess.run(["git", "ls-files", "*.ts", "*.tsx"],
                          capture_output=True, text=True, cwd=ROOT).stdout.splitlines()
rewrites = 0
for rel in files_ts:
    if rel.endswith("portfolio.generated.ts"):
        continue
    path = os.path.join(ROOT, rel)
    txt = open(path, encoding="utf-8").read()
    new = txt
    for old, surv in rename_map.items():
        new = new.replace(f"/images/portfolio/{old}", f"/images/portfolio/{surv}")
    if new != txt:
        open(path, "w", encoding="utf-8", newline="").write(new)
        rewrites += 1
print(f"[apply] Файлов с переписанными ссылками: {rewrites}")

# ── Удаление дублей ───────────────────────────────────────────────────────────
removed = 0
for name in rename_map:
    p = os.path.join(DEST, name)
    if os.path.exists(p):
        os.remove(p); removed += 1
print(f"[apply] Удалено файлов: {removed}")
print("Дальше: npm run gen:portfolio, затем tsc/lint/test/build.")
