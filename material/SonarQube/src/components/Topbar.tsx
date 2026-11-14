export function Topbar({ title, subtitle, onNewTicket }: { title: string; subtitle: string; onNewTicket: () => void }) {
  return (
    <header className="topbar">
      <div><h1>{title}</h1><p>{subtitle}</p></div>
      <div className="topbar-actions"><button className="icon-button" aria-label="Notificaciones">♢<span className="notification-dot" /></button><button className="primary" onClick={onNewTicket}>＋ Nuevo ticket</button></div>
    </header>
  );
}
