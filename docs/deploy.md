# Развёртывание с нуля и защита сервера

Написано после инцидента 6 августа 2026: сервер был заблокирован хостингом за
«средства массового доступа к информационным ресурсам» и всплеск сетевой
нагрузки, доступ и данные восстановить не удалось. Причину провайдер не
раскрыл. Этот документ — чтобы повторное развёртывание было быстрым, а
повторение инцидента — менее вероятным.

## Что переживает потерю сервера

Всё содержимое сайта лежит в git: код, фотографии портфолио и товаров,
конфиг nginx. Приложение **не пишет на диск** и **не использует базу данных**,
заявки уходят почтой. Единственное, что существует только на сервере, —
`.env.local` с доступами к SMTP.

Практический вывод: терять нечего, кроме доступов. Их и надо менять при любом
подозрении, а восстановление — это развернуть репозиторий на чистой машине.

## Порядок развёртывания

1. Создать сервер (Ubuntu 24.04), **сразу с SSH-ключом**, без пароля root.
2. Защита (см. ниже) — до того, как сервер станет публично доступен.
3. Установить Node.js 20, nginx, certbot.
4. Склонировать репозиторий в `/var/www/clc-ufa` (именно `git clone` —
   деплой делает `git reset --hard origin/main` и без репозитория падает).
5. Создать `/var/www/clc-ufa/.env.local` по образцу `.env.example` — **без него
   форма заказа молча не отправляет письма**. Права: `chmod 600`.
6. Создать службу `/etc/systemd/system/clc-ufa.service` (см. ниже),
   `systemctl enable --now clc-ufa`.
7. Скопировать `nginx.conf` в `/etc/nginx/sites-available/clc-ufa`, сделать
   symlink в `sites-enabled`, проверить `nginx -t`.
8. Перевести A-запись домена на новый IP (TTL заранее снизить).
9. Выпустить сертификат: `certbot --nginx -d clc-ufa.ru -d www.clc-ufa.ru`.
10. **Завести ключ для деплоя** — самый забываемый шаг, из-за него деплой
    падает на `Deploy via SSH` без единой записи в журнале сервера (раннер не
    может аутентифицироваться и до подключения не доходит):

    ```bash
    ssh-keygen -t ed25519 -f /root/.ssh/github-deploy -N '' -C 'github-actions-deploy'
    cat /root/.ssh/github-deploy.pub >> /root/.ssh/authorized_keys
    chmod 600 /root/.ssh/authorized_keys
    ```

    Приватную часть (`cat /root/.ssh/github-deploy`) целиком, вместе со
    строками BEGIN/END, вставить в секрет `SSH_PRIVATE_KEY`.

11. Обновить остальные секреты GitHub Actions: `SSH_HOST` (адрес сервера),
    `SSH_USER` (`root`).
12. Запустить деплой (push в `main`) и дождаться health-check в логе Actions.

**Зелёный прогон не доказывает обновление прода.** Проверяйте на сервере:
`git log --oneline -1` и `systemctl show clc-ufa -p ActiveEnterTimestamp`.

## Служба systemd

```ini
[Unit]
Description=CLC-UFA Next.js website
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/clc-ufa
Environment=NODE_ENV=production
EnvironmentFile=-/var/www/clc-ufa/.env.local
ExecStart=/usr/bin/npm start -- -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Логи: `journalctl -u clc-ufa -n 50`. Перезапуск: `systemctl restart clc-ufa`.

`EnvironmentFile` разбирает файл сам, поэтому значения пишутся без кавычек и
без `export`.

## Защита сервера

Обязательный минимум. Первый пункт закрывает самый частый способ угона VPS —
перебор пароля root по SSH.

```bash
# /etc/ssh/sshd_config
PermitRootLogin prohibit-password
PasswordAuthentication no
```

```bash
systemctl restart ssh
```

Файрвол — только то, что нужно сайту:

```bash
ufw default deny incoming && ufw allow 22,80,443/tcp && ufw enable
```

Автоматические обновления безопасности и защита от перебора:

```bash
apt install -y unattended-upgrades fail2ban
```

## Правила эксплуатации

**Продакшн — только цель деплоя.** На нём не ведут разработку, не запускают
дев-серверы, агентов и любые туннели (ngrok, cloudflared, localtunnel, frp).
Туннель для провайдера неотличим от средства обхода блокировок — это прямой
путь к повторной блокировке. Разработка идёт локально или на отдельной
одноразовой машине.

**Ничего не ставится на сервер мимо репозитория.** Всё, что нужно сайту,
описано в коде и в этом файле. Если что-то поставили руками — это не
переживёт следующий переезд и не будет никем проверено.

**Периодически проверяйте, что слушает сервер:**

```bash
ss -tulpn
```

Ожидаемо: `:22`, `:80`, `:443`, `:3000` (Next.js за nginx) и локальный
резолвер. Всё остальное требует объяснения.

## Диагностика, если сайт недоступен

Порядок сужения проблемы:

1. `curl -sS -o /dev/null -w '%{http_code}' https://clc-ufa.ru/` — что отвечает.
2. **502** — nginx жив, приложение упало: `systemctl status clc-ufa`,
   `journalctl -u clc-ufa -n 50`.
3. **Connection refused** — не работает nginx: `systemctl status nginx`.
4. **Connection reset при открытом порте** — фильтрация на стороне провайдера,
   а не проблема сервера. Смотреть панель хостинга и почту.
5. Зелёный прогон Actions не доказывает, что прод обновился, — смотрите лог
   шага деплоя, а не только статус.
