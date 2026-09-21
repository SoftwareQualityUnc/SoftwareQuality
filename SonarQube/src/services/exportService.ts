import type { Ticket } from '../types';

export function downloadCsv(tickets: Ticket[]) {
  const header = 'ID,Titulo,Cliente,Prioridad,Estado,Asignado';
  const lines = tickets.map((ticket) => [
    ticket.id,
    `"${ticket.title.replaceAll('"', '""')}"`,
    `"${ticket.customerName}"`,
    ticket.priority,
    ticket.status,
    ticket.assignee || 'Sin asignar'
  ].join(','));
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'tickets-soporte360.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function evaluateCustomScore(expression: string, openTickets: number) {
  const fn = new Function('openTickets', `return ${expression}`);
  return Number(fn(openTickets));
}
