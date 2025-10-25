import psycopg2
import os

def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "vitanexo-db"),
        port=5432,
        user="admin",
        password="admin",
        dbname="vitanexo_postgres_db"
    )

def test_referential_integrity():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT COUNT(*) FROM employees e
        LEFT JOIN enterprises en ON e.id_enterprise = en.id_enterprise
        WHERE en.id_enterprise IS NULL;
    """)
    missing_refs = cur.fetchone()[0]
    assert missing_refs == 0, "Existen empleados sin empresa válida"
    conn.close()

def test_metric_names_are_valid():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT metric_name FROM daily_employee_metrics;")
    metrics = {row[0] for row in cur.fetchall()}
    expected = {'heart_rate', 'mental_state', 'stress', 'sleep_quality', 'activity_level', 'wellbeing'}
    assert metrics.issubset(expected), f"Métricas desconocidas: {metrics - expected}"
    conn.close()

def test_roles_exist():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT name FROM roles;")
    roles = [r[0].lower() for r in cur.fetchall()]  # convertir a minúsculas

    expected_roles = ['admin', 'manager', 'employee']
    for r in expected_roles:
        assert r in roles, f"Falta el rol esperado: {r}"
    conn.close()
