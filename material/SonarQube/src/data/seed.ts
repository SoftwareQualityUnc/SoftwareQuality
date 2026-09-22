import type { Customer, Ticket } from '../types';

export const agents = ['Ana Torres', 'Bruno Díaz', 'Camila Ruiz', 'Diego Luna'];

export const seedCustomers: Customer[] = [
  { id: 1, name: 'Lucía Gómez', company: 'Nortech', email: 'lucia@nortech.test', plan: 'Enterprise', active: true, joinedAt: '2026-01-14' },
  { id: 2, name: 'Martín Salas', company: 'Mercurio Labs', email: 'martin@mercurio.test', plan: 'Business', active: true, joinedAt: '2026-02-03' },
  { id: 3, name: 'Valentina Acosta', company: 'Andes Retail', email: 'vale@andes.test', plan: 'Business', active: true, joinedAt: '2025-11-19' },
  { id: 4, name: 'Tomás Molina', company: 'Córdoba Cloud', email: 'tomas@cordobacloud.test', plan: 'Starter', active: true, joinedAt: '2026-05-07' },
  { id: 5, name: 'Sofía Pereyra', company: 'Aula Digital', email: 'sofia@aula.test', plan: 'Enterprise', active: false, joinedAt: '2025-08-21' }
];

export const seedTickets: Ticket[] = [
  {
    id: 1042,
    title: 'No puedo exportar el reporte mensual',
    description: 'Al descargar el reporte de agosto aparece una pantalla en blanco. Necesitamos enviarlo hoy a dirección.',
    customerId: 1,
    customerName: 'Lucía Gómez', customerEmail: 'lucia@nortech.test',
    priority: 'Urgente', status: 'En progreso', assignee: 'Ana Torres', category: 'Reportes',
    createdAt: '2026-09-17T09:10:00', updatedAt: '2026-09-17T12:35:00',
    comments: [
      { id: 1, author: 'Lucía Gómez', body: 'El archivo queda cargando y luego vuelve al inicio.', createdAt: '2026-09-17T09:12:00' },
      { id: 2, author: 'Ana Torres', body: 'Estamos revisando el generador del PDF. Te actualizo en breve.', createdAt: '2026-09-17T10:05:00' }
    ]
  },
  {
    id: 1041,
    title: 'Invitación de usuario no llega',
    description: 'Creamos dos usuarios nuevos pero ninguno recibió el correo de activación.',
    customerId: 2, customerName: 'Martín Salas', customerEmail: 'martin@mercurio.test',
    priority: 'Alta', status: 'Esperando cliente', assignee: 'Bruno Díaz', category: 'Usuarios',
    createdAt: '2026-09-16T15:30:00', updatedAt: '2026-09-17T08:20:00', comments: []
  },
  {
    id: 1040,
    title: 'Duda sobre permisos de supervisores',
    description: '¿Un supervisor puede editar tickets creados por otro equipo?',
    customerId: 3, customerName: 'Valentina Acosta', customerEmail: 'vale@andes.test',
    priority: 'Media', status: 'Nuevo', assignee: '', category: 'Permisos',
    createdAt: '2026-09-16T11:15:00', updatedAt: '2026-09-16T11:15:00', comments: []
  },
  {
    id: 1039,
    title: 'Dashboard lento al abrir filtros',
    description: 'Con más de 200 casos el panel tarda varios segundos al cambiar el rango de fechas.',
    customerId: 4, customerName: 'Tomás Molina', customerEmail: 'tomas@cordobacloud.test',
    priority: 'Alta', status: 'En progreso', assignee: 'Camila Ruiz', category: 'Rendimiento',
    createdAt: '2026-09-15T14:40:00', updatedAt: '2026-09-17T13:00:00', comments: []
  },
  {
    id: 1038,
    title: 'Cambiar razón social en las facturas',
    description: 'Necesitamos actualizar el nombre que aparece en los comprobantes.',
    customerId: 1, customerName: 'Lucía Gómez', customerEmail: 'lucia@nortech.test',
    priority: 'Baja', status: 'Resuelto', assignee: 'Diego Luna', category: 'Facturación',
    createdAt: '2026-09-12T10:00:00', updatedAt: '2026-09-14T16:25:00', comments: [], satisfaction: 5
  },
  {
    id: 1037,
    title: 'Error al guardar una regla automática',
    description: 'La regla funciona hasta que agregamos una segunda condición por categoría.',
    customerId: 3, customerName: 'Valentina Acosta', customerEmail: 'vale@andes.test',
    priority: 'Media', status: 'Resuelto', assignee: 'Ana Torres', category: 'Automatizaciones',
    createdAt: '2026-09-10T09:20:00', updatedAt: '2026-09-13T12:10:00', comments: [], satisfaction: 4
  }
];
