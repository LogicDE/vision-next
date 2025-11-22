-- Add missing columns for groups and enterprises tables
DO $$
BEGIN
  -- Groups table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'created_at') THEN
    ALTER TABLE groups ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'created_by') THEN
    ALTER TABLE groups ADD COLUMN created_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'is_deleted') THEN
    ALTER TABLE groups ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'deleted_by') THEN
    ALTER TABLE groups ADD COLUMN deleted_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  CREATE INDEX IF NOT EXISTS idx_groups_is_deleted ON groups(is_deleted);

  -- Enterprises table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enterprises' AND column_name = 'created_at') THEN
    ALTER TABLE enterprises ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enterprises' AND column_name = 'created_by') THEN
    ALTER TABLE enterprises ADD COLUMN created_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enterprises' AND column_name = 'is_deleted') THEN
    ALTER TABLE enterprises ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enterprises' AND column_name = 'deleted_by') THEN
    ALTER TABLE enterprises ADD COLUMN deleted_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  CREATE INDEX IF NOT EXISTS idx_enterprises_is_deleted ON enterprises(is_deleted);
END $$;

