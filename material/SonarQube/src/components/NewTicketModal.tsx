import { useState } from 'react';
import type { Customer, Ticket, TicketPriority } from '../types';
import { createTicket } from '../services/ticketService';

export function NewTicketModal({ customers, onClose, onCreate }: { customers: Customer[]; onClose: () => void; onCreate: (ticket: Ticket) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? 0);
  const [priority, setPriority] = useState<TicketPriority>('Media');
  const [category, setCategory] = useState('General');
  const [error, setError] = useState('');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 4 || description.trim().length < 8) { setError('Completá un asunto y una descripción más detallada.'); return; }
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) return;
    onCreate(createTicket({ title, description, customer, priority, category }));
  }

  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
    <div className="modal-heading"><div><h2>Nuevo ticket</h2><p>Registrá una nueva consulta de un cliente.</p></div><button type="button" className="icon-button" onClick={onClose}>×</button></div>
    <label>Cliente<select value={customerId} onChange={(e) => setCustomerId(Number(e.target.value))}>{customers.filter((c) => c.active).map((c) => <option value={c.id} key={c.id}>{c.name} · {c.company}</option>)}</select></label>
    <label>Asunto<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. No puedo acceder al panel" /></label>
    <label>Descripción<textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contanos qué está pasando…" /></label>
    <div className="form-grid"><label>Prioridad<select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}><option>Baja</option><option>Media</option><option>Alta</option><option>Urgente</option></select></label><label>Categoría<select value={category} onChange={(e) => setCategory(e.target.value)}><option>General</option><option>Usuarios</option><option>Reportes</option><option>Facturación</option><option>Rendimiento</option><option>Permisos</option></select></label></div>
    {error && <div className="form-error">{error}</div>}
    <div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary">Crear ticket</button></div>
  </form></div>;
}
