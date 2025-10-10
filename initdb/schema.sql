-- =========================================================
-- ENUMS PARA MÉTRICAS Y AGGREGATION
-- =========================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'metric_enum') THEN
        CREATE TYPE metric_enum AS ENUM (
            'heart_rate',
            'mental_state',
            'stress',
            'sleep_quality',
            'activity_level',
            'wellbeing'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agg_enum') THEN
        CREATE TYPE agg_enum AS ENUM ('avg','sum','min','max');
    END IF;
END$$;

-- =========================================================
-- TABLAS BASE
-- =========================================================
CREATE TABLE IF NOT EXISTS actions (
    id_action SERIAL PRIMARY KEY,
    action_name VARCHAR(100) NOT NULL,
    action_desc VARCHAR
);

CREATE TABLE IF NOT EXISTS services (
    id_service SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    service_desc VARCHAR
);

CREATE TABLE IF NOT EXISTS countries (
    id_country SERIAL PRIMARY KEY,
    name VARCHAR(56) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS states (
    id_state SERIAL PRIMARY KEY,
    id_country INTEGER NOT NULL REFERENCES countries(id_country) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS enterprises (
    id_enterprise SERIAL PRIMARY KEY,
    id_state INTEGER NOT NULL REFERENCES states(id_state) ON DELETE CASCADE,
    name VARCHAR(150) UNIQUE NOT NULL,
    telephone VARCHAR(15) CHECK (telephone ~ '^\d{9,15}$') NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
    id_device SERIAL PRIMARY KEY,
    id_enterprise INTEGER NOT NULL REFERENCES enterprises(id_enterprise) ON DELETE CASCADE,
    device_type VARCHAR(50) NOT NULL,
    registration_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roles (
    id_role SERIAL PRIMARY KEY,
    name VARCHAR(48) UNIQUE NOT NULL,
    description VARCHAR
);

-- =========================================================
-- EMPLOYEES (Usuarios con Auth)
-- =========================================================
CREATE TABLE IF NOT EXISTS employees (
    id_employee SERIAL PRIMARY KEY,
    id_manager INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL,
    id_enterprise INTEGER NOT NULL REFERENCES enterprises(id_enterprise) ON DELETE CASCADE,
    id_state INTEGER REFERENCES states(id_state) ON DELETE SET NULL,
    id_role INTEGER NOT NULL REFERENCES roles(id_role) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telephone VARCHAR(15) CHECK (telephone ~ '^\d{9,15}$'),
    status VARCHAR(20) NOT NULL DEFAULT 'active', 
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- AUDITORÍA
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id_event_log SERIAL PRIMARY KEY,
    id_actor INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL,
    id_action INTEGER REFERENCES actions(id_action),
    id_service INTEGER REFERENCES services(id_service),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_actor INET,
    object_type VARCHAR(100),
    change_set JSONB NOT NULL
);

-- =========================================================
-- PERMISOS POR ROL
-- =========================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id_role INTEGER NOT NULL REFERENCES roles(id_role) ON DELETE CASCADE,
    id_action INTEGER NOT NULL REFERENCES actions(id_action) ON DELETE CASCADE,
    PRIMARY KEY (id_role, id_action)
);

-- =========================================================
-- ORGANIZACIÓN Y MÉTRICAS
-- =========================================================
CREATE TABLE IF NOT EXISTS groups (
    id_group SERIAL PRIMARY KEY,
    id_manager INTEGER NOT NULL REFERENCES employees(id_employee) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS groups_employees (
    id_group INTEGER NOT NULL REFERENCES groups(id_group) ON DELETE CASCADE,
    id_employee INTEGER NOT NULL REFERENCES employees(id_employee) ON DELETE CASCADE,
    PRIMARY KEY (id_group, id_employee)
);

CREATE TABLE IF NOT EXISTS daily_employee_metrics (
    id_user INTEGER NOT NULL REFERENCES employees(id_employee) ON DELETE CASCADE,
    date DATE NOT NULL,
    metric_name metric_enum NOT NULL,
    agg_type agg_enum NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    window_start TIMESTAMPTZ,
    window_end TIMESTAMPTZ,
    job_version VARCHAR(50),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    group_snapshot INTEGER,
    PRIMARY KEY (id_user, date, metric_name, agg_type)
);

CREATE TABLE IF NOT EXISTS daily_group_metrics (
    id_group INTEGER NOT NULL REFERENCES groups(id_group) ON DELETE CASCADE,
    date DATE NOT NULL,
    metric_name metric_enum NOT NULL,
    agg_type agg_enum NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    window_start TIMESTAMPTZ,
    window_end TIMESTAMPTZ,
    job_version VARCHAR(50),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    group_snapshot INTEGER,
    PRIMARY KEY (id_group, date, metric_name, agg_type)
);

-- =========================================================
-- ENCUESTAS Y EVENTOS
-- =========================================================
CREATE TABLE IF NOT EXISTS group_survey_scores (
    id_survey SERIAL PRIMARY KEY,
    id_group INTEGER NOT NULL REFERENCES groups(id_group) ON DELETE CASCADE,
    start_date DATE,
    start_time TIME,
    end_date DATE NOT NULL,
    end_time TIME NOT NULL,
    group_score INTEGER
);

CREATE TABLE IF NOT EXISTS questions (
    id_question SERIAL PRIMARY KEY,
    id_survey INTEGER NOT NULL REFERENCES group_survey_scores(id_survey) ON DELETE CASCADE,
    question VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS indiv_survey_scores (
    id_survey INTEGER REFERENCES group_survey_scores(id_survey) ON DELETE CASCADE,
    id_user INTEGER NOT NULL REFERENCES employees(id_employee) ON DELETE CASCADE,
    indiv_score INTEGER,
    PRIMARY KEY (id_survey, id_user)
);

CREATE TABLE IF NOT EXISTS events (
    id_event SERIAL PRIMARY KEY,
    id_manager INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL,
    title_message VARCHAR NOT NULL,
    body_message VARCHAR NOT NULL,
    coordinator_name VARCHAR,
    start_date DATE,
    start_time TIME,
    end_date DATE NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS interventions (
    id_inter SERIAL PRIMARY KEY,
    id_manager INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL,
    type VARCHAR NOT NULL,
    description VARCHAR,
    title_message VARCHAR NOT NULL,
    body_message VARCHAR NOT NULL
);

-- =========================================================
-- ÍNDICES RECOMENDADOS PARA KPIs
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_daily_employee_metrics_window_metric
    ON daily_employee_metrics(window_start, metric_name);

CREATE INDEX IF NOT EXISTS idx_daily_group_metrics_date_metric
    ON daily_group_metrics(date, metric_name);

CREATE INDEX IF NOT EXISTS idx_groups_employees_employee
    ON groups_employees(id_employee);

CREATE INDEX IF NOT EXISTS idx_groups_employees_group
    ON groups_employees(id_group);

-- =========================================================
-- VISTAS KPIs
-- =========================================================
CREATE OR REPLACE VIEW vw_kpi_realtime AS
SELECT 
    TO_CHAR(window_start, 'HH24:00') AS time,
    AVG(CASE WHEN metric_name = 'heart_rate' THEN value END) AS heartRate,
    AVG(CASE WHEN metric_name = 'mental_state' THEN value END) AS mentalState,
    AVG(CASE WHEN metric_name = 'stress' THEN value END) AS stress,
    COUNT(DISTINCT id_user) AS users
FROM daily_employee_metrics
WHERE window_start >= NOW() - INTERVAL '24 hours'
GROUP BY TO_CHAR(window_start, 'HH24:00')
ORDER BY MIN(window_start);

CREATE OR REPLACE VIEW vw_kpi_weekly AS
SELECT
    TO_CHAR(date, 'FMDay') AS day,
    AVG(CASE WHEN metric_name = 'heart_rate' THEN value END) AS heartRate,
    AVG(CASE WHEN metric_name = 'mental_state' THEN value END) AS mentalState,
    COUNT(DISTINCT gs.id_survey) AS alerts,
    AVG(gs.group_score) AS satisfaction
FROM daily_group_metrics gm
LEFT JOIN group_survey_scores gs
    ON gs.id_group = gm.id_group
WHERE gm.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY TO_CHAR(date, 'FMDay')
ORDER BY MIN(date);

CREATE OR REPLACE VIEW vw_kpi_radar AS
SELECT 'Salud Cardiovascular' AS metric, COALESCE(AVG(value), 0) AS value
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
-- STORED PROCEDURES PARA VISTAS KPIs
-- =========================================================
CREATE OR REPLACE FUNCTION sp_kpi_realtime()
RETURNS TABLE(time TEXT, heartRate DOUBLE PRECISION, mentalState DOUBLE PRECISION, stress DOUBLE PRECISION, users INT)
AS $$
    SELECT * FROM vw_kpi_realtime;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION sp_kpi_weekly()
RETURNS TABLE(day TEXT, heartRate DOUBLE PRECISION, mentalState DOUBLE PRECISION, alerts INT, satisfaction DOUBLE PRECISION)
AS $$
    SELECT * FROM vw_kpi_weekly;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION sp_kpi_radar()
RETURNS TABLE(metric TEXT, value DOUBLE PRECISION)
AS $$
    SELECT * FROM vw_kpi_radar;
$$ LANGUAGE sql;

-- =========================================================
-- =========================================================
-- PAISES Y ESTADOS
-- =========================================================
INSERT INTO countries(name) VALUES 
('Mexico'), ('Colombia'), ('Argentina')
ON CONFLICT DO NOTHING;

INSERT INTO states(id_country, name)
SELECT c.id_country, s
FROM countries c, unnest(array['Ciudad de Mexico','Jalisco','Bogota','Medellin','Buenos Aires']) AS s
WHERE (c.name = 'Mexico' AND s IN ('Ciudad de Mexico','Jalisco'))
   OR (c.name = 'Colombia' AND s IN ('Bogota','Medellin'))
   OR (c.name = 'Argentina' AND s IN ('Buenos Aires'));

-- =========================================================
-- EMPRESAS
-- =========================================================
INSERT INTO enterprises(id_state, name, telephone, email)
SELECT s.id_state, 'Empresa ' || s.name, '5551234567', LOWER('contact@' || s.name || '.com')
FROM states s
ON CONFLICT DO NOTHING;

-- =========================================================
-- ROLES
-- =========================================================
INSERT INTO roles(name, description) VALUES
('Admin','Administrador del sistema'),
('Manager','Gerente de grupo'),
('Employee','Empleado regular')
ON CONFLICT DO NOTHING;

-- =========================================================
-- EMPLEADOS
-- =========================================================
INSERT INTO employees(id_manager, id_enterprise, id_state, id_role, first_name, last_name, email, username, password_hash, telephone)
SELECT NULL, e.id_enterprise, e.id_state, r.id_role, 
       'User' || i, 'Test', 'user' || i || '@test.com', 'user' || i, 'hash_test', '5551234' || LPAD(i::text,4,'0')
FROM enterprises e
CROSS JOIN generate_series(1,5) AS i
JOIN roles r ON r.name='Employee'
ON CONFLICT DO NOTHING;

-- =========================================================
-- GRUPOS Y ASIGNACIÓN DE EMPLEADOS
-- =========================================================
INSERT INTO groups(id_manager, name)
VALUES (2, 'Grupo Demo')  -- Admin como manager
ON CONFLICT DO NOTHING;

INSERT INTO groups_employees(id_group, id_employee)
SELECT id_group, 4  -- User como miembro
FROM groups
WHERE name='Grupo Demo'
ON CONFLICT DO NOTHING;

-- =========================================================
-- MÉTRICAS DIARIAS EMPLEADO
-- =========================================================
INSERT INTO daily_employee_metrics(id_user, date, metric_name, agg_type, value, window_start, window_end, job_version)
SELECT e.id_employee, CURRENT_DATE - (i % 7), m.metric, 'avg', (random()*100)::int, NOW() - interval '1 hour' * i, NOW() - interval '1 hour' * (i-1), 'v1'
FROM employees e
CROSS JOIN generate_series(1,50) AS i
CROSS JOIN (VALUES ('heart_rate'),('mental_state'),('stress'),('sleep_quality'),('activity_level')) AS m(metric)
ON CONFLICT DO NOTHING;

-- =========================================================
-- MÉTRICAS DIARIAS GRUPO
-- =========================================================
INSERT INTO daily_group_metrics(id_group, date, metric_name, agg_type, value, window_start, window_end, job_version)
SELECT id_group,
       CURRENT_DATE - (i % 7),
       'wellbeing',
       'avg',
       (random()*100)::int,
       NOW() - interval '1 hour' * i,
       NOW() - interval '1 hour' * (i-1),
       'v1'
FROM groups
CROSS JOIN generate_series(1,20) AS i
WHERE name='Grupo Demo'
ON CONFLICT DO NOTHING;

-- =========================================================
-- ENCUESTAS DE GRUPO
-- =========================================================
INSERT INTO group_survey_scores(id_group, start_date, start_time, end_date, end_time, group_score)
SELECT id_group,
       CURRENT_DATE - 2,
       '09:00',
       CURRENT_DATE - 2,
       '17:00',
       (random()*100)::int
FROM groups
WHERE name='Grupo Demo'
ON CONFLICT DO NOTHING;

INSERT INTO questions(id_survey, question)
SELECT gs.id_survey, 'Pregunta de prueba ' || i
FROM group_survey_scores gs
CROSS JOIN generate_series(1,3) AS i
WHERE gs.id_group = (SELECT id_group FROM groups WHERE name='Grupo Demo')
ON CONFLICT DO NOTHING;

INSERT INTO indiv_survey_scores(id_survey, id_user, indiv_score)
SELECT gs.id_survey, 4, (random()*100)::int  -- Solo User
FROM group_survey_scores gs
WHERE gs.id_group = (SELECT id_group FROM groups WHERE name='Grupo Demo')
ON CONFLICT DO NOTHING;
-- =========================================================

