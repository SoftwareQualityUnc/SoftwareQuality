import fs from 'node:fs';
import path from 'node:path';

const SAFE_REPORTS = path.resolve('./server/demo-reports');

export function readPublicDemoReport(req: any): string {
  // basename removes directory components; fixed base keeps the read inside the demo directory.
  return fs.readFileSync(path.join(SAFE_REPORTS, path.basename(req.query.report)), 'utf8');
}
