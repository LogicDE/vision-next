-- =========================================================
-- ENUMS
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'metric_enum') THEN
    CREATE TYPE metric_enum AS ENUM (
      'heart_rate','mental_state','stress','sleep_quality','activity_level','wellbeing'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agg_enum') THEN
    CREATE TYPE agg_enum AS ENUM ('avg','sum','min','max');
  END IF;
END$$;

-- =========================================================
-- CORE CATALOGS
-- =========================================================
CREATE TABLE IF NOT EXISTS actions (
  id_action SERIAL PRIMARY KEY,
  action_name VARCHAR(100) NOT NULL,
  action_desc VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS services (
  id_service SERIAL PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  service_desc VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS roles (
  id_role SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id_role   INTEGER NOT NULL REFERENCES roles(id_role)   ON DELETE CASCADE,
  id_action INTEGER NOT NULL REFERENCES actions(id_action) ON DELETE CASCADE,
  PRIMARY KEY (id_role, id_action)
);

-- =========================================================
-- COUNTRIES / ADMIN AREAS / CITIES / NEIGHBORHOODS / POSTAL CODES
-- =========================================================
CREATE TABLE IF NOT EXISTS countries (
  id_country SERIAL PRIMARY KEY,
  iso_code  VARCHAR(5) NOT NULL UNIQUE,
  name      VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_subdivisions (
  id_area   SERIAL PRIMARY KEY,
  id_country INTEGER NOT NULL REFERENCES countries(id_country) ON DELETE RESTRICT,
  iso_code   VARCHAR(32) NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_subdivisions_country ON admin_subdivisions(id_country);

CREATE TABLE IF NOT EXISTS cities (
  id_city SERIAL PRIMARY KEY,
  id_area INTEGER NOT NULL REFERENCES admin_subdivisions(id_area) ON DELETE RESTRICT,
  name    VARCHAR(120) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_cities_area_name ON cities(id_area, name);

CREATE TABLE IF NOT EXISTS neighborhoods (
  id_neighborhood SERIAL PRIMARY KEY,
  id_city INTEGER NOT NULL REFERENCES cities(id_city) ON DELETE RESTRICT,
  name    VARCHAR(150) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_neighborhoods_city_name ON neighborhoods(id_city, name);

CREATE TABLE IF NOT EXISTS postal_codes (
  id_postal_code SERIAL PRIMARY KEY,
  id_country     INTEGER NOT NULL REFERENCES countries(id_country) ON DELETE RESTRICT,
  code           VARCHAR(15) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_postal_codes_country_code ON postal_codes(id_country, code);

-- =========================================================
-- ADDRESSES
-- =========================================================
CREATE TABLE IF NOT EXISTS addresses (
  id_address     SERIAL PRIMARY KEY,
  street_number  VARCHAR(10) NOT NULL,
  street_name    VARCHAR(100) NOT NULL,
  id_postal_code INTEGER NOT NULL REFERENCES postal_codes(id_postal_code) ON DELETE RESTRICT,
  id_neighborhood INTEGER NOT NULL REFERENCES neighborhoods(id_neighborhood) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_addresses_postal      ON addresses(id_postal_code);
CREATE INDEX IF NOT EXISTS idx_addresses_neighborhood ON addresses(id_neighborhood);

-- =========================================================
-- ENTERPRISES / LOCATIONS / DEVICES
-- =========================================================
CREATE TABLE IF NOT EXISTS enterprises (
  id_enterprise SERIAL PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  telephone  VARCHAR(15)  NOT NULL CHECK (telephone ~ '^\d{9,15}$'),
  email      VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS enterprise_locations (
  id_location   SERIAL PRIMARY KEY,
  id_enterprise INTEGER NOT NULL REFERENCES enterprises(id_enterprise) ON DELETE CASCADE,
  id_address    INTEGER NOT NULL REFERENCES addresses(id_address)      ON DELETE RESTRICT,
  location_name VARCHAR(100) NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (id_enterprise, location_name)
);
CREATE INDEX IF NOT EXISTS idx_elocs_enterprise_active ON enterprise_locations(id_enterprise, active);

CREATE TABLE IF NOT EXISTS devices (
  id_device   SERIAL PRIMARY KEY,
  id_location INTEGER NOT NULL REFERENCES enterprise_locations(id_location) ON DELETE CASCADE,
  name        VARCHAR(100),
  device_type VARCHAR(50) NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_devices_location ON devices(id_location);

-- =========================================================
-- USERS / ORG
-- =========================================================
CREATE TABLE IF NOT EXISTS employees (
  id_employee  SERIAL PRIMARY KEY,
  id_manager   INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL,
  id_enterprise INTEGER NOT NULL REFERENCES enterprises(id_enterprise) ON DELETE CASCADE,
  id_role      INTEGER NOT NULL REFERENCES roles(id_role) ON DELETE RESTRICT,
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  username     VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telephone    VARCHAR(15) CHECK (telephone ~ '^\d{9,15}$'),
  status       VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groups (
  id_group  SERIAL PRIMARY KEY,
  id_manager INTEGER NOT NULL REFERENCES employees(id_employee) ON DELETE RESTRICT,
  name      VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS groups_employees (
  id_group    INTEGER NOT NULL REFERENCES groups(id_group) ON DELETE CASCADE,
  id_employee INTEGER NOT NULL REFERENCES employees(id_employee) ON DELETE CASCADE,
  PRIMARY KEY (id_group, id_employee)
);
CREATE INDEX IF NOT EXISTS idx_groups_employees_employee ON groups_employees(id_employee);
CREATE INDEX IF NOT EXISTS idx_groups_employees_group    ON groups_employees(id_group);

-- =========================================================
-- AUDIT LOGS
-- =========================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id_event_log SERIAL PRIMARY KEY,
  id_actor   INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL,
  id_action  INTEGER REFERENCES actions(id_action),
  id_service INTEGER REFERENCES services(id_service),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_actor   INET,
  object_type VARCHAR(100),
  change_set JSONB NOT NULL
);

-- =========================================================
-- SNAPSHOTS + METRICS
-- =========================================================
CREATE TABLE IF NOT EXISTS group_snapshots (
  id_snapshot  SERIAL PRIMARY KEY,
  id_group     INTEGER NOT NULL REFERENCES groups(id_group) ON DELETE CASCADE,
  snapshot_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_start TIMESTAMPTZ,
  window_end   TIMESTAMPTZ,
  job_version  VARCHAR(50),
  cohort_hash  VARCHAR(128)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_group_snapshots_group_at
  ON group_snapshots(id_group, snapshot_at);
CREATE INDEX IF NOT EXISTS idx_group_snapshots_group
  ON group_snapshots(id_group);

CREATE TABLE IF NOT EXISTS group_snapshots_members (
  id_snapshot INTEGER NOT NULL REFERENCES group_snapshots(id_snapshot) ON DELETE CASCADE,
  id_employee INTEGER NOT NULL REFERENCES employees(id_employee)       ON DELETE CASCADE,
  PRIMARY KEY (id_snapshot, id_employee)
);
CREATE INDEX IF NOT EXISTS idx_gsm_employee ON group_snapshots_members(id_employee);

CREATE TABLE IF NOT EXISTS daily_group_metrics (
  id_snapshot INTEGER NOT NULL REFERENCES group_snapshots(id_snapshot) ON DELETE CASCADE,
  metric_name metric_enum NOT NULL,
  agg_type    agg_enum    NOT NULL,
  value       DOUBLE PRECISION NOT NULL,
  PRIMARY KEY (id_snapshot, metric_name, agg_type)
);
CREATE INDEX IF NOT EXISTS idx_dgm_snapshot_metric ON daily_group_metrics(id_snapshot, metric_name);

CREATE TABLE IF NOT EXISTS daily_employee_metrics (
  id_employee INTEGER NOT NULL REFERENCES employees(id_employee)       ON DELETE CASCADE,
  id_snapshot INTEGER NOT NULL REFERENCES group_snapshots(id_snapshot) ON DELETE CASCADE,
  metric_name metric_enum NOT NULL,
  agg_type    agg_enum    NOT NULL,
  value       DOUBLE PRECISION NOT NULL,
  PRIMARY KEY (id_employee, id_snapshot, metric_name, agg_type)
);
CREATE INDEX IF NOT EXISTS idx_dem_snapshot_metric ON daily_employee_metrics(id_snapshot, metric_name);

-- =========================================================
-- SURVEYS
-- =========================================================
CREATE TABLE IF NOT EXISTS group_survey_scores (
  id_survey  SERIAL PRIMARY KEY,
  id_group   INTEGER NOT NULL REFERENCES groups(id_group) ON DELETE CASCADE,
  start_at   TIMESTAMPTZ,
  end_at     TIMESTAMPTZ,
  group_score INTEGER
);
CREATE INDEX IF NOT EXISTS idx_gss_group_time ON group_survey_scores(id_group, start_at, end_at);

CREATE TABLE IF NOT EXISTS indiv_survey_scores (
  id_response SERIAL PRIMARY KEY,
  id_survey   INTEGER NOT NULL REFERENCES group_survey_scores(id_survey) ON DELETE CASCADE,
  id_employee INTEGER NOT NULL REFERENCES employees(id_employee)         ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ,
  indiv_score  INTEGER,
  UNIQUE (id_survey, id_employee)
);
CREATE INDEX IF NOT EXISTS idx_iss_employee ON indiv_survey_scores(id_employee);

-- =========================================================
-- QUESTIONS + i18n
-- =========================================================
CREATE TABLE IF NOT EXISTS questions (
  id_question SERIAL PRIMARY KEY,
  id_group    INTEGER REFERENCES groups(id_group) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_questions_group ON questions(id_group);

CREATE TABLE IF NOT EXISTS question_i18n (
  id_question INTEGER NOT NULL REFERENCES questions(id_question) ON DELETE CASCADE,
  locale      VARCHAR(10)    NOT NULL,
  text        VARCHAR(255)    NOT NULL,
  PRIMARY KEY (id_question, locale)
);

-- =========================================================
-- EVENTS / INTERVENTIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS events (
  id_event   SERIAL PRIMARY KEY,
  id_manager INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL,
  title_message VARCHAR(100) NOT NULL,
  body_message  VARCHAR(255) NOT NULL,
  coordinator_name VARCHAR(200),
  start_at   TIMESTAMPTZ,
  end_at     TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS interventions (
  id_inter   SERIAL PRIMARY KEY,
  id_manager INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL,
  type       VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  title_message VARCHAR(100) NOT NULL,
  body_message  VARCHAR(255) NOT NULL
);

-- =========================================================
-- POBLACIÓN DE DATOS COMPLETA
-- =========================================================

-- Roles (manteniendo los existentes)
INSERT INTO roles (id_role, name, description) VALUES
(1, 'Admin', 'Administrador del sistema'),
(2, 'User', 'Es el usuario comun del sistema'),
(3, 'Employee', 'Son los trabajadores dentro de la empresa'),
(4, 'Manager', 'Son los Medicos montioreadores de los grupos')
ON CONFLICT (id_role) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description;

-- Actions
INSERT INTO actions (id_action, action_name, action_desc) VALUES
(1, 'create', 'Crear nuevo registro'),
(2, 'read', 'Leer datos'),
(3, 'update', 'Actualizar registro'),
(4, 'delete', 'Eliminar registro'),
(5, 'export', 'Exportar datos'),
(6, 'import', 'Importar datos')
ON CONFLICT (id_action) DO NOTHING;

-- Services
INSERT INTO services (id_service, service_name, service_desc) VALUES
(1, 'auth', 'Servicio de autenticación'),
(2, 'metrics', 'Servicio de métricas y análisis'),
(3, 'reports', 'Servicio de reportes'),
(4, 'monitoring', 'Servicio de monitoreo en tiempo real')
ON CONFLICT (id_service) DO NOTHING;

-- Role Permissions
INSERT INTO role_permissions (id_role, id_action) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),  -- Admin tiene todos
(2, 2), (2, 5),                                   -- User solo leer y exportar
(3, 1), (3, 2), (3, 3),                          -- Employee crear, leer, actualizar
(4, 1), (4, 2), (4, 3), (4, 5)                   -- Manager crear, leer, actualizar, exportar
ON CONFLICT (id_role, id_action) DO NOTHING;

-- Countries
INSERT INTO countries (id_country, iso_code, name) VALUES
(1, 'MX', 'México'),
(2, 'US', 'Estados Unidos'),
(3, 'ES', 'España')
ON CONFLICT (id_country) DO UPDATE SET
iso_code = EXCLUDED.iso_code,
name = EXCLUDED.name;

-- Admin Subdivisions
INSERT INTO admin_subdivisions (id_area, id_country, iso_code, name) VALUES
(1, 1, 'CDMX', 'Ciudad de México'),
(2, 1, 'MEX', 'Estado de México'),
(3, 2, 'CA', 'California'),
(4, 3, 'MAD', 'Madrid')
ON CONFLICT (id_area) DO UPDATE SET
id_country = EXCLUDED.id_country,
iso_code = EXCLUDED.iso_code,
name = EXCLUDED.name;

-- Cities
INSERT INTO cities (id_city, id_area, name) VALUES
(1, 1, 'Ciudad de México'),
(2, 2, 'Toluca'),
(3, 3, 'Los Ángeles'),
(4, 4, 'Madrid')
ON CONFLICT (id_city) DO UPDATE SET
id_area = EXCLUDED.id_area,
name = EXCLUDED.name;

-- Neighborhoods
INSERT INTO neighborhoods (id_neighborhood, id_city, name) VALUES
(1, 1, 'Polanco'),
(2, 1, 'Condesa'),
(3, 2, 'Centro'),
(4, 3, 'Downtown'),
(5, 4, 'Salamanca')
ON CONFLICT (id_neighborhood) DO UPDATE SET
id_city = EXCLUDED.id_city,
name = EXCLUDED.name;

-- Postal Codes
INSERT INTO postal_codes (id_postal_code, id_country, code) VALUES
(1, 1, '11560'),
(2, 1, '06140'),
(3, 2, '90001'),
(4, 3, '28001')
ON CONFLICT (id_postal_code) DO UPDATE SET
id_country = EXCLUDED.id_country,
code = EXCLUDED.code;

-- Addresses
INSERT INTO addresses (id_address, street_number, street_name, id_postal_code, id_neighborhood) VALUES
(1, '123', 'Av. Presidente Masaryk', 1, 1),
(2, '456', 'Av. México', 2, 2),
(3, '789', 'Main Street', 3, 4),
(4, '321', 'Calle Serrano', 4, 5)
ON CONFLICT (id_address) DO UPDATE SET
street_number = EXCLUDED.street_number,
street_name = EXCLUDED.street_name,
id_postal_code = EXCLUDED.id_postal_code,
id_neighborhood = EXCLUDED.id_neighborhood;

-- Enterprises
INSERT INTO enterprises (id_enterprise, name, telephone, email) VALUES
(1, 'VitaNexo Corporativo', '5512345678', 'corporate@vitanexo.com'),
(2, 'VitaNexo Salud', '5559876543', 'salud@vitanexo.com')
ON CONFLICT (id_enterprise) DO UPDATE SET
name = EXCLUDED.name,
telephone = EXCLUDED.telephone,
email = EXCLUDED.email;

-- Enterprise Locations
INSERT INTO enterprise_locations (id_location, id_enterprise, id_address, location_name, active) VALUES
(1, 1, 1, 'Sede Corporativa Polanco', true),
(2, 1, 2, 'Clínica Condesa', true),
(3, 2, 3, 'Centro Internacional LA', true)
ON CONFLICT (id_location) DO UPDATE SET
id_enterprise = EXCLUDED.id_enterprise,
id_address = EXCLUDED.id_address,
location_name = EXCLUDED.location_name,
active = EXCLUDED.active;

-- Devices
INSERT INTO devices (id_device, id_location, name, device_type, registered_at) VALUES
(1, 1, 'Sensor Biométrico A1', 'wearable', NOW() - INTERVAL '30 days'),
(2, 1, 'Monitor Cardiaco M2', 'medical_device', NOW() - INTERVAL '25 days'),
(3, 2, 'Tracker Actividad T3', 'wearable', NOW() - INTERVAL '20 days'),
(4, 3, 'Sensor Sueño S4', 'wearable', NOW() - INTERVAL '15 days')
ON CONFLICT (id_device) DO UPDATE SET
id_location = EXCLUDED.id_location,
name = EXCLUDED.name,
device_type = EXCLUDED.device_type,
registered_at = EXCLUDED.registered_at;

-- Employees (manteniendo los existentes y agregando más)
INSERT INTO employees (id_employee, id_manager, id_enterprise, id_role, first_name, last_name, email, username, password_hash, telephone, status, created_at, updated_at) VALUES
(1, NULL, 1, 1, 'Carlos', 'Lodic', 'carlos@vitanexo.com', 'carloslodic', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5512345678', 'active', '2025-11-01 15:31:15.57282+00', '2025-11-01 15:31:15.57282+00'),
(2, 1, 1, 4, 'Juan', 'Perez', 'juan.perez@demo.com', 'juanperez', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5551234567', 'active', '2025-11-01 16:11:46.226814+00', '2025-11-01 16:11:46.226814+00'),
(3, 2, 1, 3, 'María', 'González', 'maria.gonzalez@vitanexo.com', 'mariagonzalez', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5551112233', 'active', NOW() - INTERVAL '90 days', NOW()),
(4, 2, 1, 3, 'Roberto', 'Silva', 'roberto.silva@vitanexo.com', 'robertosilva', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5554445566', 'active', NOW() - INTERVAL '85 days', NOW()),
(5, 2, 1, 3, 'Ana', 'Martínez', 'ana.martinez@vitanexo.com', 'anamartinez', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5557778899', 'active', NOW() - INTERVAL '80 days', NOW()),
(6, 2, 1, 3, 'Luis', 'Ramírez', 'luis.ramirez@vitanexo.com', 'luisramirez', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5553334455', 'active', NOW() - INTERVAL '75 days', NOW()),
(7, 2, 1, 4, 'Laura', 'Díaz', 'laura.diaz@vitanexo.com', 'lauradiaz', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5556667788', 'active', NOW() - INTERVAL '70 days', NOW())
ON CONFLICT (id_employee) DO UPDATE SET
id_manager = EXCLUDED.id_manager,
id_enterprise = EXCLUDED.id_enterprise,
id_role = EXCLUDED.id_role,
first_name = EXCLUDED.first_name,
last_name = EXCLUDED.last_name,
email = EXCLUDED.email,
username = EXCLUDED.username,
password_hash = EXCLUDED.password_hash,
telephone = EXCLUDED.telephone,
status = EXCLUDED.status,
created_at = EXCLUDED.created_at,
updated_at = EXCLUDED.updated_at;

-- Groups
INSERT INTO groups (id_group, id_manager, name) VALUES
(1, 2, 'Equipo Desarrollo Core'),
(2, 7, 'Equipo Data Science'),
(3, 2, 'Equipo Operaciones'),
(4, 7, 'Equipo Investigación')
ON CONFLICT (id_group) DO UPDATE SET
id_manager = EXCLUDED.id_manager,
name = EXCLUDED.name;

-- Groups Employees
INSERT INTO groups_employees (id_group, id_employee) VALUES
(1, 3), (1, 4),
(2, 5), (2, 6),
(3, 3), (3, 5),
(4, 4), (4, 6)
ON CONFLICT (id_group, id_employee) DO NOTHING;

-- Group Snapshots (datos de los últimos 7 días)
INSERT INTO group_snapshots (id_snapshot, id_group, snapshot_at, window_start, window_end, job_version, cohort_hash) VALUES
-- Grupo 1 - últimos 7 días
(1, 1, NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', 'v1.2.3', 'hash_001'),
(2, 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', 'v1.2.3', 'hash_002'),
(3, 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 'v1.2.3', 'hash_003'),
(4, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 'v1.2.3', 'hash_004'),
(5, 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'v1.2.3', 'hash_005'),
(6, 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'v1.2.3', 'hash_006'),
(7, 1, NOW(), NOW() - INTERVAL '1 day', NOW(), 'v1.2.3', 'hash_007'),

-- Grupo 2 - últimos 7 días
(8, 2, NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', 'v1.2.3', 'hash_008'),
(9, 2, NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', 'v1.2.3', 'hash_009'),
(10, 2, NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 'v1.2.3', 'hash_010'),
(11, 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 'v1.2.3', 'hash_011'),
(12, 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'v1.2.3', 'hash_012'),
(13, 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'v1.2.3', 'hash_013'),
(14, 2, NOW(), NOW() - INTERVAL '1 day', NOW(), 'v1.2.3', 'hash_014')
ON CONFLICT (id_snapshot) DO UPDATE SET
id_group = EXCLUDED.id_group,
snapshot_at = EXCLUDED.snapshot_at,
window_start = EXCLUDED.window_start,
window_end = EXCLUDED.window_end,
job_version = EXCLUDED.job_version,
cohort_hash = EXCLUDED.cohort_hash;

-- Group Snapshots Members
INSERT INTO group_snapshots_members (id_snapshot, id_employee) VALUES
-- Snapshots grupo 1
(1, 3), (1, 4),
(2, 3), (2, 4),
(3, 3), (3, 4),
(4, 3), (4, 4),
(5, 3), (5, 4),
(6, 3), (6, 4),
(7, 3), (7, 4),

-- Snapshots grupo 2
(8, 5), (8, 6),
(9, 5), (9, 6),
(10, 5), (10, 6),
(11, 5), (11, 6),
(12, 5), (12, 6),
(13, 5), (13, 6),
(14, 5), (14, 6)
ON CONFLICT (id_snapshot, id_employee) DO NOTHING;

-- Daily Group Metrics (métricas realistas para grupos)
INSERT INTO daily_group_metrics (id_snapshot, metric_name, agg_type, value) VALUES
-- Grupo 1 - Heart Rate
(1, 'heart_rate', 'avg', 72.5), (1, 'heart_rate', 'min', 65.0), (1, 'heart_rate', 'max', 85.0),
(2, 'heart_rate', 'avg', 71.8), (2, 'heart_rate', 'min', 64.0), (2, 'heart_rate', 'max', 82.0),
(3, 'heart_rate', 'avg', 73.2), (3, 'heart_rate', 'min', 66.0), (3, 'heart_rate', 'max', 87.0),
(4, 'heart_rate', 'avg', 70.9), (4, 'heart_rate', 'min', 63.0), (4, 'heart_rate', 'max', 80.0),
(5, 'heart_rate', 'avg', 72.1), (5, 'heart_rate', 'min', 65.0), (5, 'heart_rate', 'max', 83.0),
(6, 'heart_rate', 'avg', 71.5), (6, 'heart_rate', 'min', 64.0), (6, 'heart_rate', 'max', 81.0),
(7, 'heart_rate', 'avg', 73.0), (7, 'heart_rate', 'min', 66.0), (7, 'heart_rate', 'max', 86.0),

-- Grupo 1 - Mental State
(1, 'mental_state', 'avg', 78.0), (1, 'mental_state', 'min', 65.0), (1, 'mental_state', 'max', 90.0),
(2, 'mental_state', 'avg', 82.0), (2, 'mental_state', 'min', 70.0), (2, 'mental_state', 'max', 92.0),
(3, 'mental_state', 'avg', 75.0), (3, 'mental_state', 'min', 62.0), (3, 'mental_state', 'max', 85.0),
(4, 'mental_state', 'avg', 80.0), (4, 'mental_state', 'min', 68.0), (4, 'mental_state', 'max', 88.0),
(5, 'mental_state', 'avg', 79.0), (5, 'mental_state', 'min', 67.0), (5, 'mental_state', 'max', 87.0),
(6, 'mental_state', 'avg', 83.0), (6, 'mental_state', 'min', 72.0), (6, 'mental_state', 'max', 91.0),
(7, 'mental_state', 'avg', 77.0), (7, 'mental_state', 'min', 64.0), (7, 'mental_state', 'max', 86.0),

-- Grupo 1 - Stress
(1, 'stress', 'avg', 35.0), (1, 'stress', 'min', 20.0), (1, 'stress', 'max', 55.0),
(2, 'stress', 'avg', 28.0), (2, 'stress', 'min', 15.0), (2, 'stress', 'max', 45.0),
(3, 'stress', 'avg', 42.0), (3, 'stress', 'min', 25.0), (3, 'stress', 'max', 60.0),
(4, 'stress', 'avg', 31.0), (4, 'stress', 'min', 18.0), (4, 'stress', 'max', 50.0),
(5, 'stress', 'avg', 38.0), (5, 'stress', 'min', 22.0), (5, 'stress', 'max', 58.0),
(6, 'stress', 'avg', 26.0), (6, 'stress', 'min', 12.0), (6, 'stress', 'max', 42.0),
(7, 'stress', 'avg', 33.0), (7, 'stress', 'min', 19.0), (7, 'stress', 'max', 52.0),

-- Grupo 2 - Heart Rate
(8, 'heart_rate', 'avg', 68.2), (8, 'heart_rate', 'min', 62.0), (8, 'heart_rate', 'max', 78.0),
(9, 'heart_rate', 'avg', 69.5), (9, 'heart_rate', 'min', 63.0), (9, 'heart_rate', 'max', 80.0),
(10, 'heart_rate', 'avg', 67.8), (10, 'heart_rate', 'min', 61.0), (10, 'heart_rate', 'max', 76.0),
(11, 'heart_rate', 'avg', 70.1), (11, 'heart_rate', 'min', 64.0), (11, 'heart_rate', 'max', 82.0),
(12, 'heart_rate', 'avg', 68.9), (12, 'heart_rate', 'min', 62.0), (12, 'heart_rate', 'max', 79.0),
(13, 'heart_rate', 'avg', 69.2), (13, 'heart_rate', 'min', 63.0), (13, 'heart_rate', 'max', 81.0),
(14, 'heart_rate', 'avg', 67.5), (14, 'heart_rate', 'min', 60.0), (14, 'heart_rate', 'max', 75.0),

-- Grupo 2 - Mental State
(8, 'mental_state', 'avg', 85.0), (8, 'mental_state', 'min', 75.0), (8, 'mental_state', 'max', 95.0),
(9, 'mental_state', 'avg', 88.0), (9, 'mental_state', 'min', 78.0), (9, 'mental_state', 'max', 96.0),
(10, 'mental_state', 'avg', 82.0), (10, 'mental_state', 'min', 70.0), (10, 'mental_state', 'max', 90.0),
(11, 'mental_state', 'avg', 86.0), (11, 'mental_state', 'min', 76.0), (11, 'mental_state', 'max', 94.0),
(12, 'mental_state', 'avg', 84.0), (12, 'mental_state', 'min', 74.0), (12, 'mental_state', 'max', 92.0),
(13, 'mental_state', 'avg', 87.0), (13, 'mental_state', 'min', 77.0), (13, 'mental_state', 'max', 95.0),
(14, 'mental_state', 'avg', 83.0), (14, 'mental_state', 'min', 72.0), (14, 'mental_state', 'max', 91.0)
ON CONFLICT (id_snapshot, metric_name, agg_type) DO UPDATE SET
value = EXCLUDED.value;

-- Daily Employee Metrics (métricas detalladas por empleado)
INSERT INTO daily_employee_metrics (id_employee, id_snapshot, metric_name, agg_type, value) VALUES
-- María González (id:3)
(3, 1, 'heart_rate', 'avg', 70.0), (3, 1, 'mental_state', 'avg', 80.0), (3, 1, 'stress', 'avg', 30.0),
(3, 2, 'heart_rate', 'avg', 69.0), (3, 2, 'mental_state', 'avg', 85.0), (3, 2, 'stress', 'avg', 25.0),
(3, 3, 'heart_rate', 'avg', 72.0), (3, 3, 'mental_state', 'avg', 78.0), (3, 3, 'stress', 'avg', 40.0),
(3, 4, 'heart_rate', 'avg', 68.0), (3, 4, 'mental_state', 'avg', 82.0), (3, 4, 'stress', 'avg', 28.0),
(3, 5, 'heart_rate', 'avg', 71.0), (3, 5, 'mental_state', 'avg', 81.0), (3, 5, 'stress', 'avg', 35.0),
(3, 6, 'heart_rate', 'avg', 69.5), (3, 6, 'mental_state', 'avg', 86.0), (3, 6, 'stress', 'avg', 22.0),
(3, 7, 'heart_rate', 'avg', 73.0), (3, 7, 'mental_state', 'avg', 79.0), (3, 7, 'stress', 'avg', 31.0),

-- Roberto Silva (id:4)
(4, 1, 'heart_rate', 'avg', 75.0), (4, 1, 'mental_state', 'avg', 76.0), (4, 1, 'stress', 'avg', 40.0),
(4, 2, 'heart_rate', 'avg', 74.5), (4, 2, 'mental_state', 'avg', 79.0), (4, 2, 'stress', 'avg', 31.0),
(4, 3, 'heart_rate', 'avg', 74.0), (4, 3, 'mental_state', 'avg', 72.0), (4, 3, 'stress', 'avg', 44.0),
(4, 4, 'heart_rate', 'avg', 73.8), (4, 4, 'mental_state', 'avg', 78.0), (4, 4, 'stress', 'avg', 34.0),
(4, 5, 'heart_rate', 'avg', 73.2), (4, 5, 'mental_state', 'avg', 77.0), (4, 5, 'stress', 'avg', 41.0),
(4, 6, 'heart_rate', 'avg', 73.5), (4, 6, 'mental_state', 'avg', 80.0), (4, 6, 'stress', 'avg', 30.0),
(4, 7, 'heart_rate', 'avg', 73.0), (4, 7, 'mental_state', 'avg', 75.0), (4, 7, 'stress', 'avg', 35.0)
ON CONFLICT (id_employee, id_snapshot, metric_name, agg_type) DO UPDATE SET
value = EXCLUDED.value;

-- Group Survey Scores
INSERT INTO group_survey_scores (id_survey, id_group, start_at, end_at, group_score) VALUES
(1, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 85),
(2, 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 92),
(3, 1, NOW() - INTERVAL '1 day', NOW(), 88)
ON CONFLICT (id_survey) DO UPDATE SET
id_group = EXCLUDED.id_group,
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at,
group_score = EXCLUDED.group_score;

-- Individual Survey Scores
INSERT INTO indiv_survey_scores (id_response, id_survey, id_employee, submitted_at, indiv_score) VALUES
(1, 1, 3, NOW() - INTERVAL '2 days 2 hours', 82),
(2, 1, 4, NOW() - INTERVAL '2 days 1 hour', 88),
(3, 2, 5, NOW() - INTERVAL '1 day 3 hours', 90),
(4, 2, 6, NOW() - INTERVAL '1 day 2 hours', 94),
(5, 3, 3, NOW() - INTERVAL '2 hours', 85),
(6, 3, 4, NOW() - INTERVAL '1 hour', 91)
ON CONFLICT (id_response) DO UPDATE SET
id_survey = EXCLUDED.id_survey,
id_employee = EXCLUDED.id_employee,
submitted_at = EXCLUDED.submitted_at,
indiv_score = EXCLUDED.indiv_score;

-- Questions
INSERT INTO questions (id_question, id_group, created_at) VALUES
(1, 1, NOW() - INTERVAL '10 days'),
(2, 1, NOW() - INTERVAL '9 days'),
(3, 2, NOW() - INTERVAL '8 days')
ON CONFLICT (id_question) DO UPDATE SET
id_group = EXCLUDED.id_group,
created_at = EXCLUDED.created_at;

-- Question i18n
INSERT INTO question_i18n (id_question, locale, text) VALUES
(1, 'es', '¿Cómo calificarías tu nivel de estrés hoy?'),
(1, 'en', 'How would you rate your stress level today?'),
(2, 'es', '¿Qué tan satisfecho estás con tu balance trabajo-vida?'),
(2, 'en', 'How satisfied are you with your work-life balance?'),
(3, 'es', '¿Cómo evalúas tu productividad esta semana?'),
(3, 'en', 'How do you rate your productivity this week?')
ON CONFLICT (id_question, locale) DO UPDATE SET
text = EXCLUDED.text;

-- Events
INSERT INTO events (id_event, id_manager, title_message, body_message, coordinator_name, start_at, end_at) VALUES
(1, 2, 'Taller Bienestar', 'Sesión de mindfulness y manejo de estrés', 'Dr. Juan Perez', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 3 hours'),
(2, 7, 'Revisión Trimestral', 'Evaluación de métricas y objetivos del equipo', 'Laura Díaz', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days 2 hours')
ON CONFLICT (id_event) DO UPDATE SET
id_manager = EXCLUDED.id_manager,
title_message = EXCLUDED.title_message,
body_message = EXCLUDED.body_message,
coordinator_name = EXCLUDED.coordinator_name,
start_at = EXCLUDED.start_at,
end_at = EXCLUDED.end_at;

-- Interventions
INSERT INTO interventions (id_inter, id_manager, type, description, title_message, body_message) VALUES
(1, 2, 'coaching', 'Sesión individual de manejo de estrés', 'Sesión de Coaching', 'Hemos notado niveles elevados de estrés, agendemos una sesión'),
(2, 7, 'training', 'Capacitación en técnicas de productividad', 'Optimización de Productividad', 'Te invitamos a nuestro taller de métodos ágiles')
ON CONFLICT (id_inter) DO UPDATE SET
id_manager = EXCLUDED.id_manager,
type = EXCLUDED.type,
description = EXCLUDED.description,
title_message = EXCLUDED.title_message,
body_message = EXCLUDED.body_message;

-- Audit Logs
INSERT INTO audit_logs (id_event_log, id_actor, id_action, id_service, occurred_at, ip_actor, object_type, change_set) VALUES
(1, 1, 1, 1, NOW() - INTERVAL '2 hours', '192.168.1.100', 'employee', '{"action": "login", "result": "success"}'),
(2, 2, 3, 2, NOW() - INTERVAL '1 hour', '192.168.1.101', 'metrics', '{"updated_metrics": 15, "group": "Equipo Desarrollo Core"}'),
(3, 3, 2, 3, NOW() - INTERVAL '30 minutes', '192.168.1.102', 'reports', '{"report_type": "weekly", "exported": true}')
ON CONFLICT (id_event_log) DO UPDATE SET
id_actor = EXCLUDED.id_actor,
id_action = EXCLUDED.id_action,
id_service = EXCLUDED.id_service,
occurred_at = EXCLUDED.occurred_at,
ip_actor = EXCLUDED.ip_actor,
object_type = EXCLUDED.object_type,
change_set = EXCLUDED.change_set;

-- =========================================================
-- VISTAS KPIs ACTUALIZADAS
-- =========================================================

CREATE OR REPLACE VIEW vw_kpi_realtime AS
SELECT 
    TO_CHAR(gs.window_start, 'HH24:00') AS kpi_hour,
    AVG(CASE WHEN dem.metric_name = 'heart_rate' THEN dem.value END)       AS heartrate,
    AVG(CASE WHEN dem.metric_name = 'mental_state' THEN dem.value END)     AS mentalstate,
    AVG(CASE WHEN dem.metric_name = 'stress' THEN dem.value END)           AS stress,
    COUNT(DISTINCT dem.id_employee)                                        AS users
FROM daily_employee_metrics dem
JOIN group_snapshots gs ON gs.id_snapshot = dem.id_snapshot
WHERE gs.window_start >= NOW() - INTERVAL '24 hours'
GROUP BY TO_CHAR(gs.window_start, 'HH24:00')
ORDER BY MIN(gs.window_start);

CREATE OR REPLACE VIEW vw_kpi_weekly AS
SELECT
    TO_CHAR(gs.snapshot_at, 'DY') AS kpi_day,
    AVG(CASE WHEN dgm.metric_name = 'heart_rate' THEN dgm.value END)   AS heartrate,
    AVG(CASE WHEN dgm.metric_name = 'mental_state' THEN dgm.value END) AS mentalstate,
    COUNT(DISTINCT gss.id_survey)                                     AS alerts,
    AVG(gss.group_score)                                              AS satisfaction
FROM daily_group_metrics dgm
JOIN group_snapshots gs ON gs.id_snapshot = dgm.id_snapshot
LEFT JOIN group_survey_scores gss ON gss.id_group = gs.id_group
WHERE gs.snapshot_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY TO_CHAR(gs.snapshot_at, 'DY')
ORDER BY MIN(gs.snapshot_at);

CREATE OR REPLACE VIEW vw_kpi_radar AS
SELECT 'Salud Cardiovascular' AS metric_name, COALESCE(AVG(value), 0) AS metric_value
FROM daily_employee_metrics WHERE metric_name = 'heart_rate'
UNION ALL
SELECT 'Estado Mental', COALESCE(AVG(value), 0)
FROM daily_employee_metrics WHERE metric_name = 'mental_state'
UNION ALL
SELECT 'Nivel de Estrés', 100 - COALESCE(AVG(value), 0)
FROM daily_employee_metrics WHERE metric_name = 'stress'
UNION ALL
SELECT 'Calidad del Sueño', COALESCE(AVG(value), 0)
FROM daily_employee_metrics WHERE metric_name = 'sleep_quality'
UNION ALL
SELECT 'Actividad Física', COALESCE(AVG(value), 0)
FROM daily_employee_metrics WHERE metric_name = 'activity_level'
UNION ALL
SELECT 'Bienestar General', COALESCE(AVG(value), 0)
FROM daily_group_metrics WHERE metric_name = 'wellbeing';

-- =========================================================
-- FUNCIONES KPI
-- =========================================================

CREATE OR REPLACE FUNCTION sp_kpi_realtime()
RETURNS TABLE(
    kpi_hour TEXT, 
    heartrate DOUBLE PRECISION, 
    mentalstate DOUBLE PRECISION, 
    stress DOUBLE PRECISION, 
    users BIGINT
)
LANGUAGE sql
STABLE
AS $$
    SELECT * FROM vw_kpi_realtime;
$$;

CREATE OR REPLACE FUNCTION sp_kpi_weekly()
RETURNS TABLE(
    kpi_day TEXT, 
    heartrate DOUBLE PRECISION, 
    mentalstate DOUBLE PRECISION, 
    alerts BIGINT, 
    satisfaction DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
    SELECT * FROM vw_kpi_weekly;
$$;

CREATE OR REPLACE FUNCTION sp_kpi_radar()
RETURNS TABLE(
    metric_name TEXT, 
    metric_value DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
    SELECT * FROM vw_kpi_radar;
$$;

-- =========================================================
-- PROCEDIMIENTOS AUXILIARES
-- =========================================================

CREATE OR REPLACE PROCEDURE prc_recent_audit_logs(IN limit_rows INT DEFAULT 10)
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'Últimos % registros de auditoría:', limit_rows;
    FOR rec IN
        SELECT id_event_log, id_actor, id_action, occurred_at, object_type
        FROM audit_logs
        ORDER BY occurred_at DESC
        LIMIT limit_rows
    LOOP
        RAISE NOTICE 'Evento: %, Actor: %, Acción: %, Fecha: %, Objeto: %',
            rec.id_event_log, rec.id_actor, rec.id_action, rec.occurred_at, rec.object_type;
    END LOOP;
END;
$$;

CREATE OR REPLACE PROCEDURE prc_group_performance_summary()
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'Rendimiento promedio por grupo:';
    FOR rec IN
        SELECT g.name AS group_name,
               ROUND(AVG(dgm.value), 2) AS avg_wellbeing,
               COUNT(DISTINCT ge.id_employee) AS active_users
        FROM groups g
        LEFT JOIN daily_group_metrics dgm ON dgm.id_snapshot IN (
            SELECT id_snapshot FROM group_snapshots WHERE id_group = g.id_group
        )
        LEFT JOIN groups_employees ge ON ge.id_group = g.id_group
        GROUP BY g.name
        ORDER BY avg_wellbeing DESC
    LOOP
        RAISE NOTICE 'Grupo: %, Bienestar promedio: %, Usuarios activos: %',
            rec.group_name, rec.avg_wellbeing, rec.active_users;
    END LOOP;
END;
$$;

CREATE OR REPLACE PROCEDURE prc_list_employees_by_role(IN role_name TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'Empleados con rol "%":', role_name;

    FOR rec IN
        SELECT e.username, e.email, e.status
        FROM employees e
        JOIN roles r ON r.id_role = e.id_role
        WHERE r.name = role_name
    LOOP
        RAISE NOTICE 'Usuario: %, Email: %, Estado: %', rec.username, rec.email, rec.status;
    END LOOP;
END;
$$;

-- =========================================================
-- END OF SCHEMA
-- =========================================================