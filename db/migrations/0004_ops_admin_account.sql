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
