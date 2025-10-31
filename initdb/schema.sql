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
-- (1 admin level per your “final ERD”: state/province/region)
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
-- Optional data-quality rule (scoped uniqueness):
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
-- ADDRESSES (as in ERD: neighborhood + postal code; street parts)
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
-- SNAPSHOTS + METRICS (final design: facts keyed by snapshot)
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
-- SURVEYS (group aggregate + individual responses)
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
-- QUESTIONS + i18n (questions belong to group; text localized)
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
-- END OF SCHEMA
-- =========================================================
-- =========================================================
-- VISTAS KPIs ACTUALIZADAS PARA NUEVA ESTRUCTURA
-- =========================================================

-- 1️⃣ KPI en tiempo real (últimas 24 horas)
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


-- 2️⃣ KPI semanal (últimos 7 días)
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


-- 3️⃣ KPI radar (visión de bienestar general)
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
-- FUNCIONES KPI (INTERFACES PARA LA APP)
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
-- PROCEDIMIENTOS AUXILIARES DE GESTIÓN
-- =========================================================

-- Listar logs recientes
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

-- Rendimiento promedio por grupo
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

-- Lista empleados por rol
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

