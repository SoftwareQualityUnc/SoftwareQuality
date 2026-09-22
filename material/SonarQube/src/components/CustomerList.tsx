import { useState } from 'react';
import type { Customer, Ticket } from '../types';
import { initials } from '../utils/format';

export function CustomerList({ customers, tickets }: { customers: Customer[]; tickets: Ticket[] }) {
  const [query, setQuery] = useState('');
  const filtered = customers.filter((customer) => customer.name.toLowerCase().includes(query.toLowerCase()) || customer.company.toLowerCase().includes(query.toLowerCase()) || customer.email.toLowerCase().includes(query.toLowerCase()));

  return <div className="card table-card">
    <div className="ticket-toolbar"><div className="search-box">⌕<input placeholder="Buscar cliente o empresa…" value={query} onChange={(e) => setQuery(e.target.value)} /></div></div>
    <div className="customer-grid">{filtered.map((customer) => {
      const customerTickets = tickets.filter((ticket) => ticket.customerId === customer.id);
      const open = customerTickets.filter((ticket) => ticket.status !== 'Resuelto').length;
      return <article className="customer-card" key={customer.id}><div className="customer-top"><div className="avatar large">{initials(customer.name)}</div><span className={`plan plan-${customer.plan.toLowerCase()}`}>{customer.plan}</span></div><h3>{customer.name}</h3><p>{customer.company}</p><a href={`mailto:${customer.email}`}>{customer.email}</a><div className="customer-metrics"><span><b>{customerTickets.length}</b> tickets</span><span><b>{open}</b> abiertos</span></div></article>;
    })}</div>
  </div>;
}
