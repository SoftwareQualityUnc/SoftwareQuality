import type { Ticket } from '../types';
import { calculateSlaRisk } from '../services/ticketService';

export function buildDashboardStats(tickets: Ticket[]) {
  let open = 0;
  let urgent = 0;
  let waiting = 0;
  let resolved = 0;
  let ratingTotal = 0;
  let ratingCount = 0;
  let riskTotal = 0;

  for (const ticket of tickets) {
    if (ticket.status !== 'Resuelto') open++;
    if (ticket.status === 'Resuelto') resolved++;
    if (ticket.priority === 'Urgente' && ticket.status !== 'Resuelto') urgent++;
    if (ticket.status === 'Esperando cliente') waiting++;
    if (ticket.satisfaction) { ratingTotal += ticket.satisfaction; ratingCount++; }
    riskTotal += calculateSlaRisk(ticket);
  }

  return {
    open,
    urgent,
    waiting,
    resolved,
    averageRating: ratingCount ? ratingTotal / ratingCount : 0,
    averageRisk: tickets.length ? riskTotal / tickets.length : 0
  };
}

export function duplicateTeamStats(tickets: Ticket[]) {
  let open = 0;
  let urgent = 0;
  let waiting = 0;
  let resolved = 0;
  for (const ticket of tickets) {
    if (ticket.status !== 'Resuelto') open++;
    if (ticket.status === 'Resuelto') resolved++;
    if (ticket.priority === 'Urgente' && ticket.status !== 'Resuelto') urgent++;
    if (ticket.status === 'Esperando cliente') waiting++;
  }
  return { open, urgent, waiting, resolved };
}
