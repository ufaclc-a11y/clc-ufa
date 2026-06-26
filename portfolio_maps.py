"""
Единый маппинг тег → категория-портфолио (= portfolioPrefix на сайте).
Импортируется и import_new.py, и import_portfolio.py — правим в одном месте.

Категория в новой модели — это id из data/portfolio.ts CATEGORY_META; одно фото
может входить в несколько категорий (см. data/portfolio-tags.json).
"""

# Сервисные теги (лазер/печать/гравировка/фрезеровка)
SERVICE_PREFIX = {
    "Лазерная резка фанеры": "lazernaya-rezka", "Лазерная резка акрила": "lazernaya-rezka",
    "Лазерная резка картона": "lazernaya-rezka", "Лазерная резка трафаретов": "trafarety",
    "Печать на фанере": "uf-pechat", "Печать на акриле": "uf-pechat",
    "Печать на пластике": "uf-pechat", "Печать на коже": "uf-pechat", "UV DTF-наклейки": "uf-pechat",
    "Гравировка на жетонах": "zhetony", "Гравировка на адресниках": "adresniki",
    "Гравировка на дереве": "gravirovka", "Гравировка на фанере": "gravirovka",
    "Гравировка на коже": "gravirovka", "Гравировка на экокоже": "gravirovka",
    "Гравировка на пластике": "gravirovka", "Гравировка на менажницах": "gravirovka",
    "Гравировка на органайзерах": "gravirovka", "Гравировка на термосе": "termosy",
    "Гравировка на зажигалках": "zazhigalki", "Гравировка на изделиях": "gravirovka",
    "Гравировка на брелоках": "gravirovka", "Гравировка на кулонах": "kulony",
    "Гравировка на медалях": "gravirovka",
    "Фрезеровка фанеры": "frezernaya-rezka", "Фрезеровка дерева": "frezernaya-rezka",
    "Фрезеровка МДФ": "frezernaya-rezka", "Фрезеровка ПВХ": "frezernaya-rezka",
    "Изготовление менажниц": "frezernaya-rezka",
}

# Продуктовые теги (конкретные изделия)
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
    "Акриловое клише": "akril-klishe",
    "Топперы": "toppery",
}

ALL_PREFIX = {**SERVICE_PREFIX, **PRODUCT_PREFIX}
SKIP_TAGS = {"Пропустить (не в тему)"}


def categories_for(tags):
    """Все категории фото по его тегам (новая модель: многокатегорийность)."""
    cats = []
    for t in tags:
        if t in ALL_PREFIX and ALL_PREFIX[t] not in cats:
            cats.append(ALL_PREFIX[t])
    return cats


def unmapped(tags):
    """Теги, не привязанные ни к одной категории (кроме служебных)."""
    return [t for t in tags if t not in ALL_PREFIX and t not in SKIP_TAGS]
