-- Local development fixture only. Do not apply to the production catalog.
CREATE TABLE IF NOT EXISTS fonts_merged (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  font_json TEXT,
  tags_json TEXT,
  updated_at TEXT
);
INSERT OR IGNORE INTO fonts_merged (id, name, slug, font_json, tags_json, updated_at)
VALUES (1, 'Inter', 'inter', '{"technical":{"category":"sans-serif"},"meta":{}}', '[]', '2026-01-01');
INSERT OR IGNORE INTO fonts_merged (id, name, slug, font_json, tags_json, updated_at)
VALUES (2, 'Roboto', 'roboto', '{"technical":{"category":"sans-serif"},"meta":{}}', '[]', '2026-01-01');
