# Tukan Web (React + Docker)

Лендинг и страница блога перенесены в React-приложение с роутами:
- `/` — лендинг
- `/blog` — блог

## Локальный запуск

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

Открыть: `http://localhost:4173`

## Production сборка

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

## Запуск в Docker

### 1) Сборка образа

```bash
docker build -t tukanweb-react .
```

### 2) Запуск контейнера

```bash
docker run --rm -p 8080:80 tukanweb-react
```

Открыть: `http://localhost:8080`

## Что внутри контейнера

- Multi-stage build:
  - `node:20-alpine` для сборки Vite-приложения
  - `nginx:1.27-alpine` для раздачи статики
- В Nginx включён SPA fallback (`try_files ... /index.html`) для корректной работы роутинга без `index.html`/`blog.html` в URL.
