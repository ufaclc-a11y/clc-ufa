# CLC-UFA — Сайт производственной мастерской

Next.js 14 · TypeScript · Tailwind CSS

---

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Создать файл с переменными окружения
cp .env.example .env.local
# Отредактируйте .env.local — добавьте TG_BOT_TOKEN и TG_CHAT_ID

# 3. Запустить
npm run dev

# 4. Открыть
http://localhost:3000
```

---

## Структура проекта

```
app/
  page.tsx                     # Главная
  layout.tsx                   # Шапка, футер, JSON-LD, мета
  sitemap.ts                   # Автосайтмап
  robots.ts                    # robots.txt
  not-found.tsx                # Страница 404
  global-error.tsx             # Страница ошибки
  services/
    page.tsx                   # /services
    [slug]/page.tsx            # /services/lazernaya-rezka и др.
  b2b/page.tsx                 # /b2b
  portfolio/page.tsx           # /portfolio
  products/page.tsx            # /products
  contacts/page.tsx            # /contacts
  [slug]/page.tsx              # SEO-лендинги из data/seo-pages.ts
  api/send-order/route.ts      # Отправка заявки в Telegram

components/                    # Все компоненты
data/                          # Вся контентная модель
scripts/
  import-telegram-media.ts     # Импорт из D:\TGArhiv
public/images/                 # Фото для сайта
public/videos/                 # Видео для сайта
```

---

## Подключение формы заявок (Telegram)

1. Создайте бота через [@BotFather](https://t.me/BotFather) → `/newbot`
2. Скопируйте токен
3. Напишите боту `/start`
4. Откройте `https://api.telegram.org/bot<ТОКЕН>/getUpdates` — найдите `"chat":{"id":...}`
5. Создайте файл `.env.local`:

```env
TG_BOT_TOKEN=1234567890:AABB...
TG_CHAT_ID=123456789
```

Готово. Заявки из формы будут приходить в Telegram.

---

## Импорт фото из Telegram-архива

```bash
npm run import-media -- --src="D:\TGArhiv"
```

Скрипт:
- Рекурсивно обходит папку `D:\TGArhiv`
- Копирует фото в `public/images/imported/`
- Копирует видео в `public/videos/imported/`
- Создаёт `data/imported-media.json` с метаданными

После импорта:
1. Откройте `data/imported-media.json`
2. Для каждого файла заполните поле `"category"`:
   - `medali` — медали и награды
   - `tablichki` — таблички и шильдики
   - `vyveski` — вывески
   - `uf-pechat` — УФ-печать
   - `lazernaya-rezka` — лазерная резка
   - `gravirovka` — гравировка
   - `frezernaya-rezka` — фрезеровка
   - `b2b-detali` — детали для производств
   - `suveniры` — сувениры
   - `inter-er` — интерьер
   - `zagotovki` — заготовки
3. Лучшие фото скопируйте в `public/images/portfolio/`
4. Добавьте записи в `data/portfolio.ts`

---

## Как добавить работу в портфолио

1. Положите фото в `public/images/portfolio/` (лучше WebP, до 300 КБ)
2. В `data/portfolio.ts` добавьте объект:

```ts
{
  id:          'уникальный-id',
  title:       'Название работы',
  category:    'medali',
  tags:        ['медали', 'акрил'],
  material:    ['Акрил 3 мм'],
  technology:  ['Лазерная резка', 'УФ-печать'],
  image:       '/images/portfolio/filename.jpg',
  alt:         'Описание для SEO',
}
```

---

## Как добавить SEO-страницу

В `data/seo-pages.ts` добавьте объект:

```ts
{
  slug:        'uf-pechat-na-fanere-ufa',
  title:       'SEO-заголовок | CLC-UFA',
  h1:          'УФ-печать на фанере в Уфе',
  description: 'Мета-описание до 160 символов',
  service:     'uf-pechat',
  material:    'fanera',
  bodyText:    'Текст для страницы',
}
```

Страница автоматически появится по адресу `/uf-pechat-na-fanere-ufa`.

---

## Добавить карту Яндекса

В `app/contacts/page.tsx` найдите комментарий `"Вставьте виджет"` и замените блок на iframe:

```tsx
<iframe
  src="https://yandex.ru/map-widget/v1/?ll=55.9779,54.7065&z=16&pt=55.9779,54.7065,pm2rdl"
  width="100%"
  height="100%"
  frameBorder="0"
  allowFullScreen
/>
```

Создайте виджет с нужными настройками на [yandex.ru/map-constructor](https://yandex.ru/map-constructor).

---

## Деплой на Vercel

```bash
npm install -g vercel
vercel         # первый раз
vercel --prod  # продакшн
```

После деплоя:
1. В настройках проекта на vercel.com добавьте переменные окружения:
   `TG_BOT_TOKEN` и `TG_CHAT_ID`
2. Привяжите домен `clc-ufa.ru` в разделе Domains
