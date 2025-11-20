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
  id_device     SERIAL PRIMARY KEY,
  id_location   INTEGER NOT NULL REFERENCES enterprise_locations(id_location) ON DELETE CASCADE,
  name          VARCHAR(100),
  device_type   VARCHAR(50) NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'active',
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
-- POBLACIÓN DE DATOS COMPLETA - VERSIÓN CORREGIDA Y UNIFICADA
-- =========================================================

-- Roles
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
(3, 'ES', 'España'),
(4, 'CO', 'Colombia'),
(5, 'AR', 'Argentina'),
(6, 'CL', 'Chile'),
(7, 'PE', 'Perú'),
(8, 'BR', 'Brasil'),
(9, 'DE', 'Alemania'),
(10, 'FR', 'Francia')
ON CONFLICT (id_country) DO UPDATE SET
iso_code = EXCLUDED.iso_code,
name = EXCLUDED.name;

-- Admin Subdivisions
INSERT INTO admin_subdivisions (id_area, id_country, iso_code, name) VALUES
(1, 1, 'CDMX', 'Ciudad de México'),
(2, 1, 'MEX', 'Estado de México'),
(3, 2, 'CA', 'California'),
(4, 3, 'MAD', 'Madrid'),
(5, 4, 'BOG', 'Bogotá D.C.'),
(6, 5, 'BUE', 'Buenos Aires'),
(7, 6, 'RM', 'Región Metropolitana'),
(8, 7, 'LIM', 'Lima'),
(9, 8, 'SP', 'São Paulo'),
(10, 9, 'BE', 'Berlín'),
(11, 10, 'IDF', 'Isla de Francia')
ON CONFLICT (id_area) DO UPDATE SET
id_country = EXCLUDED.id_country,
iso_code = EXCLUDED.iso_code,
name = EXCLUDED.name;

-- Cities
INSERT INTO cities (id_city, id_area, name) VALUES
(1, 1, 'Ciudad de México'),
(2, 2, 'Toluca'),
(3, 3, 'Los Ángeles'),
(4, 4, 'Madrid'),
(5, 5, 'Bogotá'),
(6, 6, 'Buenos Aires'),
(7, 7, 'Santiago'),
(8, 8, 'Lima'),
(9, 9, 'São Paulo'),
(10, 10, 'Berlín'),
(11, 11, 'París'),
(12, 3, 'San Francisco'),
(13, 3, 'San Diego'),
(14, 1, 'Guadalajara'),
(15, 1, 'Monterrey')
ON CONFLICT (id_city) DO UPDATE SET
id_area = EXCLUDED.id_area,
name = EXCLUDED.name;

-- Neighborhoods
INSERT INTO neighborhoods (id_neighborhood, id_city, name) VALUES
(1, 1, 'Polanco'),
(2, 1, 'Condesa'),
(3, 2, 'Centro'),
(4, 3, 'Downtown'),
(5, 4, 'Salamanca'),
(6, 5, 'Chapinero'),
(7, 5, 'Usaquén'),
(8, 6, 'Palermo'),
(9, 6, 'Recoleta'),
(10, 7, 'Providencia'),
(11, 7, 'Las Condes'),
(12, 8, 'Miraflores'),
(13, 8, 'San Isidro'),
(14, 9, 'Jardins'),
(15, 9, 'Moema'),
(16, 10, 'Mitte'),
(17, 10, 'Prenzlauer Berg'),
(18, 11, 'Le Marais'),
(19, 11, 'Saint-Germain'),
(20, 12, 'Financial District'),
(21, 13, 'Gaslamp Quarter'),
(22, 14, 'Chapultepec'),
(23, 14, 'Americas'),
(24, 15, 'San Pedro'),
(25, 15, 'Contry')
ON CONFLICT (id_neighborhood) DO UPDATE SET
id_city = EXCLUDED.id_city,
name = EXCLUDED.name;

-- Postal Codes
INSERT INTO postal_codes (id_postal_code, id_country, code) VALUES
(1, 1, '11560'),
(2, 1, '06140'),
(3, 2, '90001'),
(4, 3, '28001'),
(5, 4, '110111'),
(6, 5, 'C1001'),
(7, 6, '8320000'),
(8, 7, '15001'),
(9, 8, '01310'),
(10, 9, '10115'),
(11, 10, '75001'),
(12, 2, '90210'),
(13, 2, '10001'),
(14, 1, '44100'),
(15, 1, '64000')
ON CONFLICT (id_postal_code) DO UPDATE SET
id_country = EXCLUDED.id_country,
code = EXCLUDED.code;

-- Addresses
INSERT INTO addresses (id_address, street_number, street_name, id_postal_code, id_neighborhood) VALUES
(1, '123', 'Av. Presidente Masaryk', 1, 1),
(2, '456', 'Av. México', 2, 2),
(3, '789', 'Main Street', 3, 4),
(4, '321', 'Calle Serrano', 4, 5),
(5, '234', 'Carrera 15', 5, 6),
(6, '567', 'Av. Santa Fe', 6, 8),
(7, '890', 'Av. Providencia', 7, 10),
(8, '123', 'Av. Larco', 8, 12),
(9, '456', 'Rua Augusta', 9, 14),
(10, '789', 'Friedrichstraße', 10, 16),
(11, '321', 'Rue de Rivoli', 11, 18),
(12, '654', 'Market Street', 12, 20),
(13, '987', '5th Avenue', 13, 21),
(14, '111', 'Av. Chapultepec', 14, 22),
(15, '222', 'Av. San Pedro', 15, 24)
ON CONFLICT (id_address) DO UPDATE SET
street_number = EXCLUDED.street_number,
street_name = EXCLUDED.street_name,
id_postal_code = EXCLUDED.id_postal_code,
id_neighborhood = EXCLUDED.id_neighborhood;

-- Enterprises
INSERT INTO enterprises (id_enterprise, name, telephone, email) VALUES
(1, 'VitaNexo Corporativo', '5512345678', 'corporate@vitanexo.com'),
(2, 'VitaNexo Salud', '5559876543', 'salud@vitanexo.com'),
(3, 'TechCorp Global', '5512349999', 'info@techcorp.com'),
(4, 'HealthPlus Internacional', '5558887777', 'contacto@healthplus.com'),
(5, 'Innovate Solutions', '5522223333', 'hello@innovate.com'),
(6, 'BioWellness Group', '5533334444', 'support@biowellness.com')
ON CONFLICT (id_enterprise) DO UPDATE SET
name = EXCLUDED.name,
telephone = EXCLUDED.telephone,
email = EXCLUDED.email;

-- Enterprise Locations
INSERT INTO enterprise_locations (id_location, id_enterprise, id_address, location_name, active) VALUES
(1, 1, 1, 'Sede Corporativa Polanco', true),
(2, 1, 2, 'Clínica Condesa', true),
(3, 2, 3, 'Centro Internacional LA', true),
(4, 3, 5, 'Oficina Principal Bogotá', true),
(5, 3, 6, 'Sede Buenos Aires', true),
(6, 4, 7, 'Clínica Santiago', true),
(7, 4, 8, 'Centro Médico Lima', true),
(8, 5, 9, 'HQ São Paulo', true),
(9, 5, 10, 'Oficina Berlín', true),
(10, 6, 11, 'Institut París', true),
(11, 3, 12, 'Tech Hub SF', true),
(12, 4, 13, 'Wellness Center NY', true)
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
(4, 3, 'Sensor Sueño S4', 'wearable', NOW() - INTERVAL '15 days'),
(5, 4, 'Smart Watch V2', 'wearable', NOW() - INTERVAL '45 days'),
(6, 4, 'Monitor EKG Pro', 'medical_device', NOW() - INTERVAL '40 days'),
(7, 5, 'Tracker Actividad Plus', 'wearable', NOW() - INTERVAL '35 days'),
(8, 6, 'Sensor Sueño Avanzado', 'wearable', NOW() - INTERVAL '30 days'),
(9, 7, 'Monitor Cardiaco Elite', 'medical_device', NOW() - INTERVAL '25 days'),
(10, 8, 'Pulsera Biométrica', 'wearable', NOW() - INTERVAL '20 days'),
(11, 9, 'Sensor Estrés Inteligente', 'wearable', NOW() - INTERVAL '15 days'),
(12, 10, 'Monitor Sueño Pro', 'medical_device', NOW() - INTERVAL '10 days'),
(13, 11, 'Tracker Ejercicio', 'wearable', NOW() - INTERVAL '5 days'),
(14, 12, 'Sensor Bienestar', 'wearable', NOW() - INTERVAL '3 days')
ON CONFLICT (id_device) DO UPDATE SET
id_location = EXCLUDED.id_location,
name = EXCLUDED.name,
device_type = EXCLUDED.device_type,
registered_at = EXCLUDED.registered_at;

-- Employees (47 empleados total)
INSERT INTO employees (id_employee, id_manager, id_enterprise, id_role, first_name, last_name, email, username, password_hash, telephone, status, created_at, updated_at) VALUES
-- Empresa 1 - VitaNexo Corporativo (22 empleados)
(1, NULL, 1, 1, 'Carlos', 'Lodic', 'carlos@vitanexo.com', 'carloslodic', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5512345678', 'active', NOW() - INTERVAL '100 days', NOW()),
(2, 1, 1, 4, 'Juan', 'Perez', 'juan.perez@demo.com', 'juanperez', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5551234567', 'active', NOW() - INTERVAL '95 days', NOW()),
(3, 2, 1, 3, 'María', 'González', 'maria.gonzalez@vitanexo.com', 'mariagonzalez', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5551112233', 'active', NOW() - INTERVAL '90 days', NOW()),
(4, 2, 1, 3, 'Roberto', 'Silva', 'roberto.silva@vitanexo.com', 'robertosilva', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5554445566', 'active', NOW() - INTERVAL '85 days', NOW()),
(5, 2, 1, 3, 'Ana', 'Martínez', 'ana.martinez@vitanexo.com', 'anamartinez', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5557778899', 'active', NOW() - INTERVAL '80 days', NOW()),
(6, 2, 1, 3, 'Luis', 'Ramírez', 'luis.ramirez@vitanexo.com', 'luisramirez', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5553334455', 'active', NOW() - INTERVAL '75 days', NOW()),
(7, 2, 1, 4, 'Laura', 'Díaz', 'laura.diaz@vitanexo.com', 'lauradiaz', '$2b$12$/iuzEmk.vbyY4EoXbSJxDOtmneWQmG2ybu8viK802PTdlcyxkG5Pq', '5556667788', 'active', NOW() - INTERVAL '70 days', NOW()),
(8, 2, 1, 3, 'Sofia', 'Lopez', 'sofia.lopez@vitanexo.com', 'sofialopez', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5551112222', 'active', NOW() - INTERVAL '65 days', NOW()),
(9, 2, 1, 3, 'Diego', 'Martinez', 'diego.martinez@vitanexo.com', 'diegomartinez', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5552223333', 'active', NOW() - INTERVAL '60 days', NOW()),
(10, 2, 1, 3, 'Elena', 'Rodriguez', 'elena.rodriguez@vitanexo.com', 'elenarodriguez', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5553334444', 'active', NOW() - INTERVAL '55 days', NOW()),
(11, 7, 1, 3, 'Carlos', 'Garcia', 'carlos.garcia@vitanexo.com', 'carlosgarcia', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5554445555', 'active', NOW() - INTERVAL '50 days', NOW()),
(12, 7, 1, 3, 'Isabel', 'Hernandez', 'isabel.hernandez@vitanexo.com', 'isabelhernandez', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5555556666', 'active', NOW() - INTERVAL '45 days', NOW()),
(13, 7, 1, 3, 'Fernando', 'Gomez', 'fernando.gomez@vitanexo.com', 'fernandogomez', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5556667777', 'active', NOW() - INTERVAL '40 days', NOW()),
(14, 2, 1, 4, 'Patricia', 'Castillo', 'patricia.castillo@vitanexo.com', 'patriciacastillo', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5557778888', 'active', NOW() - INTERVAL '35 days', NOW()),
(15, 14, 1, 3, 'Ricardo', 'Morales', 'ricardo.morales@vitanexo.com', 'ricardomorales', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5558889999', 'active', NOW() - INTERVAL '30 days', NOW()),
(16, 14, 1, 3, 'Gabriela', 'Reyes', 'gabriela.reyes@vitanexo.com', 'gabrielareyes', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5559990000', 'active', NOW() - INTERVAL '25 days', NOW()),
(17, 7, 1, 3, 'Oscar', 'Vargas', 'oscar.vargas@vitanexo.com', 'oscarvargas', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5550001111', 'active', NOW() - INTERVAL '20 days', NOW()),
(18, 7, 1, 3, 'Lucia', 'Castro', 'lucia.castro@vitanexo.com', 'luciacastro', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5551110000', 'active', NOW() - INTERVAL '15 days', NOW()),
(19, 14, 1, 3, 'Javier', 'Ortega', 'javier.ortega@vitanexo.com', 'javierortega', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5552221111', 'active', NOW() - INTERVAL '10 days', NOW()),
(20, 14, 1, 3, 'Carmen', 'Flores', 'carmen.flores@vitanexo.com', 'carmenflores', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5553332222', 'active', NOW() - INTERVAL '5 days', NOW()),
(21, 2, 1, 4, 'Miguel', 'Santos', 'miguel.santos@vitanexo.com', 'miguelsantos', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5554443333', 'active', NOW() - INTERVAL '3 days', NOW()),
(22, 21, 1, 3, 'Adriana', 'Mendoza', 'adriana.mendoza@vitanexo.com', 'adrianamendoza', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5555554444', 'active', NOW() - INTERVAL '2 days', NOW()),

-- Empresa 2 - VitaNexo Salud (8 empleados)
(23, 7, 2, 3, 'Raul', 'Jimenez', 'raul.jimenez@vitanexo.com', 'rauljimenez', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5556665555', 'active', NOW() - INTERVAL '65 days', NOW()),
(24, 7, 2, 3, 'Teresa', 'Navarro', 'teresa.navarro@vitanexo.com', 'teresanavarro', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5557776666', 'active', NOW() - INTERVAL '60 days', NOW()),
(25, 7, 2, 4, 'Hector', 'Rios', 'hector.rios@vitanexo.com', 'hectorrios', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5558887777', 'active', NOW() - INTERVAL '55 days', NOW()),
(26, 25, 2, 3, 'Silvia', 'Mora', 'silvia.mora@vitanexo.com', 'silviamora', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5559998888', 'active', NOW() - INTERVAL '50 days', NOW()),
(27, 25, 2, 3, 'Alberto', 'Paredes', 'alberto.paredes@vitanexo.com', 'albertoparedes', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5550009999', 'active', NOW() - INTERVAL '45 days', NOW()),
(28, 7, 2, 3, 'Rosa', 'Cordero', 'rosa.cordero@vitanexo.com', 'rosacordero', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5551118888', 'active', NOW() - INTERVAL '40 days', NOW()),
(29, 25, 2, 3, 'Enrique', 'Salazar', 'enrique.salazar@vitanexo.com', 'enriquesalazar', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5552229999', 'active', NOW() - INTERVAL '35 days', NOW()),
(30, 25, 2, 3, 'Veronica', 'Lara', 'veronica.lara@vitanexo.com', 'veronicalara', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5553330000', 'active', NOW() - INTERVAL '30 days', NOW()),

-- Otras empresas (17 empleados)
(31, NULL, 3, 1, 'Daniel', 'Klein', 'daniel.klein@techcorp.com', 'danielklein', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5511112222', 'active', NOW() - INTERVAL '90 days', NOW()),
(32, 31, 3, 4, 'Emma', 'Weber', 'emma.weber@techcorp.com', 'emmaweber', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5512223333', 'active', NOW() - INTERVAL '85 days', NOW()),
(33, 32, 3, 3, 'Thomas', 'Schmidt', 'thomas.schmidt@techcorp.com', 'thomasschmidt', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5513334444', 'active', NOW() - INTERVAL '80 days', NOW()),
(34, 32, 3, 3, 'Anna', 'Muller', 'anna.muller@techcorp.com', 'annamuller', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5514445555', 'active', NOW() - INTERVAL '75 days', NOW()),
(35, NULL, 4, 1, 'Pierre', 'Dubois', 'pierre.dubois@healthplus.com', 'pierredubois', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5521112222', 'active', NOW() - INTERVAL '70 days', NOW()),
(36, 35, 4, 4, 'Marie', 'Laurent', 'marie.laurent@healthplus.com', 'marielaurent', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5522223333', 'active', NOW() - INTERVAL '65 days', NOW()),
(37, 36, 4, 3, 'Jean', 'Moreau', 'jean.moreau@healthplus.com', 'jeanmoreau', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5523334444', 'active', NOW() - INTERVAL '60 days', NOW()),
(38, 36, 4, 3, 'Claire', 'Petit', 'claire.petit@healthplus.com', 'clairepetit', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5524445555', 'active', NOW() - INTERVAL '55 days', NOW()),
(39, NULL, 5, 1, 'Antonio', 'Silva', 'antonio.silva@innovate.com', 'antoniosilva', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5531112222', 'active', NOW() - INTERVAL '50 days', NOW()),
(40, 39, 5, 4, 'Paula', 'Oliveira', 'paula.oliveira@innovate.com', 'paulaoliveira', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5532223333', 'active', NOW() - INTERVAL '45 days', NOW()),
(41, 40, 5, 3, 'Marcos', 'Santos', 'marcos.santos@innovate.com', 'marcossantos', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5533334444', 'active', NOW() - INTERVAL '40 days', NOW()),
(42, 40, 5, 3, 'Beatriz', 'Costa', 'beatriz.costa@innovate.com', 'beatrizcosta', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5534445555', 'active', NOW() - INTERVAL '35 days', NOW()),
(43, NULL, 6, 1, 'John', 'Smith', 'john.smith@biowellness.com', 'johnsmith', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5541112222', 'active', NOW() - INTERVAL '30 days', NOW()),
(44, 43, 6, 4, 'Sarah', 'Johnson', 'sarah.johnson@biowellness.com', 'sarahjohnson', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5542223333', 'active', NOW() - INTERVAL '25 days', NOW()),
(45, 44, 6, 3, 'Michael', 'Brown', 'michael.brown@biowellness.com', 'michaelbrown', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5543334444', 'active', NOW() - INTERVAL '20 days', NOW()),
(46, 44, 6, 3, 'Emily', 'Davis', 'emily.davis@biowellness.com', 'emilydavis', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5544445555', 'active', NOW() - INTERVAL '15 days', NOW()),
(47, 44, 6, 3, 'David', 'Wilson', 'david.wilson@biowellness.com', 'davidwilson', '$2b$12$NNWfni4hJdsq9wVHCIcY8eBolWxzEguF4xA3UIzCqOtaWbfPwWeH2', '5545556666', 'active', NOW() - INTERVAL '10 days', NOW())
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

-- Groups (14 grupos total)
INSERT INTO groups (id_group, id_manager, name) VALUES
(1, 2, 'Equipo Desarrollo Core'),
(2, 7, 'Equipo Data Science'),
(3, 2, 'Equipo Operaciones'),
(4, 7, 'Equipo Investigación'),
(5, 14, 'Equipo Desarrollo Frontend'),
(6, 21, 'Equipo Backend Avanzado'),
(7, 25, 'Equipo Data Analytics'),
(8, 32, 'Equipo Desarrollo Mobile'),
(9, 36, 'Equipo Investigación Clínica'),
(10, 40, 'Equipo UX/UI Design'),
(11, 44, 'Equipo Machine Learning'),
(12, 14, 'Equipo QA y Testing'),
(13, 21, 'Equipo DevOps'),
(14, 25, 'Equipo Bioestadística')
ON CONFLICT (id_group) DO UPDATE SET
id_manager = EXCLUDED.id_manager,
name = EXCLUDED.name;

-- Groups Employees
INSERT INTO groups_employees (id_group, id_employee) VALUES
-- Grupos originales
(1, 3), (1, 4),
(2, 5), (2, 6),
(3, 3), (3, 5),
(4, 4), (4, 6),

-- Grupos adicionales
-- Grupo 5: Frontend
(5, 8), (5, 9), (5, 10), (5, 15), (5, 16),
-- Grupo 6: Backend
(6, 11), (6, 12), (6, 17), (6, 18), (6, 19),
-- Grupo 7: Data Analytics
(7, 13), (7, 20), (7, 26), (7, 27), (7, 28),
-- Grupo 8: Mobile
(8, 33), (8, 34), (8, 41), (8, 42),
-- Grupo 9: Investigación Clínica
(9, 37), (9, 38), (9, 45), (9, 46),
-- Grupo 10: UX/UI
(10, 22), (10, 29), (10, 30), (10, 47),
-- Grupo 11: Machine Learning
(11, 23), (11, 24), (11, 31),
-- Grupo 12: QA
(12, 8), (12, 19), (12, 22),
-- Grupo 13: DevOps
(13, 9), (13, 17), (13, 33),
-- Grupo 14: Bioestadística
(14, 13), (14, 26), (14, 37)
ON CONFLICT (id_group, id_employee) DO NOTHING;

-- =========================================================
-- DATOS DE MÉTRICAS Y SNAPSHOTS (Simplificado para evitar conflictos)
-- =========================================================

-- Group Snapshots (14 snapshots básicos + algunos adicionales)
INSERT INTO group_snapshots (id_snapshot, id_group, snapshot_at, window_start, window_end, job_version, cohort_hash) VALUES
-- Grupo 1 - últimos 7 días
(1, 1, NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', 'v1.2.3', 'hash_001'),
(2, 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', 'v1.2.3', 'hash_002'),
(3, 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 'v1.2.3', 'hash_003'),

-- Grupo 2 - últimos 7 días  
(8, 2, NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', 'v1.2.3', 'hash_008'),
(9, 2, NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', 'v1.2.3', 'hash_009'),

-- Snapshots adicionales para otros grupos
(15, 5, NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 'v1.2.4', 'hash_015'),
(16, 6, NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'v1.2.4', 'hash_016'),
(17, 7, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'v1.2.4', 'hash_017')
ON CONFLICT (id_snapshot) DO UPDATE SET
id_group = EXCLUDED.id_group,
snapshot_at = EXCLUDED.snapshot_at,
window_start = EXCLUDED.window_start,
window_end = EXCLUDED.window_end,
job_version = EXCLUDED.job_version,
cohort_hash = EXCLUDED.cohort_hash;

-- Group Snapshots Members
INSERT INTO group_snapshots_members (id_snapshot, id_employee) VALUES
-- Snapshots básicos
(1, 3), (1, 4),
(2, 3), (2, 4),
(3, 3), (3, 4),
(8, 5), (8, 6),
(9, 5), (9, 6),

-- Snapshots adicionales
(15, 8), (15, 9), (15, 10),
(16, 11), (16, 12), 
(17, 13), (17, 20)
ON CONFLICT (id_snapshot, id_employee) DO NOTHING;

-- Daily Group Metrics (métricas básicas)
INSERT INTO daily_group_metrics (id_snapshot, metric_name, agg_type, value) VALUES
-- Grupo 1
(1, 'heart_rate', 'avg', 72.5), (1, 'mental_state', 'avg', 78.0), (1, 'stress', 'avg', 35.0),
(2, 'heart_rate', 'avg', 71.8), (2, 'mental_state', 'avg', 82.0), (2, 'stress', 'avg', 28.0),
(3, 'heart_rate', 'avg', 73.2), (3, 'mental_state', 'avg', 75.0), (3, 'stress', 'avg', 42.0),

-- Grupo 2
(8, 'heart_rate', 'avg', 68.2), (8, 'mental_state', 'avg', 85.0), (8, 'stress', 'avg', 25.0),
(9, 'heart_rate', 'avg', 69.5), (9, 'mental_state', 'avg', 88.0), (9, 'stress', 'avg', 22.0),

-- Grupos adicionales
(15, 'heart_rate', 'avg', 70.1), (15, 'mental_state', 'avg', 80.0), (15, 'stress', 'avg', 30.0),
(16, 'heart_rate', 'avg', 69.8), (16, 'mental_state', 'avg', 82.0), (16, 'stress', 'avg', 28.0),
(17, 'heart_rate', 'avg', 71.2), (17, 'mental_state', 'avg', 79.0), (17, 'stress', 'avg', 32.0)
ON CONFLICT (id_snapshot, metric_name, agg_type) DO UPDATE SET
value = EXCLUDED.value;

-- Daily Employee Metrics (métricas básicas)
INSERT INTO daily_employee_metrics (id_employee, id_snapshot, metric_name, agg_type, value) VALUES
-- María González (id:3)
(3, 1, 'heart_rate', 'avg', 70.0), (3, 1, 'mental_state', 'avg', 80.0), (3, 1, 'stress', 'avg', 30.0),
(3, 2, 'heart_rate', 'avg', 69.0), (3, 2, 'mental_state', 'avg', 85.0), (3, 2, 'stress', 'avg', 25.0),

-- Roberto Silva (id:4)
(4, 1, 'heart_rate', 'avg', 75.0), (4, 1, 'mental_state', 'avg', 76.0), (4, 1, 'stress', 'avg', 40.0),
(4, 2, 'heart_rate', 'avg', 74.5), (4, 2, 'mental_state', 'avg', 79.0), (4, 2, 'stress', 'avg', 31.0),

-- Empleados adicionales
(8, 15, 'heart_rate', 'avg', 72.0), (8, 15, 'mental_state', 'avg', 78.0), (8, 15, 'stress', 'avg', 35.0),
(11, 16, 'heart_rate', 'avg', 68.0), (11, 16, 'mental_state', 'avg', 85.0), (11, 16, 'stress', 'avg', 26.0)
ON CONFLICT (id_employee, id_snapshot, metric_name, agg_type) DO UPDATE SET
value = EXCLUDED.value;

-- =========================================================
-- ENCUESTAS Y PREGUNTAS
-- =========================================================

-- Group Survey Scores
INSERT INTO group_survey_scores (id_survey, id_group, start_at, end_at, group_score) VALUES
(1, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 85),
(2, 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 92),
(3, 1, NOW() - INTERVAL '1 day', NOW(), 88),
(4, 5, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 82),
(5, 6, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 87)
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
(5, 4, 8, NOW() - INTERVAL '3 days 2 hours', 80),
(6, 4, 9, NOW() - INTERVAL '3 days 1 hour', 84)
ON CONFLICT (id_response) DO UPDATE SET
id_survey = EXCLUDED.id_survey,
id_employee = EXCLUDED.id_employee,
submitted_at = EXCLUDED.submitted_at,
indiv_score = EXCLUDED.indiv_score;

-- Questions
INSERT INTO questions (id_question, id_group, created_at) VALUES
(1, 1, NOW() - INTERVAL '10 days'),
(2, 1, NOW() - INTERVAL '9 days'),
(3, 2, NOW() - INTERVAL '8 days'),
(4, 5, NOW() - INTERVAL '7 days'),
(5, 6, NOW() - INTERVAL '6 days')
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
(3, 'en', 'How do you rate your productivity this week?'),
(4, 'es', '¿Cómo calificarías tu nivel de energía hoy?'),
(4, 'en', 'How would you rate your energy level today?'),
(5, 'es', '¿Te sientes apoyado por tu equipo de trabajo?'),
(5, 'en', 'Do you feel supported by your work team?')
ON CONFLICT (id_question, locale) DO UPDATE SET
text = EXCLUDED.text;

-- =========================================================
-- EVENTOS E INTERVENCIONES
-- =========================================================

-- Events
INSERT INTO events (id_event, id_manager, title_message, body_message, coordinator_name, start_at, end_at) VALUES
(1, 2, 'Taller Bienestar', 'Sesión de mindfulness y manejo de estrés', 'Dr. Juan Perez', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 3 hours'),
(2, 7, 'Revisión Trimestral', 'Evaluación de métricas y objetivos del equipo', 'Laura Díaz', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days 2 hours'),
(3, 14, 'Taller de Resiliencia', 'Desarrollo de habilidades para manejar situaciones de estrés', 'Dra. Sofia Lopez', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 2 hours')
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
(2, 7, 'training', 'Capacitación en técnicas de productividad', 'Optimización de Productividad', 'Te invitamos a nuestro taller de métodos ágiles'),
(3, 14, 'mentoring', 'Sesión de mentoría para desarrollo profesional', 'Plan de Desarrollo', 'Hemos identificado oportunidades de crecimiento, agendemos una sesión')
ON CONFLICT (id_inter) DO UPDATE SET
id_manager = EXCLUDED.id_manager,
type = EXCLUDED.type,
description = EXCLUDED.description,
title_message = EXCLUDED.title_message,
body_message = EXCLUDED.body_message;

-- =========================================================
-- AUDITORÍA
-- =========================================================

-- Audit Logs
INSERT INTO audit_logs (id_event_log, id_actor, id_action, id_service, occurred_at, ip_actor, object_type, change_set) VALUES
(1, 1, 1, 1, NOW() - INTERVAL '2 hours', '192.168.1.100', 'employee', '{"action": "login", "result": "success"}'),
(2, 2, 3, 2, NOW() - INTERVAL '1 hour', '192.168.1.101', 'metrics', '{"updated_metrics": 15, "group": "Equipo Desarrollo Core"}'),
(3, 3, 2, 3, NOW() - INTERVAL '30 minutes', '192.168.1.102', 'reports', '{"report_type": "weekly", "exported": true}'),
(4, 8, 2, 2, NOW() - INTERVAL '45 minutes', '192.168.1.103', 'metrics', '{"action": "view", "dashboard": "employee_metrics"}')
ON CONFLICT (id_event_log) DO UPDATE SET
id_actor = EXCLUDED.id_actor,
id_action = EXCLUDED.id_action,
id_service = EXCLUDED.id_service,
occurred_at = EXCLUDED.occurred_at,
ip_actor = EXCLUDED.ip_actor,
object_type = EXCLUDED.object_type,
change_set = EXCLUDED.change_set;

-- =========================================================
-- VISTAS KPIs
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
-- ACTUALIZACIÓN DE SECUENCIAS
-- =========================================================

-- Aseguramos que las secuencias estén actualizadas para los próximos inserts
SELECT setval('employees_id_employee_seq', (SELECT MAX(id_employee) FROM employees));
SELECT setval('groups_id_group_seq', (SELECT MAX(id_group) FROM groups));
SELECT setval('group_snapshots_id_snapshot_seq', (SELECT MAX(id_snapshot) FROM group_snapshots));
SELECT setval('group_survey_scores_id_survey_seq', (SELECT MAX(id_survey) FROM group_survey_scores));
SELECT setval('indiv_survey_scores_id_response_seq', (SELECT MAX(id_response) FROM indiv_survey_scores));
SELECT setval('questions_id_question_seq', (SELECT MAX(id_question) FROM questions));
SELECT setval('events_id_event_seq', (SELECT MAX(id_event) FROM events));
SELECT setval('interventions_id_inter_seq', (SELECT MAX(id_inter) FROM interventions));
SELECT setval('audit_logs_id_event_log_seq', (SELECT MAX(id_event_log) FROM audit_logs));

-- =========================================================
-- FIN DE LA POBLACIÓN COMPLETA
-- =========================================================

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
-- STORED PROCEDURES / FUNCTIONS DE ADMINISTRACIÓN Y ANÁLISIS
-- =========================================================

-- 1️⃣ Promedios de métricas por grupo (últimos N días)
CREATE OR REPLACE FUNCTION fn_group_metrics_summary(days_back INT DEFAULT 7)
RETURNS TABLE(
  group_id INT,
  group_name TEXT,
  metric_name metric_enum,
  avg_value DOUBLE PRECISION,
  min_value DOUBLE PRECISION,
  max_value DOUBLE PRECISION
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id_group,
    g.name::TEXT AS group_name,
    dgm.metric_name,
    AVG(dgm.value) FILTER (WHERE dgm.agg_type = 'avg') AS avg_value,
    MIN(dgm.value) FILTER (WHERE dgm.agg_type = 'min') AS min_value,
    MAX(dgm.value) FILTER (WHERE dgm.agg_type = 'max') AS max_value
  FROM group_snapshots gs
  JOIN groups g ON gs.id_group = g.id_group
  JOIN daily_group_metrics dgm ON gs.id_snapshot = dgm.id_snapshot
  WHERE gs.snapshot_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY g.id_group, g.name, dgm.metric_name
  ORDER BY g.name, dgm.metric_name;
END;
$$;



-- 2️⃣ Estado de bienestar promedio por empresa
CREATE OR REPLACE FUNCTION fn_enterprise_wellbeing_summary()
RETURNS TABLE(
  enterprise_id INT,
  enterprise_name TEXT,
  wellbeing_avg DOUBLE PRECISION,
  stress_avg DOUBLE PRECISION,
  mental_state_avg DOUBLE PRECISION
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id_enterprise,
    e.name::TEXT AS enterprise_name,
    AVG(dem.value) FILTER (WHERE dem.metric_name = 'wellbeing' AND dem.agg_type = 'avg') AS wellbeing_avg,
    AVG(dem.value) FILTER (WHERE dem.metric_name = 'stress' AND dem.agg_type = 'avg') AS stress_avg,
    AVG(dem.value) FILTER (WHERE dem.metric_name = 'mental_state' AND dem.agg_type = 'avg') AS mental_state_avg
  FROM employees emp
  JOIN enterprises e ON emp.id_enterprise = e.id_enterprise
  JOIN daily_employee_metrics dem ON emp.id_employee = dem.id_employee
  GROUP BY e.id_enterprise, e.name
  ORDER BY e.name;
END;
$$;



-- 3️⃣ Detección de tendencias recientes (últimos 3 días) por grupo
CREATE OR REPLACE FUNCTION fn_group_trend_alerts()
RETURNS TABLE(
  group_id INT,
  group_name TEXT,
  metric_name metric_enum,
  trend_slope DOUBLE PRECISION,
  direction TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id_group,
    g.name::TEXT AS group_name,
    dgm.metric_name,
    (MAX(dgm.value) - MIN(dgm.value)) / GREATEST(COUNT(*), 1) AS trend_slope,
    CASE
      WHEN (MAX(dgm.value) - MIN(dgm.value)) > 0 THEN 'increasing'
      WHEN (MAX(dgm.value) - MIN(dgm.value)) < 0 THEN 'decreasing'
      ELSE 'stable'
    END::TEXT AS direction
  FROM group_snapshots gs
  JOIN groups g ON gs.id_group = g.id_group
  JOIN daily_group_metrics dgm ON gs.id_snapshot = dgm.id_snapshot
  WHERE gs.snapshot_at >= NOW() - INTERVAL '3 days'
  GROUP BY g.id_group, g.name, dgm.metric_name
  ORDER BY g.name, dgm.metric_name;
END;
$$;



-- 4️⃣ Participación promedio en encuestas por grupo
CREATE OR REPLACE FUNCTION fn_survey_participation_summary()
RETURNS TABLE(
  group_id INT,
  group_name TEXT,
  total_surveys BIGINT,
  total_responses BIGINT,
  participation_rate NUMERIC
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id_group,
    g.name::TEXT AS group_name,
    COUNT(DISTINCT gss.id_survey) AS total_surveys,
    COUNT(iss.id_response) AS total_responses,
    ROUND(
      (COUNT(iss.id_response)::NUMERIC /
      NULLIF(COUNT(DISTINCT gss.id_survey) * COUNT(DISTINCT ge.id_employee), 0)) * 100,
      2
    ) AS participation_rate
  FROM groups g
  LEFT JOIN group_survey_scores gss ON g.id_group = gss.id_group
  LEFT JOIN indiv_survey_scores iss ON gss.id_survey = iss.id_survey
  LEFT JOIN groups_employees ge ON g.id_group = ge.id_group
  GROUP BY g.id_group, g.name
  ORDER BY g.name;
END;
$$;



-- 5️⃣ Actividad reciente por usuario (últimos 7 días)
CREATE OR REPLACE FUNCTION fn_employee_activity(days_back INT DEFAULT 7)
RETURNS TABLE(
  employee_id INT,
  full_name TEXT,
  role_name TEXT,
  total_logs BIGINT,
  last_action TIMESTAMPTZ
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id_employee,
    (e.first_name || ' ' || e.last_name)::TEXT AS full_name,
    r.name::TEXT AS role_name,
    COUNT(al.id_event_log) AS total_logs,
    MAX(al.occurred_at) AS last_action
  FROM employees e
  LEFT JOIN roles r ON e.id_role = r.id_role
  LEFT JOIN audit_logs al ON e.id_employee = al.id_actor
  WHERE al.occurred_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY e.id_employee, e.first_name, e.last_name, r.name
  ORDER BY total_logs DESC;
END;
$$;



-- 6️⃣ Consolidado diario (ideal para dashboards)
CREATE OR REPLACE FUNCTION fn_daily_system_overview()
RETURNS TABLE(
  date_label DATE,
  total_snapshots BIGINT,
  total_survey_responses BIGINT,
  avg_wellbeing DOUBLE PRECISION,
  avg_stress DOUBLE PRECISION,
  avg_mental_state DOUBLE PRECISION
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(gs.snapshot_at) AS date_label,
    COUNT(DISTINCT gs.id_snapshot) AS total_snapshots,
    COUNT(DISTINCT iss.id_response) AS total_survey_responses,
    AVG(dgm.value) FILTER (WHERE dgm.metric_name = 'wellbeing' AND dgm.agg_type = 'avg') AS avg_wellbeing,
    AVG(dgm.value) FILTER (WHERE dgm.metric_name = 'stress' AND dgm.agg_type = 'avg') AS avg_stress,
    AVG(dgm.value) FILTER (WHERE dgm.metric_name = 'mental_state' AND dgm.agg_type = 'avg') AS avg_mental_state
  FROM group_snapshots gs
  LEFT JOIN daily_group_metrics dgm ON gs.id_snapshot = dgm.id_snapshot
  LEFT JOIN group_survey_scores gss ON gs.id_group = gss.id_group
  LEFT JOIN indiv_survey_scores iss ON gss.id_survey = iss.id_survey
  WHERE gs.snapshot_at >= NOW() - INTERVAL '14 days'
  GROUP BY DATE(gs.snapshot_at)
  ORDER BY DATE(gs.snapshot_at);
END;
$$;



-- =========================================================
-- END OF SCHEMA
-- =========================================================