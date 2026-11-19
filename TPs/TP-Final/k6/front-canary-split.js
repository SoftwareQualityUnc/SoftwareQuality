import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const TARGET_URL = __ENV.TARGET_URL || 'http://terrasense.local/';
const CANARY_VERSION = __ENV.CANARY_VERSION || '1.1.0';
const VUS = Number(__ENV.VUS || 20);
const DURATION = __ENV.DURATION || '3m';

const visitasCanary = new Counter('visitas_canary');
const visitasStable = new Counter('visitas_stable');
const visitasSinVersion = new Counter('visitas_sin_version');
const latCanary = new Trend('lat_canary', true);
const latStable = new Trend('lat_stable', true);

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    lat_canary: ['p(95)<300'],
  },
};

export default function () {
  const params = {};
  if (__ENV.FORCE_CANARY === 'header') {
    params.headers = { 'X-Canary': 'always' };
  } else if (__ENV.FORCE_CANARY === 'cookie') {
    params.headers = { Cookie: 'canary=always' };
  }

  const res = http.get(TARGET_URL, params);
  const version = res.headers['X-App-Version'] || res.headers['x-app-version'];

  if (version === CANARY_VERSION) {
    visitasCanary.add(1);
    latCanary.add(res.timings.duration);
  } else if (version) {
    visitasStable.add(1);
    latStable.add(res.timings.duration);
  } else {
    visitasSinVersion.add(1);
  }

  check(res, {
    'status 200': (r) => r.status === 200,
    'header X-App-Version presente': () => Boolean(version),
  });

  sleep(1);
}
