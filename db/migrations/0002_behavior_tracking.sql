ALTER TABLE analytics_events ADD COLUMN page_title TEXT;
ALTER TABLE analytics_events ADD COLUMN section_name TEXT;
ALTER TABLE analytics_events ADD COLUMN position_x REAL;
ALTER TABLE analytics_events ADD COLUMN position_y REAL;
ALTER TABLE analytics_events ADD COLUMN client_ip TEXT;

PRAGMA optimize;
