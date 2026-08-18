CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at INTEGER NOT NULL,
  event_name TEXT NOT NULL,
  path TEXT NOT NULL,
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  referrer_host TEXT,
  country TEXT NOT NULL DEFAULT '未知',
  device TEXT NOT NULL DEFAULT '其他',
  browser TEXT NOT NULL DEFAULT '其他',
  os TEXT NOT NULL DEFAULT '其他',
  target TEXT,
  page_title TEXT,
  section_name TEXT,
  position_x REAL,
  position_y REAL,
  client_ip TEXT,
  metric_name TEXT,
  metric_value REAL
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred_at
ON analytics_events(occurred_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_time
ON analytics_events(event_name, occurred_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_path_time
ON analytics_events(path, occurred_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_time
ON analytics_events(session_id, occurred_at);

CREATE TABLE IF NOT EXISTS ops_login_attempts (
  ip_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  window_start INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ops_admin_account (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  email TEXT NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  session_secret TEXT NOT NULL,
  session_version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_login_at INTEGER
);

PRAGMA optimize;
