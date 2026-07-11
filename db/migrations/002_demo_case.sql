ALTER TABLE cases ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_cases_owner_demo ON cases(owner_id, is_demo);
