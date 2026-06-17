"""
Импорт тегированных фото в portfolio.
1. Удаляет старые файлы из public/images/portfolio/
2. Проход 1: каждое фото → сервисный префикс (по первому тегу-услуге)
3. Проход 2: каждое фото → все продуктовые префиксы (по всем тегам)
4. Выводит отчёт с кол-вом по каждому префиксу

ВНИМАНИЕ: полный пересбор. Удаляет ВСЁ из portfolio и собирает заново из
photo_tags.json + архива. Ручные удаления файлов в public/images/portfolio/
ЗДЕСЬ НЕ УЧИТЫВАЮТСЯ и ВОСКРЕСНУТ — чтобы убрать фото совсем, сними с него теги
в photo_tagger.py (или удали запись в photo_tags.json) ДО запуска. Для простой
ДОзагрузки новых фото без пересбора используй import_new.py (append-only).
"""
import json, os, shutil, sys, collections, glob

sys.stdout.reconfigure(encoding='utf-8')

RESULTS_FILE = "D:/clc-ufa3/photo_tags.json"
DEST         = "D:/clc-ufa3/public/images/portfolio"

SERVICE_PREFIX = {
    "Лазерная резка фанеры":      "lazernaya-rezka",
    "Лазерная резка акрила":      "lazernaya-rezka",
    "Лазерная резка картона":     "lazernaya-rezka",
    "Лазерная резка трафаретов":  "lazernaya-rezka",
    "Печать на фанере":           "uf-pechat",
    "Печать на акриле":           "uf-pechat",
    "Печать на пластике":         "uf-pechat",
    "Печать на коже":             "uf-pechat",
    "UV DTF-наклейки":            "uf-pechat",
    "Гравировка на жетонах":      "gravirovka",
    "Гравировка на адресниках":   "gravirovka",
    "Гравировка на дереве":       "gravirovka",
    "Гравировка на фанере":       "gravirovka",
    "Гравировка на коже":         "gravirovka",
    "Гравировка на экокоже":      "gravirovka",
    "Гравировка на пластике":     "gravirovka",
    "Гравировка на менажницах":   "gravirovka",
    "Гравировка на органайзерах": "gravirovka",
    "Гравировка на термосе":      "gravirovka",
    "Гравировка на зажигалках":   "gravirovka",
    "Гравировка на изделиях":     "gravirovka",
    "Гравировка на брелоках":     "gravirovka",
    "Фрезеровка фанеры":          "frezernaya-rezka",
    "Фрезеровка дерева":          "frezernaya-rezka",
    "Фрезеровка МДФ":             "frezernaya-rezka",
    "Фрезеровка ПВХ":             "frezernaya-rezka",
    "Изготовление менажниц":      "frezernaya-rezka",
    "Гравировка на кулонах":      "gravirovka",
    "Гравировка на медалях":      "gravirovka",
}

PRODUCT_PREFIX = {
    "Коробки, ящики из фанеры":   "koroba-fanera",
    "Органайзеры":                "organajzery",
    "Наградные статуэтки":        "nagradnye-statuetki",
    "Медали":                     "medali",
    "Таблички и указатели":       "tablitchki",
    "Брелоки":                    "breloki",
    "Хештеги":                    "kheshtegi",
    "Вывески":                    "vyveski",
    "Шкатулки из фанеры":         "shkatulki-fanera",
    "Медальница":                 "medalnitsa",
    "Рамки для фото":             "ramki-foto",
    "Часы":                       "chasy",
    "Бейджики":                   "bejdzhi",
    "Кормушки":                   "kormushki",
    "Номерки для гардеробов":     "nomerki-garderob",
    "Ключница":                   "klyuchnitsa",
    "Тейбл тенты и менюхолдеры": "tejbl-tenty",
    "Заготовки для творчества":   "zagotovki",
    "Шилдики из АБС пластика":    "shildiki-abs",
    "Гравировка на часах":        "gravirovka-chasy",
}

ALL_PREFIX = {**SERVICE_PREFIX, **PRODUCT_PREFIX}

with open(RESULTS_FILE, encoding='utf-8') as f:
    state = json.load(f)

tagged = state.get('tagged', {})
dirs   = state.get('photo_dirs', [])

def find_file(name):
    for d in dirs:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return p
    return None

# ── Шаг 1: удаляем старые ─────────────────────────────────────────────────
print("Удаляем старые файлы из portfolio...")
deleted = sum(1 for f in glob.glob(os.path.join(DEST, "*.jpg")) if not os.remove(f))
print(f"  Удалено: {deleted} файлов\n")

counters = collections.Counter()
skip_cat = {"Пропустить (не в тему)"}

def copy_to(src, prefix):
    n = counters[prefix] + 1
    counters[prefix] = n
    dest = os.path.join(DEST, f"{prefix}-{n:03d}.jpg")
    shutil.copy2(src, dest)

# ── Шаг 2: сервисные папки (по первому сервисному тегу) ────────────────────
print("Проход 1: сервисные префиксы...")
svc_copied = 0
for filename, categories in sorted(tagged.items()):
    cats = [c for c in categories if c not in skip_cat]
    src  = find_file(filename)
    if not src:
        continue
    for cat in cats:
        if cat in SERVICE_PREFIX:
            copy_to(src, SERVICE_PREFIX[cat])
            svc_copied += 1
            break
print(f"  Скопировано: {svc_copied}")

# ── Шаг 3: продуктовые папки (по ВСЕМ продуктовым тегам) ──────────────────
print("Проход 2: продуктовые префиксы...")
prod_copied = 0
for filename, categories in sorted(tagged.items()):
    cats = [c for c in categories if c not in skip_cat]
    src  = find_file(filename)
    if not src:
        continue
    for cat in cats:
        if cat in PRODUCT_PREFIX:
            copy_to(src, PRODUCT_PREFIX[cat])
            prod_copied += 1
print(f"  Скопировано: {prod_copied}")

# ── Отчёт ──────────────────────────────────────────────────────────────────
print(f"\nВсего файлов в portfolio: {sum(counters.values())}")
print("\n" + "=" * 60)
print("ПРЕФИКСЫ ДЛЯ services.ts / products.ts:")
print("=" * 60)
print("\n-- УСЛУГИ --")
svc_prefixes = set(SERVICE_PREFIX.values())
for prefix, count in sorted(counters.items(), key=lambda x: -x[1]):
    if prefix in svc_prefixes:
        print(f"  portfolioPrefix: '{prefix}',  portfolioCount: {count},")
print("\n-- ИЗДЕЛИЯ --")
for prefix, count in sorted(counters.items(), key=lambda x: -x[1]):
    if prefix not in svc_prefixes:
        print(f"  portfolioPrefix: '{prefix}',  portfolioCount: {count},")
