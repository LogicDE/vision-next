-- =========================================================
-- VISTAS KPIs CORREGIDAS
-- =========================================================
CREATE OR REPLACE VIEW vw_kpi_realtime AS
SELECT 
    TO_CHAR(window_start, 'HH24:00') AS kpi_hour,
    AVG(CASE WHEN metric_name = 'heart_rate' THEN value END) AS heartrate,
    AVG(CASE WHEN metric_name = 'mental_state' THEN value END) AS mentalstate,
    AVG(CASE WHEN metric_name = 'stress' THEN value END) AS stress,
    COUNT(DISTINCT id_user) AS users
FROM daily_employee_metrics
WHERE window_start >= NOW() - INTERVAL '24 hours'
GROUP BY TO_CHAR(window_start, 'HH24:00')
ORDER BY MIN(window_start);

CREATE OR REPLACE VIEW vw_kpi_weekly AS
SELECT
    TO_CHAR(gm.date, 'FMDay') AS kpi_day,
    AVG(CASE WHEN metric_name = 'heart_rate' THEN value END) AS heartrate,
    AVG(CASE WHEN metric_name = 'mental_state' THEN value END) AS mentalstate,
    COUNT(DISTINCT gs.id_survey) AS alerts,
    AVG(gs.group_score) AS satisfaction
FROM daily_group_metrics gm
LEFT JOIN group_survey_scores gs
    ON gs.id_group = gm.id_group
WHERE gm.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY TO_CHAR(gm.date, 'FMDay')
ORDER BY MIN(gm.date);

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
-- FUNCIONES KPIs CORREGIDAS
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
-- PROCEDIMIENTOS CREATE PROCEDURE
-- =========================================================
-- Procedimiento para listar logs de auditoría recientes
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


-- Medicion para poder hacer el rendimiento promedio por grupo.

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
               COUNT(DISTINCT dem.id_user) AS active_users
        FROM groups g
        LEFT JOIN daily_group_metrics dgm ON dgm.id_group = g.id_group
        LEFT JOIN groups_employees ge ON ge.id_group = g.id_group
        LEFT JOIN daily_employee_metrics dem ON dem.id_user = ge.id_employee
        GROUP BY g.name
        ORDER BY avg_wellbeing DESC
    LOOP
        RAISE NOTICE 'Grupo: %, Bienestar promedio: %, Usuarios activos: %',
            rec.group_name, rec.avg_wellbeing, rec.active_users;
    END LOOP;
END;
$$;


-- Lista empleados filtrados por rol

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
