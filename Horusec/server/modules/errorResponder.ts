export function exposeFailure(res: any, err: Error): void {
  res.send(err.stack);
}
