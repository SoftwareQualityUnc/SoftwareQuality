import { browser } from 'k6/browser';
import { check } from 'k6';

const TARGET_URL = __ENV.TARGET_URL || 'http://terrasense.local/';
const OUT_DIR = __ENV.OUT_DIR || 'evidencias/capturas';

export const options = {
  scenarios: {
    visitas: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: Number(__ENV.ITERATIONS || 20),
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
  },
};

export default async function () {
  const page = await browser.newPage();
  const consoleErrors = [];
  const httpErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('response', (res) => {
    if (res.url().startsWith('http://terrasense.local') && res.status() >= 400) {
      httpErrors.push(`${res.status()} ${res.url()}`);
    }
  });

  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('#root', { timeout: 10000 });
    await page.waitForTimeout(400);

    const info = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="app-version"]');
      const banner = document.querySelector('.canary-banner');
      const rootHtml = document.querySelector('#root')?.innerHTML?.length || 0;
      return {
        version: meta ? meta.content : 'sin-version',
        hasBanner: Boolean(banner),
        rootHtml,
      };
    });

    const iterPadded = String(__ITER + 1).padStart(2, '0');
    const screenshotPath = `${OUT_DIR}/visita-${iterPadded}-${info.version}.png`;
    await page.screenshot({ path: screenshotPath });

    console.log(
      `visita ${iterPadded}: version=${info.version} banner=${info.hasBanner} ` +
        `rootBytes=${info.rootHtml} consoleErrors=${consoleErrors.length} httpErrors=${httpErrors.length}`
    );
    if (httpErrors.length > 0) {
      console.log(`  httpErrors: ${httpErrors.join(', ')}`);
    }

    check(info, {
      'pagina renderizada (root no vacio)': (d) => d.rootHtml > 0,
      'sin errores HTTP >=400 en assets': () => httpErrors.length === 0,
    });
  } finally {
    await page.close();
  }
}
