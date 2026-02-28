# Tukan Web Landing (React + Vite)

Лендинг переведён со статического HTML на React (Vite), с сохранением текущего внешнего вида.

## Запуск через Docker Compose

1. Скопируйте пример env-файла:

```bash
cp .env.example .env
```

2. Заполните переменные в `.env`:

- `VITE_TG_BOT_TOKEN` — токен Telegram-бота.
- `VITE_TG_CHAT_ID` — ID пользователя/чата в Telegram.

3. Запустите проект:

```bash
docker-compose up --build
```

4. Откройте в браузере:

- http://localhost:8088

> Используется **нестандартный порт 8088**.

## Локальный запуск без Docker

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

## Где хранить лого и медиа

Складывайте логотипы и остальные медиа в:

- `public/media/`

Примеры путей в разметке:

- `/media/lolgoC.png`
- `/media/logo.png`
- `/media/menubo.png`

Если нужно заменить картинки — просто положите новые файлы в `public/media` и обновите путь в `src/landing-markup.html`.

## Где указывать Telegram-токен и ID

Только в `.env` (по примеру `.env.example`):

```env
VITE_TG_BOT_TOKEN=...
VITE_TG_CHAT_ID=...
```

В коде они читаются в `src/landing-script.js` через `import.meta.env`.
