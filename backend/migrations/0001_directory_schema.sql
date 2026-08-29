-- Karachi-only directory data model: cities, zones, areas.
-- Zones are modeled now (so areas.zone_id has a target) but intentionally
-- left empty -- no zone data exists yet, and zone_id stays NULL until a
-- real zone source is available.

CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city_id INTEGER NOT NULL REFERENCES cities(id),
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city_id INTEGER NOT NULL REFERENCES cities(id),
  name TEXT NOT NULL,
  zone_id INTEGER REFERENCES zones(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (city_id, name)
);

CREATE INDEX IF NOT EXISTS idx_areas_city_id ON areas(city_id);
CREATE INDEX IF NOT EXISTS idx_zones_city_id ON zones(city_id);

-- The single supported city. Every other table references it by row, not
-- by a hardcoded string -- adding a second city later is a data change.
INSERT OR IGNORE INTO cities (name) VALUES ('Karachi');
