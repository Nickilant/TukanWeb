# Tukan Blog (Node.js + SQLite)

Перенесено со статического HTML на полноценное full-stack приложение:

- **Backend:** Express
- **Template engine:** EJS
- **DB:** SQLite (`better-sqlite3`)
- **Редактор статей:** Quill (bold/headers/quotes/lists/links/images)
- **Админка:** секретная ссылка + пароль
- **Контейнеризация:** Docker + docker-compose

## Быстрый старт

1. Скопируй env:

```bash
cp .env.example .env
```

2. Сгенерируй bcrypt-хеш пароля админа:

```bash
node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"
```

3. Вставь этот хеш в `ADMIN_PASSWORD_HASH` в `.env`.

4. Запусти через Docker:

```bash
docker compose up --build
```

5. Открой:

- Блог: `http://localhost:3000`
- Логин админки: `http://localhost:3000/admin/<ADMIN_SECRET_PATH>/login`

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
