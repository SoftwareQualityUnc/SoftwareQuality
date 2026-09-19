export type TicketStatus = 'Nuevo' | 'En progreso' | 'Esperando cliente' | 'Resuelto';
export type TicketPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';

export type Ticket = {
  id: number;
  title: string;
  description: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  comments: TicketComment[];
  satisfaction?: number;
};

export type TicketComment = {
  id: number;
  author: string;
  body: string;
  createdAt: string;
};

export type Customer = {
  id: number;
  name: string;
  company: string;
  email: string;
  plan: 'Starter' | 'Business' | 'Enterprise';
  active: boolean;
  joinedAt: string;
};

export type User = {
  name: string;
  email: string;
  role: string;
};
