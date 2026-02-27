# Tukan Blog (Node.js + SQLite)

Перенесено со статического HTML на полноценное full-stack приложение:

- **Backend:** Express
- **Template engine:** EJS
- **DB:** SQLite (`better-sqlite3`)
- **Редактор статей:** Quill (bold/headers/quotes/lists/links/images)
- **Админка:** секретная ссылка + пароль
- **Контейнеризация:** Docker + docker-compose

## Быстрый старт через Docker

1. Скопируй env:

```bash
cp .env.example .env
```

2. Сгенерируй bcrypt-хеш пароля (любой удобный вариант):

**Вариант A (локально, после `npm install`)**
```bash
npm run hash-password -- "your_password"
```

**Вариант B (без локального Node/npm, внутри контейнера)**
```bash
docker run --rm -it node:20-slim sh -lc "npm i -g bcryptjs >/dev/null 2>&1 && node -e \"console.log(require('bcryptjs').hashSync('your_password',10))\""
```

3. Вставь полученный хеш в `ADMIN_PASSWORD_HASH` в `.env`.

> Важно: в `.env` НЕ используй шаблон вида `$2a$10$replace...`.
> Используй только реальный сгенерированный bcrypt-хеш.

4. Запусти:

```bash
docker compose up --build
```

5. Открой:

- Блог: `http://localhost:3000`
- Админка: `http://localhost:3000/admin/<ADMIN_SECRET_PATH>/login`

## Локальный запуск без Docker

```bash
npm install
npm start
```

## Переменные окружения

- `PORT` — порт приложения
- `SESSION_SECRET` — ключ подписи сессии
- `ADMIN_SECRET_PATH` — секретный сегмент URL админки
- `ADMIN_PASSWORD_HASH` — bcrypt-хеш пароля
- `TELEGRAM_BOT_TOKEN` — вынесен в .env
- `TELEGRAM_CHAT_ID` — вынесен в .env

## Частые проблемы

### 1) `Cannot find module 'bcryptjs'`
Ты запускал команду в папке, где не выполнен `npm install`.

Решение:
- либо выполнить `npm install`, затем `npm run hash-password -- "пароль"`
- либо использовать Docker-вариант из инструкции выше

### 2) `replace_with_bcrypt_hash variable is not set`
В `.env` остался шаблон вместо реального хеша.

Решение:
- сгенерировать хеш и вставить его целиком в `ADMIN_PASSWORD_HASH`

### 3) `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`
Docker Desktop не запущен или не установлен.

Решение:
- запустить Docker Desktop
- дождаться статуса *Engine running*
- повторить `docker compose up --build`
