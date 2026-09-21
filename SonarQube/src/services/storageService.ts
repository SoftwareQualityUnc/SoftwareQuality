import { seedCustomers, seedTickets } from '../data/seed';
import type { Customer, Ticket } from '../types';

const TICKET_KEY = 'support360_tickets';
const CUSTOMER_KEY = 'support360_customers';

export function loadTickets(): Ticket[] {
  const raw = localStorage.getItem(TICKET_KEY);
  if (!raw) return seedTickets;
  try { return JSON.parse(raw); } catch { return seedTickets; }
}

export function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(TICKET_KEY, JSON.stringify(tickets));
}

export function loadCustomers(): Customer[] {
  const raw = localStorage.getItem(CUSTOMER_KEY);
  if (!raw) return seedCustomers;
  try { return JSON.parse(raw); } catch { return seedCustomers; }
}

export function saveCustomers(customers: Customer[]) {
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customers));
}

export function resetDemoData() {
  localStorage.removeItem(TICKET_KEY);
  localStorage.removeItem(CUSTOMER_KEY);
}
