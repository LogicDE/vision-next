
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
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, deleted
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
    id_manager INTEGER NOT NULL REFERENCES employees(id_employee),
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
    metric_name VARCHAR(50) NOT NULL,
    agg_type VARCHAR(20) NOT NULL,
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
    metric_name VARCHAR(50) NOT NULL,
    agg_type VARCHAR(20) NOT NULL,
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
