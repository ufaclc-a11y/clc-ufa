"""
Переименование фото по SEO-именам на основе photo_tags.json
Запуск: python rename_photos.py
"""
import json, os, shutil, re, sys

sys.stdout.reconfigure(encoding='utf-8')

RESULTS_FILE = "D:/clc-ufa3/photo_tags.json"

# ── Транслитерация ──────────────────────────────────────────────────────────
TRANSLIT = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
    'з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o',
    'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
    'ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu',
    'я':'ya',
    'А':'a','Б':'b','В':'v','Г':'g','Д':'d','Е':'e','Ё':'yo','Ж':'zh',
    'З':'z','И':'i','Й':'y','К':'k','Л':'l','М':'m','Н':'n','О':'o',
    'П':'p','Р':'r','С':'s','Т':'t','У':'u','Ф':'f','Х':'kh','Ц':'ts',
    'Ч':'ch','Ш':'sh','Щ':'shch','Ъ':'','Ы':'y','Ь':'','Э':'e','Ю':'yu',
    'Я':'ya',
}

def to_slug(text):
    result = ''.join(TRANSLIT.get(c, c) for c in text)
    result = result.lower()
    result = re.sub(r'[^a-z0-9]+', '-', result)
    result = result.strip('-')
    return result

# ── Маппинг категорий в SEO-слаги ─────────────────────────────────────────
# Берём первую часть категории как основу, добавляем уточнение
CAT_SLUG = {
    # Лазерная резка
    "Лазерная резка акрила":       "lazernaya-rezka-akrila",
    "Лазерная резка картона":      "lazernaya-rezka-kartona",
    "Лазерная резка трафаретов":   "lazernaya-rezka-trafaretov",
    "Лазерная резка фанеры":       "lazernaya-rezka-fanery",
    # УФ-печать
    "UV DTF-наклейки":             "uv-dtf-nakleyки",
    "Печать на акриле":            "uf-pechat-na-akrile",
    "Печать на коже":              "uf-pechat-na-kozhe",
    "Печать на пластике":          "uf-pechat-na-plastike",
    "Печать на фанере":            "uf-pechat-na-fanere",
    # Гравировка на металле
    "Гравировка на адресниках":    "gravirovka-na-adresnike",
    "Гравировка на жетонах":       "gravirovka-na-zhetone",
    "Гравировка на кружках":       "gravirovka-na-kruzhke",
    "Гравировка на кулонах":       "gravirovka-na-kulone",
    "Гравировка на медалях":       "gravirovka-na-metall-medali",
    "Гравировка на ножах":         "gravirovka-na-nozhe",
    "Гравировка на термосе":       "gravirovka-na-termose",
    # Фрезерная резка
    "Изготовление менажниц":       "izgotovlenie-menazhnitsy",
    "Фрезеровка МДФ":              "frezernaya-rezka-mdf",
    "Фрезеровка ПВХ":              "frezernaya-rezka-pvkh",
    "Фрезеровка акрила":           "frezernaya-rezka-akrila",
    "Фрезеровка дерева":           "frezernaya-rezka-dereva",
    "Фрезеровка фанеры":           "frezernaya-rezka-fanery",
    # Гравировка на неметаллах
    "Гравировка на брелоках":      "gravirovka-na-breloke",
    "Гравировка на дереве":        "gravirovka-na-dereve",
    "Гравировка на коже":          "gravirovka-na-kozhe",
    "Гравировка на менажницах":    "gravirovka-na-menazhnitsy",
    "Гравировка на органайзерах":  "gravirovka-na-organayzerakh",
    "Гравировка на пластике":      "gravirovka-na-plastike",
    "Гравировка на фанере":        "gravirovka-na-fanere",
    "Гравировка на экокоже":       "gravirovka-na-ekokozhe",
    # Изделия
    "Акриловое клише":             "akrilovoe-klishe",
    "Бейджики":                    "bejdzhi-iz-akrila",
    "Брелоки":                     "breloki-iz-fanery",
    "Вывески":                     "vyveski-iz-akrila",
    "Заготовки для творчества":    "zagotovki-dlya-tvorchestva",
    "Копилки":                     "kopilki-iz-fanery",
    "Кормушки":                    "kormushki-iz-fanery",
    "Ключница":                    "klyuchnitsa-iz-fanery",
    "Медали":                      "medali-iz-akrila",
    "Медальница":                  "medalnitsa-iz-fanery",
    "Наградные статуэтки":         "nagradnye-statuetki",
    "Номерки для гардеробов":      "nomerki-dlya-garderoba",
    "Органайзеры":                 "organajzery-iz-fanery",
    "Таблички и указатели":        "tablitchki-i-ukazateli",
    "Тейбл тенты и менюхолдеры":  "tejbl-tenty-menyukholdery",
    "Хештеги":                     "derevyannye-kheshtegi",
    "Часы":                        "chasy-iz-fanery",
    "Шилдики из АБС пластика":    "shildiki-iz-abs-plastika",
    "Шкатулки из фанеры":          "shkatulki-iz-fanery",
}

def get_slug(categories):
    """Берёт первую подходящую категорию для имени файла."""
    skip = {"Пропустить (не в тему)"}
    for cat in categories:
        if cat in skip:
            continue
        if cat in CAT_SLUG:
            return CAT_SLUG[cat]
        # Запасной вариант — автотранслитерация
        return to_slug(cat)
    return "photo"

# ── Загрузка состояния ─────────────────────────────────────────────────────
with open(RESULTS_FILE, encoding='utf-8') as f:
    state = json.load(f)

tagged   = state.get('tagged', {})
dirs     = state.get('photo_dirs', [])

if not tagged:
    print("Нет тегированных фото в photo_tags.json")
    sys.exit(0)

# ── Поиск файлов ──────────────────────────────────────────────────────────
def find_file(name, dirs):
    for d in dirs:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return p
    return None

# ── Переименование ────────────────────────────────────────────────────────
# slug -> счётчик (для уникальных имён)
counters = {}
# old_name -> new_name (для обновления JSON)
rename_map = {}

# Сортируем для стабильного порядка
items = sorted(tagged.items())

print(f"Обрабатываем {len(items)} фото...\n")

renamed  = 0
skipped  = 0
not_found = 0

for old_name, categories in items:
    src = find_file(old_name, dirs)
    if not src:
        print(f"  НЕ НАЙДЕН: {old_name}")
        not_found += 1
        continue

    slug = get_slug(categories)
    ext  = os.path.splitext(old_name)[1].lower()
    if ext in ('.jfif', '.webp'):
        ext = '.jpg'  # нормализуем расширение

    n = counters.get(slug, 1)
    counters[slug] = n + 1

    new_name = f"{slug}-{n:03d}{ext}"
    new_path = os.path.join(os.path.dirname(src), new_name)

    if old_name == new_name:
        rename_map[old_name] = new_name
        skipped += 1
        continue

    # Если файл с таким именем уже есть — увеличиваем счётчик
    while os.path.exists(new_path) and new_path != src:
        n = counters[slug]
        counters[slug] = n + 1
        new_name = f"{slug}-{n:03d}{ext}"
        new_path = os.path.join(os.path.dirname(src), new_name)

    os.rename(src, new_path)
    rename_map[old_name] = new_name
    print(f"  {old_name}\n    → {new_name}")
    renamed += 1

# ── Обновление JSON ───────────────────────────────────────────────────────
new_tagged = {}
for old_name, categories in tagged.items():
    new_name = rename_map.get(old_name, old_name)
    new_tagged[new_name] = categories

state['tagged'] = new_tagged

with open(RESULTS_FILE, 'w', encoding='utf-8') as f:
    json.dump(state, f, ensure_ascii=False, indent=2)

print(f"\n{'='*50}")
print(f"Переименовано: {renamed}")
print(f"Не найдено:   {not_found}")
print(f"Без изменений: {skipped}")
print(f"JSON обновлён: {RESULTS_FILE}")
