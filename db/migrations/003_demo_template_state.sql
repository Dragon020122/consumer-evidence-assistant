ALTER TABLE cases ADD COLUMN demo_template_key TEXT;
ALTER TABLE cases ADD COLUMN demo_setup_state TEXT NOT NULL DEFAULT 'NONE';
UPDATE cases SET demo_template_key='prepaid-gym-v1', demo_setup_state='PARTIAL' WHERE is_demo=1;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cases_owner_demo_template ON cases(owner_id, demo_template_key) WHERE demo_template_key IS NOT NULL;
