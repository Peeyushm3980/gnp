import React from 'react';
import { X, Clock, User, CheckCircle, MessageSquare } from 'lucide-react';
import api from '../api';

const TicketDetailView = ({ ticket, isOpen, onClose, onUpdate }) => {
  if (!isOpen || !ticket) return null;

  const handleResolve = async () => {
    try {
      // Assuming a PATCH endpoint exists to update status
      await api.patch(`/tickets/${ticket.id}`, { status: 'Resolved' });
      onUpdate();
      onClose();
    } catch (error) {
      alert("Resolution failed. Ensure backend PATCH route is active.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Slide-over Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">#{ticket.id}</span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">Ticket Details</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Ticket Info */}
          <section>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</label>
            <p className="text-lg font-semibold text-slate-800 leading-relaxed">{ticket.subject}</p>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <section>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</label>
              <div className="flex items-center gap-2 mt-1">
                <User size={16} className="text-slate-400" />
                <p className="text-sm font-medium">{ticket.client}</p>
              </div>
            </section>
            <section>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</label>
              <p className={`text-sm font-bold mt-1 ${ticket.priority === 'High' ? 'text-red-600' : 'text-orange-600'}`}>
                {ticket.priority}
              </p>
            </section>
          </div>

          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timeline</label>
            <div className="mt-3 space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                <div>
                  <p className="text-xs font-bold text-slate-700">Ticket Created</p>
                  <p className="text-[10px] text-slate-500">{new Date(ticket.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
          <button 
            onClick={handleResolve}
            className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} /> Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailView;