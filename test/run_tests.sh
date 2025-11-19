#!/bin/bash
set -e

echo "=== Ejecutando Smoke Tests ==="
pytest --maxfail=1 --disable-warnings -v /tests/smoke --junitxml=/tests/reports/smoke_report.xml

echo "=== Ejecutando Baseline Tests ==="
pytest --maxfail=1 --disable-warnings -v /tests/baseline --junitxml=/tests/reports/baseline_report.xml

echo "=== Ejecutando Locust ==="
echo "Running Locust with users=$LOCUST_USERS, spawn_rate=$LOCUST_SPAWN_RATE, run_time=$LOCUST_RUNTIME"

locust -f /tests/locust/locustfile.py \
    --host="$CMS_API_URL" \
    --users="$LOCUST_USERS" \
    --spawn-rate="$LOCUST_SPAWN_RATE" \
    --run-time="$LOCUST_RUNTIME" \
    --headless \
    --csv=/tests/reports/locust_report \
    --html=/tests/reports/locust_report.html
echo   "=== Tests Completed ==="