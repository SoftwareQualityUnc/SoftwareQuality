import fs from 'node:fs';

export function readRequestedReport(req: any): string {
  return fs.readFileSync(req.query.report, 'utf8');
}
