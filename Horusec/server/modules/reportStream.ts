import fs from 'node:fs';

export function streamRequestedFile(req: any) {
  return fs.createReadStream(req.params.file);
}
