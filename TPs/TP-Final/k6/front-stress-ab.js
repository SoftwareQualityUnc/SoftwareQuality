import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.TARGET_URL || 'http://terrasense.local';
const CANARY_VERSION = __ENV.CANARY_VERSION || '1.1.0';

const visitasCanary = new Counter('visitas_canary');
const visitasStable = new Counter('visitas_stable');
const errCanary = new Rate('err_canary');
const errStable = new Rate('err_stable');
const latCanary = new Trend('lat_canary', true);
const latStable = new Trend('lat_stable', true);
const bytesCanary = new Counter('bytes_canary');
const bytesStable = new Counter('bytes_stable');

export const options = {
  scenarios: {
    stress_ab: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 50 },
        { duration: '30s', target: 150 },
        { duration: '30s', target: 300 },
        { duration: '30s', target: 500 },
        { duration: '20s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    err_canary: ['rate<0.01'],
    err_stable: ['rate<0.01'],
    lat_canary: ['p(95)<300'],
    lat_stable: ['p(95)<300'],
  },
};

export default function () {
  const resHtml = http.get(`${BASE_URL}/`, {
    tags: { asset: 'html' },
  });

  const version = resHtml.headers['X-App-Version'] || resHtml.headers['x-app-version'];
  const jsMatch = resHtml.body && resHtml.body.match(/src="(\/assets\/index-[^"]+\.js)"/);
  const jsPath = jsMatch ? jsMatch[1] : null;

  let resJs = null;
  if (jsPath) {
    resJs = http.get(`${BASE_URL}${jsPath}`, {
      tags: { asset: 'js' },
    });
  }

  const totalDuration = resHtml.timings.duration + (resJs ? resJs.timings.duration : 0);
  const totalBytes =
    (resHtml.body ? resHtml.body.length : 0) + (resJs && resJs.body ? resJs.body.length : 0);
  const failed =
    resHtml.status !== 200 ||
    !resJs ||
    resJs.status !== 200 ||
    (resJs.headers['Content-Type'] || '').includes('text/html');

  if (version === CANARY_VERSION) {
    visitasCanary.add(1);
    latCanary.add(totalDuration);
    errCanary.add(failed);
    bytesCanary.add(totalBytes);
  } else if (version) {
    visitasStable.add(1);
    latStable.add(totalDuration);
    errStable.add(failed);
    bytesStable.add(totalBytes);
  }

  check(resHtml, {
    'HTML status 200': (r) => r.status === 200,
    'bundle JS encontrado': () => Boolean(jsPath),
    'bundle JS status 200 y no HTML': () => Boolean(resJs && resJs.status === 200 && !(resJs.headers['Content-Type'] || '').includes('text/html')),
  });

  sleep(0.1);
}
