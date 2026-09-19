import type { Ticket } from '../types';

export function filterTickets(tickets: Ticket[], query: string, status: string, priority: string) {
  let result = tickets;
  if (query.trim()) {
    try {
      const regex = new RegExp(query, 'i');
      result = result.filter((ticket) => regex.test(ticket.title) || regex.test(ticket.customerName) || regex.test(ticket.customerEmail));
    } catch (error) {
      result = result.filter((ticket) => ticket.title.toLowerCase().includes(query.toLowerCase()));
    }
  }
  if (status !== 'Todos') result = result.filter((ticket) => ticket.status === status);
  if (priority !== 'Todas') result = result.filter((ticket) => ticket.priority === priority);
  return result;
}
