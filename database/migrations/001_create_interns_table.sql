
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'intern_track') THEN
    CREATE TYPE intern_track AS ENUM (
      'frontend',
      'backend',
      'cybersecurity',
      'product'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS interns (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    VARCHAR(100)  NOT NULL,
  email        VARCHAR(255)  NOT NULL UNIQUE,
  track        intern_track  NOT NULL,
  bio          TEXT,
  github       VARCHAR(255),
  linkedin     VARCHAR(255),
  image_url    VARCHAR(500),
  is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns used by analytics and profile lookups
CREATE INDEX IF NOT EXISTS idx_interns_email   ON interns(email);
CREATE INDEX IF NOT EXISTS idx_interns_track   ON interns(track);
CREATE INDEX IF NOT EXISTS idx_interns_active  ON interns(is_active);

-- Reuse the existing set_updated_at() trigger function from the base schema
DROP TRIGGER IF EXISTS interns_set_updated_at ON interns;
CREATE TRIGGER interns_set_updated_at
  BEFORE UPDATE ON interns
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();