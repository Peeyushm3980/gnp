import React, { useState, useEffect } from 'react';
import { X, CheckCircle, CheckCircle2, User, MessageSquare, Clock, Filter, Plus, ArrowRight, Trash2 } from 'lucide-react';
import api from '../api';
import NewTicketModal from './NewTicketModal';
import TicketDetailView from './TicketDetailView';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // States for handling the "Open Ticket" Slide-over
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketAdded = (newTicket) => {
    setTickets([newTicket, ...tickets]);
  };

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Delete this support ticket permanently?")) return;

    try {
      const response = await api.delete(`/support/tickets/${ticketId}`);
      
      if (response.status === 200) {
        fetchTickets(); 
      }
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      alert("Error removing ticket.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Service Tickets</h1>
          <p className="text-slate-500 text-sm mt-1">Manage client queries and resolution tracking</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:opacity-90 transition-all text-sm"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={18} /> New Ticket
        </button>
      </div>

      {/* MODALS & SLIDE-OVERS */}
      <NewTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTicketAdded={handleTicketAdded} 
      />

      <TicketDetailView 
        ticket={selectedTicket} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)}
        onUpdate={fetchTickets}
      />
      
      {/* MAIN CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mb-4"></div>
          <p className="font-medium">Loading queries...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center p-20 bg-[var(--bg-main)] rounded-3xl border border-dashed border-[var(--border-color)]">
          <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No active support tickets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            /* Added 'relative' and 'bg-[var(--bg-card)]' for theme visibility */
            <div 
              key={ticket.id} 
              className="relative bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm group hover:shadow-md transition-all"
            >
              {/* VISIBLE DELETE BUTTON - Top Right of Card */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTicket(ticket.id);
                }}
                className="absolute top-4 right-4 p-2.5 text-red-400 hover:text-red-600 bg-red-50/50 hover:bg-red-100 rounded-xl transition-all z-10 border border-red-100/50"
                title="Delete Ticket"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex justify-between items-start mb-4 pr-8">
                <span className="text-[10px] font-bold bg-[var(--primary-light)] text-[var(--primary)] px-2 py-1 rounded-md tracking-widest uppercase font-mono border border-[var(--border-color)]">
                  ID-{ticket.id}
                </span>
                
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide transition-colors duration-300 ${
                  ticket.status?.toLowerCase() === 'resolved'
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {ticket.status || 'Open'}
                </span>
              </div>

              <h3 className={`text-lg font-bold mb-1 transition-colors ${ticket.status === 'Resolved' ? 'text-slate-400' : 'text-[var(--text-main)]'}`}>
                {ticket.subject}
              </h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">{ticket.client}</p>
              
              <div className="flex justify-between items-center border-t border-[var(--border-color)] pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Clock size={14} /> 
                  {new Date(ticket.created_at).toLocaleDateString()}
                </div>
                
                <button 
                  onClick={() => handleOpenTicket(ticket)}
                  className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] bg-[var(--primary-light)] hover:opacity-80 px-4 py-2 rounded-lg transition-colors"
                >
                  Open <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportTickets;