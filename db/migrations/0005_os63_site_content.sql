CREATE TABLE IF NOT EXISTS os63_site_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  updated_by TEXT
);

PRAGMA optimize;
