export function continueAfterLogin(res: any, next: string): void {
  res.redirect(next);
}
