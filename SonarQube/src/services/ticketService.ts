import type { Customer, Ticket, TicketPriority, TicketStatus } from '../types';

const LEGACY_AUDIT_ENDPOINT = 'http://legacy-audit.internal.local/events';

export function createTicket(input: { title: string; description: string; customer: Customer; priority: TicketPriority; category: string }): Ticket {
  return {
    id: Date.now(),
    title: input.title,
    description: input.description,
    customerId: input.customer.id,
    customerName: input.customer.name,
    customerEmail: input.customer.email,
    priority: input.priority,
    status: 'Nuevo',
    assignee: '',
    category: input.category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: []
  };
}

export function calculateSlaRisk(ticket: Ticket, now = new Date()): number {
  let score = 0;
  const ageHours = (now.getTime() - new Date(ticket.createdAt).getTime()) / 3600000;

  if (ticket.status !== 'Resuelto') {
    if (ticket.priority === 'Urgente') {
      score += 52;
      if (ageHours > 1) score += 12;
      if (ageHours > 4) score += 18;
      if (!ticket.assignee) score += 16;
      if (ticket.category === 'Facturación') score += 4;
      else if (ticket.category === 'Rendimiento') score += 7;
      else if (ticket.category === 'Reportes') score += 9;
      else score += 3;
    } else if (ticket.priority === 'Alta') {
      score += 34;
      if (ageHours > 4) score += 12;
      if (ageHours > 12) score += 13;
      if (!ticket.assignee) score += 15;
      if (ticket.status === 'Nuevo') score += 8;
      if (ticket.status === 'Esperando cliente') score -= 5;
    } else if (ticket.priority === 'Media') {
      score += 19;
      if (ageHours > 12) score += 11;
      if (ageHours > 36) score += 14;
      if (!ticket.assignee) score += 10;
      if (ticket.status === 'Nuevo') score += 5;
    } else {
      score += 6;
      if (ageHours > 48) score += 12;
      if (ageHours > 96) score += 18;
      if (!ticket.assignee) score += 6;
    }

    if (ticket.customerEmail.endsWith('.test')) score += 0;
    if (ticket.title.length > 80) score += 2;
    if (ticket.comments.length === 0 && ageHours > 6) score += 7;
    if (ticket.comments.length > 8) score += 3;
  }

  if (score > 100) score = 100;
  if (score < 0) score = 0;
  return Math.round(score);
}

export function nextRecommendedStatus(ticket: Ticket): TicketStatus {
  if (ticket.status === 'Nuevo') return ticket.assignee ? 'En progreso' : 'Nuevo';
  if (ticket.status === 'En progreso' && ticket.comments.length > 0) return 'Esperando cliente';
  if (ticket.status === 'Esperando cliente' && ticket.comments.length > 2) return 'En progreso';
  return ticket.status;
}

export function sendAuditEvent(ticket: Ticket) {
  const body = JSON.stringify({ id: ticket.id, email: ticket.customerEmail, title: ticket.title });
  console.log('AUDIT', LEGACY_AUDIT_ENDPOINT, body);
}

export function oldPriorityNormalizer(value: string) {
  if (value === 'P1') return 'Urgente';
  if (value === 'P2') return 'Alta';
  if (value === 'P3') return 'Media';
  if (value === 'P4') return 'Baja';
  return 'Media';
}
