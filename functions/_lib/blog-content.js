// Personal blog content: table lifecycle, validation, markdown render and CRUD.
// Mirrors the zero-dependency pattern used by os63-content.js, so the functions it
// powers stay bundleable for Cloudflare Pages Workers.

const TABLE = 'blog_posts';
const MAX_MD = 120000;
const MAX_STR = 20000;

function cleanString(value, max = MAX_STR) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function cleanTags(value) {
  const list = Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',') : []);
  const seen = new Set();
  return list
    .map((item) => cleanString(item, 60))
    .filter(Boolean)
    .filter((item) => {
      const lower = item.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    })
    .slice(0, 12);
}

export function slugify(title, fallback) {
  const base = cleanString(title, 160)
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\p{L}\p{N}\-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || (fallback || 'post-' + Math.floor(Date.now() / 1000).toString(36));
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(url, allowRelative) {
  const value = cleanString(url, 4000);
  if (!value) return '';
  if (allowRelative && /^(\.{0,2})\//.test(value)) return value;
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return '';
}

function inlineMarkdown(escaped) {
  // Runs on already-HTML-escaped text and emits only markdown semantics.
  let result = escaped;
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
  result = result.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return result;
}

function isHeadingStart(line) {
  return /^#{1,6}\s+/.test(line);
}

export function markdownToHtml(markdown) {
  const source = String(markdown == null ? '' : markdown).replace(/\r\n?/g, '\n');
  const lines = source.split('\n');
  const out = [];
  let i = 0;
  let inCode = false;
  let codeBuffer = [];
  let codeLang = '';

  const flushCode = () => {
    if (!inCode) return;
    const body = escapeHtml(codeBuffer.join('\n'));
    if (codeLang) {
      out.push(`<pre class="code-block" data-lang="${escapeHtml(codeLang)}"><code>${body}</code></pre>`);
    } else {
      out.push(`<pre class="code-block"><code>${body}</code></pre>`);
    }
    codeBuffer = [];
    inCode = false;
    codeLang = '';
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      if (inCode) {
        flushCode();
      } else {
        inCode = true;
        codeLang = cleanString(line.replace(/^```\s*/, ''), 40);
      }
      i += 1;
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      i += 1;
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (isHeadingStart(line)) {
      const level = Math.min(6, line.match(/^#+/)[0].length);
      const text = inlineMarkdown(escapeHtml(line.replace(/^#+\s+/, '')));
      out.push(level <= 2 ? `<h${level} class="blog-h${level}">${text}</h${level}>` : `<h${level} id="blog-h${level}-${out.length}">${text}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const block = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        block.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote>${block.map((l) => inlineMarkdown(escapeHtml(l))).join('<br>')}</blockquote>`);
      continue;
    }

    if (/^(\[x\]|\-{3,}|\*{3,}|_{3,})\s*$/.test(trimmed)) {
      out.push('<hr>');
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(inlineMarkdown(escapeHtml(lines[i].trim().replace(/^[-*]\s+/, ''))));
        i += 1;
      }
      out.push(`<ul>${items.map((it) => `<li>${it}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(inlineMarkdown(escapeHtml(lines[i].trim().replace(/^\d+\.\s+/, ''))));
        i += 1;
      }
      out.push(`<ol>${items.map((it) => `<li>${it}</li>`).join('')}</ol>`);
      continue;
    }

    // Table (| a | b | rows) — two or more pipe rows.
    if (/\|/.test(trimmed) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const headerCells = trimmed.split('|').map((c) => c.trim()).filter((c) => c !== '');
      const headerAligns = lines[i + 1].split('|').map((c) => c.trim()).filter((c) => c !== '');
      i += 2;
      const rows = [];
      while (i < lines.length && /\|/.test(lines[i].trim())) {
        const cells = lines[i].split('|').map((c) => c.trim()).filter((c) => c !== '');
        rows.push(cells);
        i += 1;
      }
      let html = '<table><thead><tr>';
      headerCells.forEach((cell, idx) => {
        const align = /:-*:/.test(headerAligns[idx] || '') ? ' style="text-align:center"' : /:-/.test(headerAligns[idx] || '') ? ' style="text-align:left"' : /-:/.test(headerAligns[idx] || '') ? ' style="text-align:right"' : '';
        html += `<th${align}>${inlineMarkdown(escapeHtml(cell))}</th>`;
      });
      html += '</tr></thead><tbody>';
      rows.forEach((cells) => {
        html += '<tr>';
        headerCells.forEach((_, idx) => {
          html += `<td>${inlineMarkdown(escapeHtml(cells[idx] || ''))}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      out.push(html);
      continue;
    }

    // Paragraph: gather until a blank line or a new block marker.
    const para = [trimmed];
    i += 1;
    while (i < lines.length) {
      const nt = lines[i].trim();
      if (!nt || isHeadingStart(lines[i]) || /^```/.test(lines[i]) || /^>\s?/.test(nt) || /^[-*]\s+/.test(nt) || /^\d+\.\s+/.test(nt) || /^(\[x\]|\-{3,}|\*{3,}|_{3,})\s*$/.test(nt)) break;
      para.push(nt);
      i += 1;
    }
    out.push(`<p>${para.map((l) => inlineMarkdown(escapeHtml(l))).join('<br>')}</p>`);
  }

  flushCode();
  return out.join('\n');
}

export function computeReadingMinutes(text) {
  const source = String(text == null ? '' : text);
  const cjk = (source.match(/[\u4e00-\u9fff\uf900-\ufaff]/g) || []).length;
  const latin = source.replace(/[\u4e00-\u9fff\uf900-\ufaff]/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil((cjk + latin) / 340);
  return Math.max(1, minutes);
}

function normalizePost(input, existing) {
  const now = Math.floor(Date.now() / 1000);
  const title = cleanString(input && input.title, 200);
  const slug = slugify(input && input.slug, existing && existing.slug);
  const body_md = cleanString(input && input.body_md, MAX_MD);
  const body_html = markdownToHtml(body_md);
  const excerpt = cleanString(input && input.excerpt, 400) || String(body_md.replace(/[#*`>\-\[\]()!]/g, '').slice(0, 160)).trim();
  return {
    slug,
    title,
    excerpt,
    body_md,
    body_html,
    cover: safeUrl(input && input.cover, false),
    category: cleanString(input && input.category, 80),
    tags: cleanTags(input && input.tags),
    published: Boolean(input && input.published),
    reading_minutes: computeReadingMinutes(body_md),
    created_at: existing && existing.created_at ? Number(existing.created_at) : now,
    updated_at: now
  };
}

function parseRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    slug: String(row.slug || ''),
    title: String(row.title || ''),
    excerpt: String(row.excerpt || ''),
    cover: String(row.cover || ''),
    category: String(row.category || ''),
    tags: JSON.parse(row.tags || '[]'),
    published: Boolean(row.published),
    reading_minutes: Number(row.reading_minutes || 0),
    created_at: Number(row.created_at || 0),
    updated_at: Number(row.updated_at || 0),
    body_md: String(row.body_md || ''),
    body_html: String(row.body_html || '')
  };
}

export function publicPostSummary(post) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover: post.cover,
    category: post.category,
    tags: post.tags,
    reading_minutes: post.reading_minutes,
    created_at: post.created_at
  };
}

export async function ensureBlogTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      body_md TEXT NOT NULL,
      body_html TEXT NOT NULL DEFAULT '',
      cover TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      published INTEGER NOT NULL DEFAULT 0,
      reading_minutes INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON ${TABLE}(slug)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON ${TABLE}(published, created_at)`).run();
}

export async function listPosts(db, opts = {}) {
  await ensureBlogTable(db);
  const publishedOnly = opts.publishedOnly !== false;
  const where = [];
  const params = [];
  if (publishedOnly) where.push('published = 1');
  if (opts.query) {
    where.push('(title LIKE ? OR excerpt LIKE ? OR category LIKE ? OR tags LIKE ?)');
    const key = `%${opts.query}%`;
    params.push(key, key, key, key);
  }
  if (opts.tag) {
    where.push('tags LIKE ?');
    params.push(`%${JSON.stringify(opts.tag).slice(1, -1)}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limit = Math.min(Math.max(Number(opts.limit) || 50, 1), 200);
  const offset = Math.max(Number(opts.offset) || 0, 0);
  const rows = await db
    .prepare(`SELECT * FROM ${TABLE} ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset)
    .all();
  const total = await db
    .prepare(`SELECT COUNT(*) AS c FROM ${TABLE} ${whereSql}`)
    .bind(...params)
    .first();
  return {
    items: (rows.results || []).map(parseRow).filter(Boolean),
    total: Number(total && total.c) || 0
  };
}

export async function getPostBySlug(db, slug, publishedOnly = true) {
  await ensureBlogTable(db);
  const row = await db
    .prepare(`SELECT * FROM ${TABLE} WHERE slug = ? ${publishedOnly ? 'AND published = 1' : ''}`)
    .bind(cleanString(slug, 200))
    .first();
  return parseRow(row);
}

export async function getPostById(db, id) {
  await ensureBlogTable(db);
  const row = await db.prepare(`SELECT * FROM ${TABLE} WHERE id = ?`).bind(Number(id)).first();
  return parseRow(row);
}

export async function listAllPosts(db) {
  await ensureBlogTable(db);
  const rows = await db.prepare(`SELECT * FROM ${TABLE} ORDER BY created_at DESC`).all();
  return (rows.results || []).map(parseRow).filter(Boolean);
}

export async function listMeta(db) {
  await ensureBlogTable(db);
  const rows = await db.prepare(`SELECT category, tags FROM ${TABLE} WHERE published = 1`).all();
  const counts = {};
  const tagCounts = {};
  (rows.results || []).forEach((row) => {
    const category = cleanString(row.category, 80);
    if (category) counts[category] = (counts[category] || 0) + 1;
    let tags = [];
    try { tags = JSON.parse(row.tags || '[]'); } catch {}
    (Array.isArray(tags) ? tags : []).forEach((tag) => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
  });
  return {
    categories: Object.keys(counts).map((name) => ({ name, count: counts[name] })),
    tags: Object.keys(tagCounts).map((name) => ({ name, count: tagCounts[name] })).sort((a, b) => b.count - a.count)
  };
}

export async function upsertPost(db, input, email) {
  await ensureBlogTable(db);
  const existing = input && input.id ? await getPostById(db, input.id) : null;
  if (existing) {
    const post = normalizePost(input, parseRow(existing));
    await db.prepare(`
      UPDATE ${TABLE}
      SET slug = ?, title = ?, excerpt = ?, body_md = ?, body_html = ?, cover = ?, category = ?, tags = ?, published = ?, reading_minutes = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      post.slug, post.title, post.excerpt, post.body_md, post.body_html, post.cover,
      post.category, JSON.stringify(post.tags), post.published ? 1 : 0, post.reading_minutes,
      post.updated_at, existing.id
    ).run();
    return { id: existing.id, slug: post.slug, created_at: existing.created_at, updated_at: post.updated_at };
  }
  // Reject a duplicate slug by appending a suffix.
  let slug = slugify(input && input.slug, null);
  const clash = await db.prepare(`SELECT id FROM ${TABLE} WHERE slug = ?`).bind(slug).first();
  if (clash) slug = slugify(`${slug}-${Math.floor(Date.now() / 1000).toString(36)}`, null);
  const post = normalizePost({ ...input, slug }, null);
  const res = await db.prepare(`
    INSERT INTO ${TABLE}
      (slug, title, excerpt, body_md, body_html, cover, category, tags, published, reading_minutes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    post.slug, post.title, post.excerpt, post.body_md, post.body_html, post.cover,
    post.category, JSON.stringify(post.tags), post.published ? 1 : 0, post.reading_minutes,
    post.created_at, post.updated_at
  ).run();
  return { id: Number(res.meta.last_row_id || 0), slug: post.slug, created_at: post.created_at, updated_at: post.updated_at };
}

export async function deletePost(db, id, email) {
  await ensureBlogTable(db);
  const res = await db.prepare(`DELETE FROM ${TABLE} WHERE id = ?`).bind(Number(id)).run();
  return { ok: Number(res.meta.changes || 0) > 0 };
}

export async function getAdjacent(db, slug, publishedOnly = true) {
  await ensureBlogTable(db);
  const post = await getPostBySlug(db, slug, publishedOnly);
  if (!post) return { prev: null, next: null };
  const order = publishedOnly ? 'published = 1 AND' : '1=1 AND';
  const prev = await db.prepare(`SELECT id, slug, title FROM ${TABLE} WHERE ${order} created_at < ? ORDER BY created_at DESC LIMIT 1`).bind(post.created_at).first();
  const next = await db.prepare(`SELECT id, slug, title FROM ${TABLE} WHERE ${order} created_at > ? ORDER BY created_at ASC LIMIT 1`).bind(post.created_at).first();
  const map = (r) => (r ? { slug: String(r.slug), title: String(r.title) } : null);
  return { prev: map(prev), next: map(next) };
}
