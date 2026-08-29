export const DEFAULT_SITE_DATA = {
  profile: {
    Name: 'Meridian',
    Alias: 'MERIDIAN',
    Title: '品牌设计 / B 端视觉设计',
    Company: '昂楷科技',
    Location: '',
    Status: '开放机会',
    Bio: '10 年品牌设计与 B 端视觉设计经验，主导全产品线从视觉系统搭建到落地，并把 AI 融入日常设计工作流。',
    Description: '把复杂信息变得清晰、好用，并让设计真正抵达结果。',
    Images: '/assets/side-b/maridian-avatar.jpg',
    Cover: '',
    LinkedIn: '',
    Email: 'bh141425@gmail.com',
    Highlights: [
      { label: '10年', value: '品牌设计' },
      { label: 'B端', value: '视觉设计' },
      { label: '🐶', value: '爱狗人' }
    ],
    Tags: ['profile'],
    Category: '个人',
    Published: true,
    Created: '2026-01-01',
    Author: 'Meridian'
  },
  listening: [
    {
      Title: '示例曲目 1', Subtitle: '歌手名', Thumbnail: 'https://picsum.photos/seed/t1/400',
      Link: 'https://music.youtube.com/watch?v=placeholder', Created: '2026-01-01',
      Tags: ['音乐'], Category: '音乐', Published: true
    },
    {
      Title: '示例曲目 2', Subtitle: '另一位歌手', Thumbnail: 'https://picsum.photos/seed/t2/400',
      Link: 'https://music.youtube.com/watch?v=placeholder', Created: '2026-02-01',
      Tags: ['音乐'], Category: '音乐', Published: true
    }
  ],
  achievements: [
    {
      Title: '示例奖项', Description: '在这里描述该奖项。', Thumbnail: 'https://picsum.photos/seed/a1/400',
      Link: 'https://example.com', Year: '2025-01-01', Source: '来源/机构', Details: '更多详情。可在后台编辑。',
      Type: '奖项', Tags: ['奖项'], Published: true
    },
    {
      Title: '示例报道', Description: '在这里描述该报道。', Thumbnail: 'https://picsum.photos/seed/a2/400',
      Link: 'https://example.com', Year: '2026-01-01', Source: '来源/机构', Details: '更多详情。',
      Type: '报道', Tags: ['报道'], Published: true
    }
  ],
  film: [
    {
      Title: '示例影片 1', Description: '影片简短描述。', Thumbnail: 'https://picsum.photos/seed/f1/400',
      Link: 'https://vimeo.com/placeholder', 'Created time': '2026-01-01', Tags: ['作品'], Category: '作品', Published: true
    },
    {
      Title: '示例影片 2', Description: '影片简短描述。', Thumbnail: 'https://picsum.photos/seed/f2/400',
      Link: 'https://vimeo.com/placeholder', 'Created time': '2026-02-01', Tags: ['作品'], Category: '作品', Published: true
    }
  ],
  facts: [
    {
      Title: '示例冷知识 1', Description: '关于你的一条有趣冷知识 —— 可在后台编辑。',
      Image: 'https://picsum.photos/seed/ft1/400', Category: '冷知识', Published: true, 'Created time': '2026-03-01'
    },
    {
      Title: '示例冷知识 2', Description: '关于你的一条有趣冷知识。',
      Image: 'https://picsum.photos/seed/ft2/400', Category: '冷知识', Published: true, 'Created time': '2026-03-02'
    },
    {
      Title: '示例冷知识 3', Description: '关于你的一条有趣冷知识。',
      Image: 'https://picsum.photos/seed/ft3/400', Category: '冷知识', Published: true, 'Created time': '2026-03-03'
    }
  ]
};

const DATASET_FIELDS = {
  profile: ['Name', 'Alias', 'Title', 'Company', 'Location', 'Status', 'Bio', 'Description', 'Images', 'Cover', 'LinkedIn', 'Email', 'Highlights', 'Tags', 'Category', 'Published', 'Created', 'Author'],
  listening: ['Title', 'Subtitle', 'Thumbnail', 'Link', 'Created', 'Author', 'Tags', 'Category', 'Published'],
  achievements: ['Title', 'Description', 'Thumbnail', 'Link', 'Year', 'Source', 'Details', 'Type', 'Tags', 'Published'],
  film: ['Title', 'Description', 'Thumbnail', 'Link', 'Created time', 'Author', 'Tags', 'Category', 'Published'],
  facts: ['Title', 'Description', 'Image', 'Tags', 'Category', 'Published', 'Author', 'Created time']
};

export const NOTION_PROP_TYPE = {
  profile: { Name: 'title', Alias: 'rich_text', Title: 'rich_text', Company: 'rich_text', Location: 'rich_text', Status: 'select', Bio: 'rich_text', Description: 'rich_text', Images: 'files', Cover: 'files', LinkedIn: 'url', Email: 'email', Highlights: 'rich_text', Tags: 'multi_select', Category: 'select', Published: 'checkbox', Created: 'date', Author: 'rich_text' },
  listening: { Title: 'title', Subtitle: 'rich_text', Thumbnail: 'files', Link: 'url', Created: 'date', Author: 'rich_text', Tags: 'multi_select', Category: 'select', Published: 'checkbox' },
  achievements: { Title: 'title', Description: 'rich_text', Thumbnail: 'files', Link: 'url', Year: 'date', Source: 'rich_text', Details: 'rich_text', Type: 'select', Tags: 'multi_select', Published: 'checkbox' },
  film: { Title: 'title', Description: 'rich_text', Thumbnail: 'files', Link: 'url', 'Created time': 'date', Author: 'rich_text', Tags: 'multi_select', Category: 'select', Published: 'checkbox' },
  facts: { Title: 'title', Description: 'rich_text', Image: 'files', Tags: 'multi_select', Category: 'select', Published: 'checkbox', Author: 'rich_text', 'Created time': 'date' }
};

const DATABASES = {
  '1e7a691cd5f780a2941fe3f4b62de4ff': { dataset: 'profile', id: 'profile' },
  '29b8af2e757446fbb0d518141d9e0fa0': { dataset: 'listening', id: 'listening' },
  'dbae58c3a08a49ffa40d310676fdc7b7': { dataset: 'achievements', id: 'achievements' },
  'fc2b1d3b563149ef84e9ee14a866afb7': { dataset: 'film', id: 'film' },
  '1dca691cd5f780a89220f8720788f77a': { dataset: 'facts', id: 'facts' }
};

function cleanString(value, max = 5000) {
  return String(value == null ? '' : value).slice(0, max);
}

function cleanValue(key, value) {
  if (key === 'Published') return Boolean(value);
  if (key === 'Tags') return Array.isArray(value) ? value.slice(0, 20).map((item) => cleanString(item, 80)).filter(Boolean) : [];
  if (key === 'Highlights') {
    return Array.isArray(value)
      ? value.slice(0, 6).map((item) => ({ label: cleanString(item && item.label, 80), value: cleanString(item && item.value, 120) }))
      : [];
  }
  return cleanString(value);
}

function cleanObject(dataset, value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const result = {};
  for (const key of DATASET_FIELDS[dataset]) result[key] = cleanValue(key, source[key]);
  return result;
}

export function normalizeSiteData(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    profile: cleanObject('profile', source.profile),
    listening: (Array.isArray(source.listening) ? source.listening : []).slice(0, 50).map((item) => cleanObject('listening', item)),
    achievements: (Array.isArray(source.achievements) ? source.achievements : []).slice(0, 50).map((item) => cleanObject('achievements', item)),
    film: (Array.isArray(source.film) ? source.film : []).slice(0, 50).map((item) => cleanObject('film', item)),
    facts: (Array.isArray(source.facts) ? source.facts : []).slice(0, 50).map((item) => cleanObject('facts', item))
  };
}

export async function ensureSiteContent(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS os63_site_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      updated_by TEXT
    )
  `).run();
  await db.prepare(`
    INSERT OR IGNORE INTO os63_site_content (id, data_json, updated_at, updated_by)
    VALUES (1, ?, ?, 'initial-import')
  `).bind(JSON.stringify(normalizeSiteData(DEFAULT_SITE_DATA)), Math.floor(Date.now() / 1000)).run();

  // The first Side B admin release seeded a complete-looking but fictional
  // profile. Upgrade only that exact placeholder record so an administrator's
  // later edits are never overwritten by a deployment.
  const row = await db.prepare('SELECT data_json FROM os63_site_content WHERE id = 1').first();
  let stored = null;
  try { stored = JSON.parse(row && row.data_json ? row.data_json : ''); } catch {}
  const profile = stored && stored.profile;
  const isLegacyPlaceholder = profile
    && profile.Company === '你的公司'
    && profile.Location === '城市, 国家'
    && profile.Description === '短描述占位内容 —— 可在后台表单中编辑。'
    && profile.Email === 'you@example.com'
    && profile.LinkedIn === 'https://www.linkedin.com/in/your-handle';
  if (isLegacyPlaceholder) {
    stored.profile = { ...DEFAULT_SITE_DATA.profile };
    await db.prepare(`
      UPDATE os63_site_content SET data_json = ?, updated_at = ?, updated_by = ? WHERE id = 1
    `).bind(
      JSON.stringify(normalizeSiteData(stored)),
      Math.floor(Date.now() / 1000),
      'profile-migration-20260829'
    ).run();
  }

  // Correct the former public-facing spelling without replacing any other
  // profile fields the owner may already have edited in the admin form.
  const currentProfile = stored && stored.profile;
  const usesFormerName = currentProfile
    && (currentProfile.Name === 'Maridian'
      || currentProfile.Alias === 'MARIDIAN'
      || currentProfile.Author === 'Maridian');
  if (usesFormerName) {
    stored.profile = {
      ...currentProfile,
      Name: currentProfile.Name === 'Maridian' ? 'Meridian' : currentProfile.Name,
      Alias: currentProfile.Alias === 'MARIDIAN' ? 'MERIDIAN' : currentProfile.Alias,
      Author: currentProfile.Author === 'Maridian' ? 'Meridian' : currentProfile.Author
    };
    await db.prepare(`
      UPDATE os63_site_content SET data_json = ?, updated_at = ?, updated_by = ? WHERE id = 1
    `).bind(
      JSON.stringify(normalizeSiteData(stored)),
      Math.floor(Date.now() / 1000),
      'profile-name-migration-20260829'
    ).run();
  }
}

export async function readSiteContent(db) {
  await ensureSiteContent(db);
  const row = await db.prepare('SELECT data_json, updated_at, updated_by FROM os63_site_content WHERE id = 1').first();
  let data = DEFAULT_SITE_DATA;
  try { data = JSON.parse(row && row.data_json ? row.data_json : ''); } catch {}
  return { data: normalizeSiteData(data), updated_at: Number(row && row.updated_at) || 0, updated_by: (row && row.updated_by) || '' };
}

export async function writeSiteContent(db, data, email) {
  const normalized = normalizeSiteData(data);
  const now = Math.floor(Date.now() / 1000);
  await ensureSiteContent(db);
  await db.prepare(`
    UPDATE os63_site_content SET data_json = ?, updated_at = ?, updated_by = ? WHERE id = 1
  `).bind(JSON.stringify(normalized), now, cleanString(email, 254)).run();
  return { data: normalized, updated_at: now };
}

function propertyValue(value, type) {
  const text = cleanString(value);
  const richText = { type: 'text', text: { content: text }, plain_text: text, href: null, annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' } };
  if (type === 'title') return { title: [richText] };
  if (type === 'rich_text') return { rich_text: [richText] };
  if (type === 'select') return { select: value ? { name: text } : null };
  if (type === 'multi_select') return { multi_select: (Array.isArray(value) ? value : []).map((name) => ({ name: cleanString(name, 80) })) };
  if (type === 'files') return { files: value ? [{ name: 'image', type: 'external', external: { url: text } }] : [] };
  if (type === 'url') return { url: value ? text : null };
  if (type === 'email') return { email: value ? text : null };
  if (type === 'date') return { date: value ? { start: text } : null };
  if (type === 'checkbox') return { checkbox: Boolean(value) };
  return { rich_text: [richText] };
}

export function notionDatasetForId(id) {
  return DATABASES[String(id || '').toLowerCase()] || null;
}

export function buildNotionResponse(dataset, siteData) {
  const items = dataset === 'profile' ? [siteData.profile] : (siteData[dataset] || []);
  const types = NOTION_PROP_TYPE[dataset] || {};
  const results = items.filter((item) => item && item.Published !== false).map((item, index) => {
    const properties = {};
    for (const [key, type] of Object.entries(types)) {
      let value = item[key];
      if (dataset === 'profile' && key === 'Highlights') value = JSON.stringify(item.Highlights || []);
      properties[key] = propertyValue(value, type);
    }
    return { object: 'page', id: `${dataset}-${index}`, url: '', properties };
  });
  return { object: 'list', results, has_more: false, next_cursor: null };
}
