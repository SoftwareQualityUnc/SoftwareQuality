export function renderProfile(req: any, res: any): void {
  res.render('profile', req.body);
}
