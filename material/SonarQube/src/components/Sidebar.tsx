import type { User } from '../types';

export type View = 'dashboard' | 'tickets' | 'customers';

export function Sidebar({ view, onView, user, onLogout }: { view: View; onView: (view: View) => void; user: User; onLogout: () => void }) {
  return (
    <aside className="sidebar">
      <div className="logo-row"><span className="logo-mark">S</span><strong>Soporte360</strong></div>
      <nav>
        <button className={view === 'dashboard' ? 'active' : ''} onClick={() => onView('dashboard')}><span>⌂</span> Dashboard</button>
        <button className={view === 'tickets' ? 'active' : ''} onClick={() => onView('tickets')}><span>▣</span> Tickets</button>
        <button className={view === 'customers' ? 'active' : ''} onClick={() => onView('customers')}><span>◎</span> Clientes</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="agent-card"><div className="avatar">ML</div><div><strong>{user.name}</strong><small>{user.role}</small></div></div>
        <button className="logout-button" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </aside>
  );
}
