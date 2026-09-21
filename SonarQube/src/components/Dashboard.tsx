import type { Ticket } from '../types';
import { buildDashboardStats } from '../utils/dashboard';
import { calculateSlaRisk } from '../services/ticketService';
import { formatRelativeDate } from '../utils/format';

export function Dashboard({ tickets, onOpenTicket, onViewTickets }: { tickets: Ticket[]; onOpenTicket: (id: number) => void; onViewTickets: () => void }) {
  const stats = buildDashboardStats(tickets);
  const active = tickets.filter((ticket) => ticket.status !== 'Resuelto').sort((a, b) => calculateSlaRisk(b) - calculateSlaRisk(a));
  const recent = [...tickets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  return (
    <div className="view-stack">
      <section className="stats-grid">
        <Stat label="Tickets abiertos" value={stats.open} detail={`${stats.waiting} esperando cliente`} symbol="▣" />
        <Stat label="Casos urgentes" value={stats.urgent} detail="Requieren seguimiento" symbol="!" accent />
        <Stat label="Resueltos" value={stats.resolved} detail="En el período demo" symbol="✓" />
        <Stat label="Satisfacción" value={stats.averageRating ? stats.averageRating.toFixed(1) : '—'} detail="sobre 5 puntos" symbol="★" />
      </section>

      <section className="dashboard-grid">
        <div className="card priority-card">
          <div className="card-heading"><div><h2>Atención prioritaria</h2><p>Ordenado por riesgo de incumplir el SLA.</p></div><button className="text-button" onClick={onViewTickets}>Ver todos</button></div>
          <div className="priority-list">
            {active.slice(0, 4).map((ticket) => {
              const risk = calculateSlaRisk(ticket);
              return <button className="priority-row" onClick={() => onOpenTicket(ticket.id)} key={ticket.id}>
                <span className={`priority-dot priority-${ticket.priority.toLowerCase()}`} />
                <span className="grow"><strong>{ticket.title}</strong><small>#{ticket.id} · {ticket.customerName} · {formatRelativeDate(ticket.updatedAt)}</small></span>
                <span className="risk"><b>{risk}%</b><small>riesgo SLA</small></span>
              </button>;
            })}
          </div>
        </div>

        <div className="card activity-card">
          <div className="card-heading"><div><h2>Actividad reciente</h2><p>Últimos movimientos de la bandeja.</p></div></div>
          <div className="activity-list">
            {recent.map((ticket) => <button key={ticket.id} onClick={() => onOpenTicket(ticket.id)} className="activity-row"><span className="mini-avatar">{ticket.customerName[0]}</span><span><strong>{ticket.customerName}</strong><small>{ticket.status === 'Resuelto' ? 'Caso resuelto' : `Actualizó “${ticket.title}”`}</small><em>{formatRelativeDate(ticket.updatedAt)}</em></span></button>)}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, detail, symbol, accent = false }: { label: string; value: string | number; detail: string; symbol: string; accent?: boolean }) {
  return <div className={`stat-card ${accent ? 'stat-accent' : ''}`}><div className="stat-icon">{symbol}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}
