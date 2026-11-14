import { exec } from 'node:child_process';

export function runMaintenanceCommand(): void {
  exec(process.argv[2]);
}
