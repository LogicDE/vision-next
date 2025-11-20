import asyncio
import logging
import os
from datetime import datetime, time
from typing import Dict, List, Optional

import asyncpg
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("iot_simulator")


# ---------------------------------------------------------------------------
# Configuration & Auth client
# ---------------------------------------------------------------------------


CMS_BASE_URL = os.getenv("CMS_API_URL", "http://cms-backend:8000")
BIOMETRIC_BASE_URL = os.getenv("BIOMETRIC_API_URL", "http://biometric-microservice:9000")
IOT_USER_EMAIL = os.getenv("IOT_USER_EMAIL", "carlos@vitanexo.com")
IOT_USER_PASSWORD = os.getenv("IOT_USER_PASSWORD", "123456")
SEND_INTERVAL_SECONDS = int(os.getenv("IOT_SEND_INTERVAL_SECONDS", "5"))
SIM_PG_DSN = os.getenv(
    "SIM_PG_DSN",
    "postgres://admin:admin@vitanexo-db:5432/vitanexo_postgres_db",
)


class AuthState(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None


auth_state = AuthState()
http_client = httpx.AsyncClient(timeout=10)
db_pool: Optional[asyncpg.Pool] = None


async def login_if_needed() -> None:
    if auth_state.access_token and auth_state.refresh_token:
        return
    logger.info("IoT simulator logging in to cms-backend as %s", IOT_USER_EMAIL)
    resp = await http_client.post(
        f"{CMS_BASE_URL}/auth/login",
        json={"email": IOT_USER_EMAIL, "password": IOT_USER_PASSWORD},
    )
    if resp.status_code != 201 and resp.status_code != 200:
        raise RuntimeError(f"Login failed: {resp.status_code} {resp.text}")
    data = resp.json()
    auth_state.access_token = data.get("accessToken")
    auth_state.refresh_token = data.get("refreshToken")
    if not auth_state.access_token or not auth_state.refresh_token:
        raise RuntimeError("Login response missing accessToken/refreshToken")
    logger.info("IoT simulator login successful")


async def refresh_tokens() -> bool:
    if not auth_state.refresh_token:
        logger.warning("No refresh token available; cannot refresh")
        return False
    logger.info("Refreshing IoT simulator tokens")
    resp = await http_client.post(
        f"{CMS_BASE_URL}/auth/refresh",
        json={"refreshToken": auth_state.refresh_token},
    )
    if resp.status_code not in (200, 201):
        logger.warning("Token refresh failed: %s %s", resp.status_code, resp.text)
        return False
    data = resp.json()
    new_access = data.get("accessToken")
    new_refresh = data.get("refreshToken", auth_state.refresh_token)
    if not new_access:
        logger.warning("Token refresh response missing accessToken")
        return False
    auth_state.access_token = new_access
    auth_state.refresh_token = new_refresh
    logger.info("Token refresh succeeded")
    return True


def auth_headers() -> Dict[str, str]:
    headers: Dict[str, str] = {}
    if auth_state.access_token:
        headers["Authorization"] = f"Bearer {auth_state.access_token}"
    if auth_state.refresh_token:
        headers["X-Refresh-Token"] = auth_state.refresh_token
    return headers


async def post_biometric(payload: Dict) -> None:
    """
    Send payload to biometric-microservice with JWT and auto-refresh on 401.
    """

    await login_if_needed()
    url = f"{BIOMETRIC_BASE_URL.rstrip('/')}/api/biometric"
    headers = auth_headers()

    resp = await http_client.post(url, json=payload, headers=headers)
    if resp.status_code == 401:
        logger.warning("Biometric POST returned 401; attempting token refresh")
        if await refresh_tokens():
            resp = await http_client.post(url, json=payload, headers=auth_headers())

    if resp.status_code >= 300:
        logger.warning(
            "Biometric POST failed: %s %s %s", resp.status_code, resp.reason_phrase, resp.text
        )
    else:
        logger.debug("Biometric POST OK: %s", resp.status_code)


# ---------------------------------------------------------------------------
# Sensor configuration & simulation
# ---------------------------------------------------------------------------


class EnvAirBaseline(BaseModel):
    co2_empty_min: float = 400.0
    co2_empty_max: float = 600.0
    co2_occupied_min: float = 800.0
    co2_occupied_max: float = 1500.0

    pm25_good_min: float = 1.0
    pm25_good_max: float = 12.0
    pm25_spike_min: float = 40.0
    pm25_spike_max: float = 80.0
    pm25_spike_probability: float = 0.02

    temp_night_min: float = 20.0
    temp_night_max: float = 22.0
    temp_day_min: float = 22.0
    temp_day_max: float = 25.0


class EnvAmbientBaseline(BaseModel):
    noise_night_min: float = 25.0
    noise_night_max: float = 35.0
    noise_work_min: float = 40.0
    noise_work_max: float = 60.0
    noise_peak_min: float = 65.0
    noise_peak_max: float = 75.0
    noise_peak_probability: float = 0.03

    light_night_min: float = 0.0
    light_night_max: float = 20.0
    light_work_min: float = 300.0
    light_work_max: float = 600.0
    light_sunny_min: float = 800.0
    light_sunny_max: float = 1000.0
    light_sunny_probability: float = 0.1


class SensorConfig(BaseModel):
    sensor_id: str = Field(..., description="Device primary key (id_device) as string")
    display_name: str
    org_id: int
    enterprise_name: str
    location_id: int
    location_name: str
    model: str = "IoT-Sim"
    active: bool = True

    work_start: time = time(9, 0)
    work_end: time = time(18, 0)

    env_air: EnvAirBaseline = EnvAirBaseline()
    env_ambient: EnvAmbientBaseline = EnvAmbientBaseline()


class SensorState(BaseModel):
    last_co2_ppm: float = 450.0
    last_pm25: float = 8.0
    last_temp_c: float = 22.0


sensors: Dict[str, SensorConfig] = {}
sensor_states: Dict[str, SensorState] = {}
enterprise_cache: List["EnterpriseLocation"] = []

DEFAULT_DEVICE_TYPE = "iot_env"


async def load_enterprise_cache() -> None:
    """
    Load enterprises and locations from Postgres so we can both:
    - Validate location ↔ enterprise relationships.
    - Derive defaults for initial sensors.
    """
    global enterprise_cache
    if db_pool is None:
        return
    async with db_pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT e.id_enterprise,
                   e.name AS enterprise_name,
                   l.id_location,
                   l.location_name
            FROM enterprises e
            JOIN enterprise_locations l
              ON l.id_enterprise = e.id_enterprise
            WHERE l.active = true
            ORDER BY e.id_enterprise, l.id_location;
            """
        )
    by_ent: Dict[int, Dict] = {}
    for r in rows:
        ent_id = int(r["id_enterprise"])
        if ent_id not in by_ent:
            by_ent[ent_id] = {
                "enterprise_id": ent_id,
                "enterprise_name": r["enterprise_name"],
                "locations": [],
            }
        by_ent[ent_id]["locations"].append(
            {
                "location_id": int(r["id_location"]),
                "location_name": r["location_name"],
            }
        )
    enterprise_cache = [
        EnterpriseLocation(**data) for data in sorted(by_ent.values(), key=lambda d: d["enterprise_id"])
    ]
    logger.info("Loaded %d enterprises / locations from DB", len(enterprise_cache))


async def init_default_sensors_from_cache() -> None:
    """
    Load all existing IoT devices (device_type = 'iot_env') from the devices
    table and register them as simulated sensors.
    """
    global sensors, sensor_states, db_pool

    if sensors:
        return
    if db_pool is None:
        logger.warning("DB pool not initialised; cannot load devices")
        return

    async with db_pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT d.id_device,
                   d.name,
                   d.device_type,
                   d.status,
                   l.id_location,
                   l.location_name,
                   e.id_enterprise,
                   e.name AS enterprise_name
            FROM devices d
            JOIN enterprise_locations l ON d.id_location = l.id_location
            JOIN enterprises e ON l.id_enterprise = e.id_enterprise
            WHERE d.device_type = $1
              AND d.status != 'removed'
            ORDER BY d.id_device;
            """,
            DEFAULT_DEVICE_TYPE,
        )

    for r in rows:
        sid = str(r["id_device"])
        status = r["status"]
        sensors[sid] = SensorConfig(
            sensor_id=sid,
            display_name=r["name"] or f"Device {sid}",
            org_id=r["id_enterprise"],
            enterprise_name=r["enterprise_name"],
            location_id=r["id_location"],
            location_name=r["location_name"],
            model="IoT-Sim",
            active=(status == "active"),
        )
        sensor_states.setdefault(sid, SensorState())
    logger.info("Initialized %d sensors from devices table", len(sensors))


def in_work_hours(now: datetime, sensor: SensorConfig) -> bool:
    t = now.time()
    if sensor.work_start <= sensor.work_end:
        return sensor.work_start <= t <= sensor.work_end
    # spans midnight
    return t >= sensor.work_start or t <= sensor.work_end


def rand_uniform(a: float, b: float) -> float:
    from random import random

    return a + (b - a) * random()


def simulate_env_air(now: datetime, sensor: SensorConfig, state: SensorState) -> Dict[str, float]:
    b = sensor.env_air
    work = in_work_hours(now, sensor)

    # CO2 target based on occupancy
    if work:
        target_co2 = rand_uniform(b.co2_occupied_min, b.co2_occupied_max)
    else:
        target_co2 = rand_uniform(b.co2_empty_min, b.co2_empty_max)

    # Smooth transition
    state.last_co2_ppm = state.last_co2_ppm + 0.2 * (target_co2 - state.last_co2_ppm)

    # PM2.5 baseline
    from random import random

    if random() < b.pm25_spike_probability and work:
        target_pm25 = rand_uniform(b.pm25_spike_min, b.pm25_spike_max)
    else:
        target_pm25 = rand_uniform(b.pm25_good_min, b.pm25_good_max)
    state.last_pm25 = state.last_pm25 + 0.3 * (target_pm25 - state.last_pm25)

    # Temperature diurnal drift
    hour = now.hour + now.minute / 60.0
    if 6 <= hour <= 18:
        target_temp = rand_uniform(b.temp_day_min, b.temp_day_max)
    else:
        target_temp = rand_uniform(b.temp_night_min, b.temp_night_max)
    state.last_temp_c = state.last_temp_c + 0.1 * (target_temp - state.last_temp_c)

    return {
        "co2_ppm": round(state.last_co2_ppm, 1),
        "pm25_ugm3": round(state.last_pm25, 1),
        "temp_c": round(state.last_temp_c, 2),
    }


def simulate_env_ambient(now: datetime, sensor: SensorConfig) -> Dict[str, float]:
    b = sensor.env_ambient
    work = in_work_hours(now, sensor)
    from random import random

    # Noise
    if not work:
        noise = rand_uniform(b.noise_night_min, b.noise_night_max)
    else:
        noise = rand_uniform(b.noise_work_min, b.noise_work_max)
        # Occasional peaks
        if random() < b.noise_peak_probability:
            noise = rand_uniform(b.noise_peak_min, b.noise_peak_max)

    # Light
    if not work:
        light = rand_uniform(b.light_night_min, b.light_night_max)
    else:
        light = rand_uniform(b.light_work_min, b.light_work_max)
        if random() < b.light_sunny_probability:
            light = rand_uniform(b.light_sunny_min, b.light_sunny_max)

    return {
        "noise_db": round(noise, 1),
        "light_lux": round(light, 1),
    }


async def sensor_loop() -> None:
    await login_if_needed()
    while True:
        now = datetime.utcnow()
        for sensor_id, cfg in list(sensors.items()):
            if not cfg.active:
                continue
            state = sensor_states.setdefault(sensor_id, SensorState())

            env_air = simulate_env_air(now, cfg, state)
            env_ambient = simulate_env_ambient(now, cfg)

            payload = {
                "user_id": cfg.org_id,  # reusing user_id tag for org/worker id
                "device_id": cfg.sensor_id,
                "org_id": str(cfg.org_id),
                "model": cfg.model,
                # env_air
                **env_air,
                # env_ambient
                **env_ambient,
            }

            logger.debug("Sending payload for sensor %s: %s", sensor_id, payload)
            try:
                await post_biometric(payload)
            except Exception as e:
                logger.warning("Error sending payload for sensor %s: %s", sensor_id, e)

        await asyncio.sleep(SEND_INTERVAL_SECONDS)


background_task: Optional[asyncio.Task] = None


def start_background_loop() -> None:
    global background_task
    if background_task is None or background_task.done():
        loop = asyncio.get_event_loop()
        background_task = loop.create_task(sensor_loop())


# ---------------------------------------------------------------------------
# FastAPI app & API for managing sensors / baselines
# ---------------------------------------------------------------------------


class SensorCreateRequest(BaseModel):
    sensor_id: str  # numeric device_id string suggestion (for UI)
    name: Optional[str] = None
    org_id: int
    enterprise_name: str
    location_id: int
    location_name: str
    model: str = "IoT-Sim"
    active: bool = True
    work_start: time = time(9, 0)
    work_end: time = time(18, 0)
    env_air: EnvAirBaseline = EnvAirBaseline()
    env_ambient: EnvAmbientBaseline = EnvAmbientBaseline()


class SensorUpdateRequest(BaseModel):
    enterprise_name: Optional[str] = None
    location_id: Optional[int] = None
    location_name: Optional[str] = None
    site: Optional[str] = None
    zone: Optional[str] = None
    model: Optional[str] = None
    active: Optional[bool] = None
    work_start: Optional[time] = None
    work_end: Optional[time] = None
    env_air: Optional[EnvAirBaseline] = None
    env_ambient: Optional[EnvAmbientBaseline] = None


class LocationInfo(BaseModel):
    location_id: int
    location_name: str


class EnterpriseLocation(BaseModel):
    enterprise_id: int
    enterprise_name: str
    locations: List[LocationInfo]


app = FastAPI(title="IoT Sensor Simulator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    global db_pool
    db_pool = await asyncpg.create_pool(SIM_PG_DSN)
    await load_enterprise_cache()
    await init_default_sensors_from_cache()
    start_background_loop()


@app.on_event("shutdown")
async def on_shutdown():
    if background_task:
        background_task.cancel()
    await http_client.aclose()
    if db_pool:
        await db_pool.close()


@app.get("/", response_class=HTMLResponse)
async def index():
    # Minimal HTML + JS UI for managing sensors and baselines
    return HTMLResponse(
        """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>IoT Sensor Simulator</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 1.5rem; background: #0b1020; color: #f5f7ff; }
    h1 { margin-bottom: 0.5rem; }
    .card { background: #151a2e; padding: 1rem 1.5rem; border-radius: 8px; margin-bottom: 1rem; }
    label { display: block; margin-top: 0.4rem; font-size: 0.9rem; }
    input, select { width: 100%; padding: 0.3rem; margin-top: 0.15rem; border-radius: 4px; border: 1px solid #333955; background:#0f1325; color:#f5f7ff;}
    button { margin-top: 0.6rem; padding: 0.4rem 0.8rem; border-radius: 4px; border:none; cursor:pointer; background:#2563eb; color:#fff; }
    table { width:100%; border-collapse: collapse; margin-top:0.6rem; font-size:0.9rem;}
    th, td { border-bottom:1px solid #2a314a; padding:0.4rem; text-align:left;}
    th { background:#111827;}
    .badge { padding:0.1rem 0.4rem; border-radius:999px; font-size:0.75rem;}
    .badge.on { background:#16a34a33; color:#4ade80;}
    .badge.off { background:#b91c1c33; color:#fca5a5;}
  </style>
</head>
<body>
  <h1>IoT Sensor Simulator</h1>
  <p>Manage simulated ambient sensors (env_air / env_ambient) that send data to biometric-microservice every 5 seconds.</p>

  <div id="toast" class="toast" style="display:none;"></div>

  <div class="card">
    <h2>Existing Sensors</h2>
    <table id="sensor-table">
      <thead>
        <tr>
          <th>Device ID</th>
          <th>Name</th>
          <th>Enterprise</th>
          <th>Location</th>
          <th>Model</th>
          <th>Active</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>

  <div class="card">
    <h2>Create / Update Sensor</h2>
    <form id="sensor-form" onsubmit="return false;">
      <label>Device ID
        <input id="sensor_id" required />
      </label>
      <label>Name
        <input id="sensor_name" />
      </label>
      <label>Enterprise
        <select id="enterprise_select"></select>
      </label>
      <label>Location
        <select id="location_select"></select>
      </label>
      <label>Model
        <input id="model" value="IoT-Sim" />
      </label>
      <label>Active
        <select id="active">
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>

      <h3>Env Air Baselines</h3>
      <label>CO₂ empty (min-max)
        <input id="co2_empty" value="400-600" />
      </label>
      <label>CO₂ occupied (min-max)
        <input id="co2_occ" value="800-1500" />
      </label>
      <label>PM2.5 good (min-max)
        <input id="pm25_good" value="1-12" />
      </label>
      <label>PM2.5 spike (min-max)
        <input id="pm25_spike" value="40-80" />
      </label>

      <h3>Env Ambient Baselines</h3>
      <label>Noise work (min-max dB)
        <input id="noise_work" value="40-60" />
      </label>
      <label>Noise peaks (min-max dB)
        <input id="noise_peak" value="65-75" />
      </label>
      <label>Light work (min-max lux)
        <input id="light_work" value="300-600" />
      </label>
      <label>Light sunny (min-max lux)
        <input id="light_sunny" value="800-1000" />
      </label>

      <button onclick="saveSensor()">Save sensor</button>
    </form>
  </div>

  <script>
    let enterprises = [];

    function parseRange(str, defMin, defMax) {
      const parts = (str || '').split('-').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return [parts[0], parts[1]];
      }
      return [defMin, defMax];
    }

    async function loadEnterprises() {
      const res = await fetch('/api/enterprises');
      enterprises = await res.json();
      const entSel = document.getElementById('enterprise_select');
      entSel.innerHTML = '';
      enterprises.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.enterprise_id;
        opt.textContent = e.enterprise_name;
        entSel.appendChild(opt);
      });
      updateLocationOptions();
    }

    function updateLocationOptions() {
      const entId = parseInt(document.getElementById('enterprise_select').value);
      const locSel = document.getElementById('location_select');
      locSel.innerHTML = '';
      const ent = enterprises.find(e => e.enterprise_id === entId);
      if (!ent) return;
      ent.locations.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.location_id;
        opt.textContent = l.location_name;
        locSel.appendChild(opt);
      });
    }

    let sensorsCache = [];

    async function loadSensors() {
      const res = await fetch('/api/sensors');
      const data = await res.json();
      sensorsCache = data;
      const tbody = document.querySelector('#sensor-table tbody');
      tbody.innerHTML = '';
      data.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.sensor_id}</td>
          <td>${s.display_name}</td>
          <td>${s.enterprise_name}</td>
          <td>${s.location_name}</td>
          <td>${s.model}</td>
          <td><span class="badge ${s.active ? 'on' : 'off'}">${s.active ? 'ON' : 'OFF'}</span></td>
          <td>
            <button onclick="toggleSensor('${s.sensor_id}')">${s.active ? 'Disable' : 'Enable'}</button>
            <button onclick="deleteSensor('${s.sensor_id}')">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    let toastTimer = null;
    function showToast(msg) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.style.display = 'block';
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        el.style.display = 'none';
      }, 3000);
    }

    async function toggleSensor(id) {
      const res = await fetch('/api/sensors/' + encodeURIComponent(id) + '/toggle', { method: 'POST' });
      if (!res.ok) {
        alert('Error toggling sensor ' + id);
        return;
      }
      await loadSensors();
      showToast('Sensor ' + id + ' toggled');
    }

    async function deleteSensor(id) {
      if (!confirm('Delete sensor ' + id + '?')) return;
      const res = await fetch('/api/sensors/' + encodeURIComponent(id), { method: 'DELETE' });
      if (!res.ok) {
        alert('Error deleting sensor ' + id);
        return;
      }
      await loadSensors();
      showToast('Sensor ' + id + ' deleted');
    }

    async function suggestFreeId() {
      try {
        const res = await fetch('/api/next-device-id');
        if (!res.ok) throw new Error('next-device-id failed');
        const data = await res.json();
        document.getElementById('sensor_id').value = String(data.next_id);
      } catch (e) {
        // Fallback: compute from existing numeric sensor IDs
        let maxId = 0;
        sensorsCache.forEach(s => {
          const n = parseInt(s.sensor_id, 10);
          if (!isNaN(n) && n > maxId) maxId = n;
        });
        document.getElementById('sensor_id').value = String(maxId + 1);
      }
    }

    async function saveSensor() {
      const sid = document.getElementById('sensor_id').value.trim();
      if (!sid) return alert('Sensor ID required');
      if (!/^[0-9]+$/.test(sid)) {
        return alert('Sensor ID must be a numeric value (device_id).');
      }
      if (sensorsCache.some(s => String(s.sensor_id) === sid)) {
        return alert('A sensor with this ID already exists. Please choose another ID.');
      }
      const entId = parseInt(document.getElementById('enterprise_select').value);
      const ent = enterprises.find(e => e.enterprise_id === entId);
      const locId = parseInt(document.getElementById('location_select').value);
      const loc = ent.locations.find(l => l.location_id === locId);
      if (!ent || !loc) return alert('Invalid enterprise/location');

      const [co2eMin, co2eMax] = parseRange(document.getElementById('co2_empty').value, 400, 600);
      const [co2oMin, co2oMax] = parseRange(document.getElementById('co2_occ').value, 800, 1500);
      const [pmgMin, pmgMax] = parseRange(document.getElementById('pm25_good').value, 1, 12);
      const [pmsMin, pmsMax] = parseRange(document.getElementById('pm25_spike').value, 40, 80);
      const [nwMin, nwMax] = parseRange(document.getElementById('noise_work').value, 40, 60);
      const [npMin, npMax] = parseRange(document.getElementById('noise_peak').value, 65, 75);
      const [lwMin, lwMax] = parseRange(document.getElementById('light_work').value, 300, 600);
      const [lsMin, lsMax] = parseRange(document.getElementById('light_sunny').value, 800, 1000);

      const payload = {
        sensor_id: sid,
        name: document.getElementById('sensor_name').value.trim() || ('Device ' + sid),
        org_id: ent.enterprise_id,
        enterprise_name: ent.enterprise_name,
        location_id: loc.location_id,
        location_name: loc.location_name,
        model: document.getElementById('model').value || 'IoT-Sim',
        active: document.getElementById('active').value === 'true',
        env_air: {
          co2_empty_min: co2eMin,
          co2_empty_max: co2eMax,
          co2_occupied_min: co2oMin,
          co2_occupied_max: co2oMax,
          pm25_good_min: pmgMin,
          pm25_good_max: pmgMax,
          pm25_spike_min: pmsMin,
          pm25_spike_max: pmsMax
        },
        env_ambient: {
          noise_work_min: nwMin,
          noise_work_max: nwMax,
          noise_peak_min: npMin,
          noise_peak_max: npMax,
          light_work_min: lwMin,
          light_work_max: lwMax,
          light_sunny_min: lsMin,
          light_sunny_max: lsMax
        }
      };

      const res = await fetch('/api/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const txt = await res.text();
        alert('Error saving sensor: ' + txt);
        return;
      }
      await loadSensors();
      showToast('Sensor ' + sid + ' saved');
    }

    document.getElementById('enterprise_select').addEventListener('change', updateLocationOptions);

    loadEnterprises().then(async () => {
      await loadSensors();
      suggestFreeId();
    });
  </script>
</body>
</html>
        """
    )


@app.get("/api/enterprises", response_model=List[EnterpriseLocation])
async def get_enterprises():
    """
    Fetch enterprises + locations from DB (or cached copy loaded at startup).
    """
    if db_pool is None:
        return enterprise_cache
    await load_enterprise_cache()
    return enterprise_cache


@app.get("/api/sensors", response_model=List[SensorConfig])
async def list_sensors():
    return list(sensors.values())


@app.get("/api/next-device-id")
async def next_device_id():
    """
    Returns the next available numeric id_device from the devices table.
    This is used by the UI to suggest a numeric Sensor ID.
    """
    global db_pool
    if db_pool is None:
        raise HTTPException(status_code=500, detail="DB pool not initialised")

    async with db_pool.acquire() as conn:
        row = await conn.fetchrow("SELECT COALESCE(MAX(id_device), 0) + 1 AS next_id FROM devices;")
        return {"next_id": int(row["next_id"])}


@app.post("/api/sensors", response_model=SensorConfig)
async def create_or_update_sensor(req: SensorCreateRequest):
    # Validate that location belongs to enterprise using DB-backed mapping
    enterprises = await get_enterprises()
    for ent in enterprises:
        if ent.enterprise_id == req.org_id:
            if any(loc.location_id == req.location_id for loc in ent.locations):
                break
            raise HTTPException(status_code=400, detail="Location does not belong to enterprise")
    else:
        raise HTTPException(status_code=400, detail="Unknown enterprise")

    # Ensure we also have a backing row in the devices table so the simulator
    # uses real id_device values as sensor identifiers.
    if db_pool is None:
        raise HTTPException(status_code=500, detail="DB pool not initialised")

    async with db_pool.acquire() as conn:
        display_name = req.name or req.sensor_id
        row = await conn.fetchrow(
            """
            SELECT id_device
            FROM devices
            WHERE id_location = $1
              AND name = $2
              AND device_type = $3
            """,
            req.location_id,
            display_name,
            DEFAULT_DEVICE_TYPE,
        )
        if row:
            device_id = row["id_device"]
        else:
            row = await conn.fetchrow(
                """
                INSERT INTO devices (id_location, name, device_type, status)
                VALUES ($1, $2, $3, 'active')
                RETURNING id_device
                """,
                req.location_id,
                display_name,
                DEFAULT_DEVICE_TYPE,
            )
            device_id = row["id_device"]

    sensor_id = str(device_id)
    cfg = SensorConfig(
        sensor_id=sensor_id,
        display_name=display_name,
        org_id=req.org_id,
        enterprise_name=req.enterprise_name,
        location_id=req.location_id,
        location_name=req.location_name,
        model=req.model,
        active=req.active,
        work_start=req.work_start,
        work_end=req.work_end,
        env_air=req.env_air,
        env_ambient=req.env_ambient,
    )
    sensors[sensor_id] = cfg
    sensor_states.setdefault(sensor_id, SensorState())
    return cfg


@app.post("/api/sensors/{sensor_id}/toggle", response_model=SensorConfig)
async def toggle_sensor(sensor_id: str):
    if sensor_id not in sensors:
        raise HTTPException(status_code=404, detail="Sensor not found")
    cfg = sensors[sensor_id]
    cfg.active = not cfg.active
    sensors[sensor_id] = cfg

    # Persist status change in DB
    if db_pool is not None:
        async with db_pool.acquire() as conn:
            new_status = "active" if cfg.active else "inactive"
            await conn.execute(
                "UPDATE devices SET status = $1 WHERE id_device = $2",
                new_status,
                int(sensor_id),
            )

    return cfg


@app.delete("/api/sensors/{sensor_id}")
async def delete_sensor(sensor_id: str):
    if sensor_id not in sensors:
        raise HTTPException(status_code=404, detail="Sensor not found")
    sensors.pop(sensor_id, None)
    sensor_states.pop(sensor_id, None)

    # Mark as removed in DB
    if db_pool is not None:
        async with db_pool.acquire() as conn:
            await conn.execute(
                "UPDATE devices SET status = 'removed' WHERE id_device = $1",
                int(sensor_id),
            )

    return {"status": "deleted"}



