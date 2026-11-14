import { useMemo, useState } from 'react';
import type { Ticket } from '../types';
import { filterTickets } from '../utils/search';
import { formatRelativeDate, truncate } from '../utils/format';
import { downloadCsv } from '../services/exportService';

export function TicketList({ tickets, onOpenTicket }: { tickets: Ticket[]; onOpenTicket: (id: number) => void }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Todos');
  const [priority, setPriority] = useState('Todas');
  const filtered = useMemo(() => filterTickets(tickets, query, status, priority), [tickets, query, status, priority]);

  return <div className="card table-card">
    <div className="ticket-toolbar">
      <div className="search-box">⌕<input placeholder="Buscar por asunto, cliente o correo…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}><option>Todos</option><option>Nuevo</option><option>En progreso</option><option>Esperando cliente</option><option>Resuelto</option></select>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}><option>Todas</option><option>Baja</option><option>Media</option><option>Alta</option><option>Urgente</option></select>
      <button className="secondary" onClick={() => downloadCsv(filtered)}>⇩ Exportar</button>
    </div>
    <div className="table-responsive"><table><thead><tr><th>Ticket</th><th>Cliente</th><th>Prioridad</th><th>Estado</th><th>Asignado</th><th>Actualizado</th></tr></thead><tbody>
      {filtered.map((ticket) => <tr key={ticket.id} onClick={() => onOpenTicket(ticket.id)}><td><strong>{ticket.title}</strong><small>#{ticket.id} · {truncate(ticket.description, 62)}</small></td><td><strong>{ticket.customerName}</strong><small>{ticket.customerEmail}</small></td><td><span className={`badge priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></td><td><span className="status-badge">{ticket.status}</span></td><td>{ticket.assignee || 'Sin asignar'}</td><td>{formatRelativeDate(ticket.updatedAt)}</td></tr>)}
    </tbody></table></div>
    {!filtered.length && <div className="empty-state">No encontramos tickets con esos filtros.</div>}
  </div>;
}
