#!/bin/bash
#
# Ручная выкатка на сервер — запасной путь, когда GitHub Actions недоступен
# или нужно выкатить срочно. Делает то же, что deploy-шаг workflow, но со
# страховкой: сохраняет текущую сборку и возвращает её, если новая не
# собралась или сайт не поднялся.
#
# Запускать НА СЕРВЕРЕ: bash scripts/deploy-manual.sh
#
set -uo pipefail

APP_DIR=/var/www/clc-ufa
SERVICE=clc-ufa
PORT=3000

cd "$APP_DIR" || { echo "нет каталога $APP_DIR"; exit 1; }
export PUPPETEER_SKIP_DOWNLOAD=true

echo '[1/6] сохраняю текущую сборку на случай отката'
rm -rf .next.bak
cp -a .next .next.bak 2>/dev/null || echo '  (нечего сохранять — первая сборка)'

echo '[2/6] обновляю код до origin/main'
git fetch --all --prune --quiet
git reset --hard --quiet origin/main
git log --oneline -1

echo '[3/6] зависимости'
npm ci --no-audit --no-fund 2>&1 | tail -3

echo '[4/6] сборка'
# .next-dev — артефакт `next dev`; устаревшие типы внутри ломают сборку
# ссылками на удалённые маршруты.
rm -rf .next .next-dev
if npm run build 2>&1 | tail -12; then
  echo '  сборка успешна'
else
  echo '  СБОРКА УПАЛА — возвращаю прежнюю версию'
  rm -rf .next && mv .next.bak .next
  systemctl restart "$SERVICE"
  exit 1
fi

echo '[5/6] перезапуск службы'
systemctl restart "$SERVICE"

echo '[6/6] проверка здоровья'
for _ in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/" || true)
  if [ "$code" = '200' ]; then
    echo '  сайт отвечает 200'
    rm -rf .next.bak
    exit 0
  fi
  sleep 3
done

echo '  сайт НЕ отвечает — откатываюсь'
rm -rf .next && mv .next.bak .next
systemctl restart "$SERVICE"
echo "  смотрите: journalctl -u $SERVICE -n 50"
exit 1
