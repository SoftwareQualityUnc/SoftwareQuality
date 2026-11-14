import { useMemo, useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar, type View } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { TicketList } from './components/TicketList';
import { CustomerList } from './components/CustomerList';
import { NewTicketModal } from './components/NewTicketModal';
import { TicketDetail } from './components/TicketDetail';
import { logout, restoreSession } from './services/authService';
import { loadCustomers, loadTickets, saveTickets } from './services/storageService';
import type { Ticket, User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(() => restoreSession());
  const [view, setView] = useState<View>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  const [customers] = useState(() => loadCustomers());
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const selectedTicket = useMemo(() => tickets.find((ticket) => ticket.id === selectedTicketId) ?? null, [tickets, selectedTicketId]);

  if (!user) return <LoginScreen onLogin={setUser} />;

  function updateTicket(updated: Ticket) {
    const next = tickets.map((ticket) => ticket.id === updated.id ? updated : ticket);
    setTickets(next);
    saveTickets(next);
  }

  function create(ticket: Ticket) {
    const next = [ticket, ...tickets];
    setTickets(next);
    saveTickets(next);
    setShowNewTicket(false);
    setSelectedTicketId(ticket.id);
    setView('tickets');
  }

  function openTicket(id: number) {
    setSelectedTicketId(id);
    setView('tickets');
  }

  const title = view === 'dashboard' ? 'Buen día, Mariana' : view === 'tickets' ? 'Tickets' : 'Clientes';
  const subtitle = view === 'dashboard' ? 'Este es el estado de tu bandeja de soporte.' : view === 'tickets' ? 'Gestioná consultas, prioridades y responsables.' : 'Información y actividad de tus cuentas.';

  return <div className="app-shell">
    <Sidebar view={view} onView={(next) => { setView(next); setSelectedTicketId(null); }} user={user} onLogout={() => { logout(); setUser(null); }} />
    <main className="workspace">
      <Topbar title={title} subtitle={subtitle} onNewTicket={() => setShowNewTicket(true)} />
      {view === 'dashboard' && <Dashboard tickets={tickets} onOpenTicket={openTicket} onViewTickets={() => setView('tickets')} />}
      {view === 'tickets' && !selectedTicket && <TicketList tickets={tickets} onOpenTicket={openTicket} />}
      {view === 'tickets' && selectedTicket && <TicketDetail ticket={selectedTicket} onBack={() => setSelectedTicketId(null)} onUpdate={updateTicket} />}
      {view === 'customers' && <CustomerList customers={customers} tickets={tickets} />}
    </main>
    {showNewTicket && <NewTicketModal customers={customers} onClose={() => setShowNewTicket(false)} onCreate={create} />}
  </div>;
}
