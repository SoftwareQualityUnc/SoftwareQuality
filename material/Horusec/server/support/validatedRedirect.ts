const ALLOWED = new Set(['/home', '/help', '/privacy']);

export function redirectToKnownPage(res: any, requested: string): void {
  const next = ALLOWED.has(requested) ? requested : '/home';
  res.redirect(next);
}
