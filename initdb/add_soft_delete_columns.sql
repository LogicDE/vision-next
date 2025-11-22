-- Soft Delete and Audit Columns Migration
DO $$
BEGIN
  -- Questions table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'created_by') THEN
    ALTER TABLE questions ADD COLUMN created_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'is_deleted') THEN
    ALTER TABLE questions ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'deleted_by') THEN
    ALTER TABLE questions ADD COLUMN deleted_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_is_deleted') THEN
    CREATE INDEX idx_questions_is_deleted ON questions(is_deleted);
  END IF;

  -- Surveys_versions table (already has created_at and created_by)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'surveys_versions' AND column_name = 'is_deleted') THEN
    ALTER TABLE surveys_versions ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'surveys_versions' AND column_name = 'deleted_by') THEN
    ALTER TABLE surveys_versions ADD COLUMN deleted_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_surveys_versions_is_deleted') THEN
    CREATE INDEX idx_surveys_versions_is_deleted ON surveys_versions(is_deleted);
  END IF;

  -- Surveys table (already has created_at)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'created_by') THEN
    ALTER TABLE surveys ADD COLUMN created_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'is_deleted') THEN
    ALTER TABLE surveys ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'deleted_by') THEN
    ALTER TABLE surveys ADD COLUMN deleted_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_surveys_is_deleted') THEN
    CREATE INDEX idx_surveys_is_deleted ON surveys(is_deleted);
  END IF;

  -- Events table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'created_at') THEN
    ALTER TABLE events ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'created_by') THEN
    ALTER TABLE events ADD COLUMN created_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'is_deleted') THEN
    ALTER TABLE events ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'deleted_by') THEN
    ALTER TABLE events ADD COLUMN deleted_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_events_is_deleted') THEN
    CREATE INDEX idx_events_is_deleted ON events(is_deleted);
  END IF;

  -- Interventions table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interventions' AND column_name = 'created_at') THEN
    ALTER TABLE interventions ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interventions' AND column_name = 'created_by') THEN
    ALTER TABLE interventions ADD COLUMN created_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interventions' AND column_name = 'is_deleted') THEN
    ALTER TABLE interventions ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interventions' AND column_name = 'deleted_by') THEN
    ALTER TABLE interventions ADD COLUMN deleted_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_interventions_is_deleted') THEN
    CREATE INDEX idx_interventions_is_deleted ON interventions(is_deleted);
  END IF;

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
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_enterprises_is_deleted') THEN
    CREATE INDEX idx_enterprises_is_deleted ON enterprises(is_deleted);
  END IF;

  -- Enterprise_locations table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enterprise_locations' AND column_name = 'created_at') THEN
    ALTER TABLE enterprise_locations ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enterprise_locations' AND column_name = 'created_by') THEN
    ALTER TABLE enterprise_locations ADD COLUMN created_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enterprise_locations' AND column_name = 'is_deleted') THEN
    ALTER TABLE enterprise_locations ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enterprise_locations' AND column_name = 'deleted_by') THEN
    ALTER TABLE enterprise_locations ADD COLUMN deleted_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_enterprise_locations_is_deleted') THEN
    CREATE INDEX idx_enterprise_locations_is_deleted ON enterprise_locations(is_deleted);
  END IF;

  -- Devices table (rename registered_at to created_at, add other columns)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'registered_at') THEN
    ALTER TABLE devices RENAME COLUMN registered_at TO created_at;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'created_at') THEN
    ALTER TABLE devices ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'created_by') THEN
    ALTER TABLE devices ADD COLUMN created_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'is_deleted') THEN
    ALTER TABLE devices ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'deleted_by') THEN
    ALTER TABLE devices ADD COLUMN deleted_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_devices_is_deleted') THEN
    CREATE INDEX idx_devices_is_deleted ON devices(is_deleted);
  END IF;

  -- Employees table (already has created_at)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'created_by') THEN
    ALTER TABLE employees ADD COLUMN created_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'is_deleted') THEN
    ALTER TABLE employees ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'deleted_by') THEN
    ALTER TABLE employees ADD COLUMN deleted_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_employees_is_deleted') THEN
    CREATE INDEX idx_employees_is_deleted ON employees(is_deleted);
  END IF;

  -- Roles table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'created_at') THEN
    ALTER TABLE roles ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'created_by') THEN
    ALTER TABLE roles ADD COLUMN created_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'is_deleted') THEN
    ALTER TABLE roles ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'deleted_by') THEN
    ALTER TABLE roles ADD COLUMN deleted_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_roles_is_deleted') THEN
    CREATE INDEX idx_roles_is_deleted ON roles(is_deleted);
  END IF;
END $$;

