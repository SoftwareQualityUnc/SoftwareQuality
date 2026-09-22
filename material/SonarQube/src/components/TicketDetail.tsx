import { useState } from 'react';
import { agents } from '../data/seed';
import type { Ticket, TicketStatus } from '../types';
import { calculateSlaRisk, sendAuditEvent } from '../services/ticketService';
import { formatRelativeDate } from '../utils/format';

export function TicketDetail({ ticket, onBack, onUpdate }: { ticket: Ticket; onBack: () => void; onUpdate: (ticket: Ticket) => void }) {
  const [comment, setComment] = useState('');
  const risk = calculateSlaRisk(ticket);

  function updateStatus(status: TicketStatus) {
    const updated = { ...ticket, status, updatedAt: new Date().toISOString() };
    sendAuditEvent(updated);
    onUpdate(updated);
  }

  function addComment() {
    if (!comment.trim()) return;
    const updated = { ...ticket, comments: [...ticket.comments, { id: Date.now(), author: 'Mariana López', body: comment, createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() };
    setComment('');
    onUpdate(updated);
  }

  return <div className="ticket-detail-layout">
    <section className="card detail-main">
      <button className="text-button back-button" onClick={onBack}>← Volver a tickets</button>
      <div className="detail-title"><div><div className="meta-line">Ticket #{ticket.id} · {ticket.category}</div><h2>{ticket.title}</h2><div className="detail-badges"><span className={`badge priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span><span className="status-badge">{ticket.status}</span></div></div><div className={`sla-box ${risk > 70 ? 'sla-danger' : risk > 40 ? 'sla-warning' : ''}`}><strong>{risk}%</strong><span>riesgo SLA</span></div></div>
      <div className="message-block"><div className="avatar">{ticket.customerName[0]}</div><div className="message-content"><div><strong>{ticket.customerName}</strong><small>{formatRelativeDate(ticket.createdAt)}</small></div><p>{ticket.description}</p></div></div>
      <h3 className="conversation-title">Conversación</h3>
      <div className="conversation">{ticket.comments.length === 0 && <div className="empty-thread">Todavía no hay mensajes en este ticket.</div>}{ticket.comments.map((item) => <div className="message-block compact" key={item.id}><div className="avatar">{item.author[0]}</div><div className="message-content"><div><strong>{item.author}</strong><small>{formatRelativeDate(item.createdAt)}</small></div><p dangerouslySetInnerHTML={{ __html: item.body }} /></div></div>)}</div>
      {ticket.status !== 'Resuelto' && <div className="reply-box"><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribí una respuesta…" /><div><small>Podés usar HTML básico en la respuesta.</small><button className="primary" onClick={addComment}>Enviar respuesta</button></div></div>}
    </section>
    <aside className="card detail-side">
      <h3>Detalles</h3>
      <label>Estado<select value={ticket.status} onChange={(e) => updateStatus(e.target.value as TicketStatus)}><option>Nuevo</option><option>En progreso</option><option>Esperando cliente</option><option>Resuelto</option></select></label>
      <label>Asignado a<select value={ticket.assignee} onChange={(e) => onUpdate({ ...ticket, assignee: e.target.value, updatedAt: new Date().toISOString() })}><option value="">Sin asignar</option>{agents.map((agent) => <option key={agent}>{agent}</option>)}</select></label>
      <div className="detail-info"><span>Cliente<strong>{ticket.customerName}</strong></span><span>Correo<strong>{ticket.customerEmail}</strong></span><span>Categoría<strong>{ticket.category}</strong></span><span>Última actividad<strong>{formatRelativeDate(ticket.updatedAt)}</strong></span></div>
      <button className="secondary full" onClick={() => window.location.href = `mailto:${ticket.customerEmail}`}>Enviar correo</button>
    </aside>
  </div>;
}
