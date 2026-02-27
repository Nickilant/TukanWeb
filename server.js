const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'blog.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content_html TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const adminPathSecret = process.env.ADMIN_SECRET_PATH || 'secret-admin-link';
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';
const sessionSecret = process.env.SESSION_SECRET || 'change-me';

const createArticleStmt = db.prepare(`
  INSERT INTO articles (title, slug, excerpt, content_html, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const listArticlesStmt = db.prepare(`
  SELECT id, title, slug, excerpt, created_at, updated_at
  FROM articles
  ORDER BY datetime(created_at) DESC
`);
const articleBySlugStmt = db.prepare(`
  SELECT id, title, slug, excerpt, content_html, created_at, updated_at
  FROM articles
  WHERE slug = ?
`);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));

function signSession(value) {
  return crypto.createHmac('sha256', sessionSecret).update(value).digest('hex');
}

function createSessionCookie(res) {
  const payload = `admin:${Date.now()}`;
  const signature = signSession(payload);
  res.cookie('admin_session', `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  });
}

function isAuthenticated(req) {
  const rawSession = req.headers.cookie
    ?.split(';')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith('admin_session='))
    ?.replace('admin_session=', '');

  const session = rawSession ? decodeURIComponent(rawSession) : '';

  if (!session || !session.includes('.')) return false;
  const [payload, signature] = session.split('.');
  return signSession(payload) === signature && payload.startsWith('admin:');
}

function requireAdmin(req, res, next) {
  if (!isAuthenticated(req)) {
    return res.redirect(`/admin/${adminPathSecret}/login`);
  }
  return next();
}

function createSlug(title) {
  const baseSlug = slugify(title, { lower: true, strict: true, trim: true }) || 'post';
  let slug = baseSlug;
  let index = 1;
  while (articleBySlugStmt.get(slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }
  return slug;
}

app.get('/', (req, res) => {
  const articles = listArticlesStmt.all();
  res.render('index', {
    articles,
    adminPathSecret
  });
});

app.get('/article/:slug', (req, res) => {
  const article = articleBySlugStmt.get(req.params.slug);
  if (!article) {
    return res.status(404).render('404');
  }
  return res.render('article', { article });
});

app.get('/admin/:secret/login', (req, res) => {
  if (req.params.secret !== adminPathSecret) {
    return res.status(404).render('404');
  }
  return res.render('admin/login', { error: null, secret: adminPathSecret });
});

app.post('/admin/:secret/login', async (req, res) => {
  if (req.params.secret !== adminPathSecret) {
    return res.status(404).render('404');
  }

  if (!adminPasswordHash) {
    return res.status(500).render('admin/login', {
      error: 'ADMIN_PASSWORD_HASH отсутствует в .env',
      secret: adminPathSecret
    });
  }

  const { password } = req.body;
  const ok = await bcrypt.compare(password || '', adminPasswordHash);
  if (!ok) {
    return res.status(401).render('admin/login', {
      error: 'Неверный пароль',
      secret: adminPathSecret
    });
  }

  createSessionCookie(res);
  return res.redirect(`/admin/${adminPathSecret}`);
});

app.get('/admin/:secret', requireAdmin, (req, res) => {
  if (req.params.secret !== adminPathSecret) {
    return res.status(404).render('404');
  }
  const articles = listArticlesStmt.all();
  return res.render('admin/dashboard', { articles, secret: adminPathSecret });
});

app.get('/admin/:secret/new', requireAdmin, (req, res) => {
  if (req.params.secret !== adminPathSecret) {
    return res.status(404).render('404');
  }
  return res.render('admin/new', { error: null, secret: adminPathSecret });
});

app.post('/admin/:secret/new', requireAdmin, (req, res) => {
  if (req.params.secret !== adminPathSecret) {
    return res.status(404).render('404');
  }

  const { title, excerpt, contentHtml } = req.body;

  if (!title || !excerpt || !contentHtml) {
    return res.status(400).render('admin/new', {
      error: 'Заполните все поля',
      secret: adminPathSecret
    });
  }

  const now = new Date().toISOString();
  const slug = createSlug(title);
  createArticleStmt.run(title.trim(), slug, excerpt.trim(), contentHtml.trim(), now, now);
  return res.redirect(`/article/${slug}`);
});

app.get('/health', (_, res) => {
  res.json({ ok: true });
});

app.use((_, res) => {
  res.status(404).render('404');
});

app.listen(port, () => {
  console.log(`Blog is running on http://localhost:${port}`);
});
