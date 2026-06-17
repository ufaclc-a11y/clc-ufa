"""
import_new.py — ДОзагрузка новых фото в portfolio (append-only).

В отличие от import_portfolio.py НЕ удаляет и НЕ перенумеровывает существующее.
Берёт только:
  * новые записи photo_tags.json (которых не было в git HEAD), и
  * старые записи, которые раньше выпадали из-за незамапленного тега,
    а теперь маппятся (напр. профильный шильдик).
и дописывает их копии к существующим prefix-NNN.jpg (NNN продолжается с максимума).

  python import_new.py          # dry-run: показать план
  python import_new.py --apply  # выполнить копирование
"""
import json, os, glob, re, shutil, subprocess, sys, collections

sys.stdout.reconfigure(encoding="utf-8")

ROOT = "D:/clc-ufa3"
TAGS = f"{ROOT}/photo_tags.json"
DEST = f"{ROOT}/public/images/portfolio"
APPLY = "--apply" in sys.argv

# ── Маппинги (синхронизированы с import_portfolio.py) ─────────────────────────
SERVICE_PREFIX = {
    "Лазерная резка фанеры": "lazernaya-rezka", "Лазерная резка акрила": "lazernaya-rezka",
    "Лазерная резка картона": "lazernaya-rezka", "Лазерная резка трафаретов": "lazernaya-rezka",
    "Печать на фанере": "uf-pechat", "Печать на акриле": "uf-pechat",
    "Печать на пластике": "uf-pechat", "Печать на коже": "uf-pechat", "UV DTF-наклейки": "uf-pechat",
    "Гравировка на жетонах": "gravirovka", "Гравировка на адресниках": "gravirovka",
    "Гравировка на дереве": "gravirovka", "Гравировка на фанере": "gravirovka",
    "Гравировка на коже": "gravirovka", "Гравировка на экокоже": "gravirovka",
    "Гравировка на пластике": "gravirovka", "Гравировка на менажницах": "gravirovka",
    "Гравировка на органайзерах": "gravirovka", "Гравировка на термосе": "gravirovka",
    "Гравировка на зажигалках": "gravirovka", "Гравировка на изделиях": "gravirovka",
    "Гравировка на брелоках": "gravirovka",
    "Фрезеровка фанеры": "frezernaya-rezka", "Фрезеровка дерева": "frezernaya-rezka",
    "Фрезеровка МДФ": "frezernaya-rezka", "Фрезеровка ПВХ": "frezernaya-rezka",
    "Изготовление менажниц": "frezernaya-rezka",
    "Гравировка на кулонах": "gravirovka", "Гравировка на медалях": "gravirovka",
}
PRODUCT_PREFIX = {
    "Коробки, ящики из фанеры": "koroba-fanera", "Органайзеры": "organajzery",
    "Наградные статуэтки": "nagradnye-statuetki", "Медали": "medali",
    "Таблички и указатели": "tablitchki", "Брелоки": "breloki", "Хештеги": "kheshtegi",
    "Вывески": "vyveski", "Шкатулки из фанеры": "shkatulki-fanera", "Медальница": "medalnitsa",
    "Рамки для фото": "ramki-foto", "Часы": "chasy", "Бейджики": "bejdzhi",
    "Кормушки": "kormushki", "Номерки для гардеробов": "nomerki-garderob",
    "Ключница": "klyuchnitsa", "Тейбл тенты и менюхолдеры": "tejbl-tenty",
    "Заготовки для творчества": "zagotovki",
    "Шилдики из АБС пластика": "shildiki-abs", "Гравировка на часах": "gravirovka-chasy",
}
# теги, добавленные в этой итерации (для вычисления "раньше выпадавших")
NEW_TAGS = {"Гравировка на кулонах", "Гравировка на медалях",
            "Шилдики из АБС пластика", "Гравировка на часах"}
OLD_MAPPED = (set(SERVICE_PREFIX) | set(PRODUCT_PREFIX)) - NEW_TAGS
SKIP = {"Пропустить (не в тему)"}

# ── Данные ───────────────────────────────────────────────────────────────────
state  = json.load(open(TAGS, encoding="utf-8"))
tagged = state["tagged"]
dirs   = state.get("photo_dirs", [])
head   = json.loads(subprocess.check_output(["git", "show", "HEAD:photo_tags.json"]).decode("utf-8"))["tagged"]

def find_src(name):
    for d in dirs:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return p
    return None

# Список на загрузку: новые ключи + старые «ранее выпавшие, теперь маппятся»
new_keys = [k for k in tagged if k not in head]
prev_dropped = [k for k, tags in head.items()
                if not any(t in OLD_MAPPED for t in tags)
                and any(t in NEW_TAGS for t in tags)]
import_list = list(dict.fromkeys(new_keys + prev_dropped))

# Текущий максимальный индекс по каждому префиксу
maxn = collections.defaultdict(int)
for p in glob.glob(os.path.join(DEST, "*")):
    m = re.match(r"^(.+)-(\d+)\.(jpe?g|png|webp)$", os.path.basename(p), re.I)
    if m:
        maxn[m.group(1)] = max(maxn[m.group(1)], int(m.group(2)))

planned = []  # (src, dest)
def queue(src, prefix):
    maxn[prefix] += 1
    planned.append((src, os.path.join(DEST, f"{prefix}-{maxn[prefix]:03d}.jpg")))

missing = []
for name in import_list:
    src = find_src(name)
    if not src:
        missing.append(name)
        continue
    tags = [t for t in tagged.get(name, []) if t not in SKIP]
    # Проход 1: один сервисный префикс (первый совпавший тег)
    for t in tags:
        if t in SERVICE_PREFIX:
            queue(src, SERVICE_PREFIX[t]); break
    # Проход 2: все продуктовые префиксы
    for t in tags:
        if t in PRODUCT_PREFIX:
            queue(src, PRODUCT_PREFIX[t])

# ── Отчёт ────────────────────────────────────────────────────────────────────
by_prefix = collections.Counter(re.match(r"^(.+)-\d+\.jpg$", os.path.basename(d)).group(1) for _, d in planned)
print(f"К загрузке исходников: {len(import_list)} (новых {len(new_keys)} + ранее выпавших {len(prev_dropped)})")
print(f"Запланировано копий:   {len(planned)}\n")
for prefix, cnt in sorted(by_prefix.items()):
    print(f"  +{cnt:2d}  {prefix}")
if missing:
    print(f"\nНе найден исходник ({len(missing)}):")
    for n in missing: print("   ", n)

if not APPLY:
    print("\n[dry-run] Ничего не скопировано. Запусти с --apply.")
else:
    for src, dest in planned:
        shutil.copy2(src, dest)
    print(f"\n[apply] Скопировано файлов: {len(planned)}.")
    print("Дальше: npm run gen:portfolio и обнови portfolioCount в data/products.ts.")
