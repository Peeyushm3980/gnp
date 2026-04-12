import React, { useState } from 'react';
import { X, CheckCircle, CheckCircle2, User, MessageSquare, Clock, Filter, Plus, ArrowRight } from 'lucide-react';
import api from '../api';

const TicketDetailView = ({ ticket, isOpen, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !ticket) return null;

  const handleResolve = async () => {
    setLoading(true);
    try {
      // 1. Update the database
      await api.patch(`/tickets/${ticket.id}`, { status: 'Resolved' });
      
      // 2. Trigger the refresh in the parent (SupportTickets.jsx)
      if (onUpdate) await onUpdate(); 
      
      // 3. Close the slide-over
      onClose();
    } catch (error) {
      console.error("Resolution failed:", error);
      alert("Could not update ticket status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Slide-over Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded font-mono">#{ticket.id}</span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {ticket.status || 'Open'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">Ticket Details</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Ticket Info */}
          <section>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject / Issue</label>
            <p className="text-lg font-semibold text-slate-800 leading-relaxed mt-1">{ticket.subject}</p>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <section>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Name</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                   <User size={16} />
                </div>
                <p className="text-sm font-bold text-slate-700">{ticket.client}</p>
              </div>
            </section>
            <section>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</label>
              <div className={`text-sm font-bold mt-2 flex items-center gap-1 ${
                ticket.priority === 'High' ? 'text-red-600' : 'text-orange-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${ticket.priority === 'High' ? 'bg-red-600' : 'bg-orange-600'}`} />
                {ticket.priority}
              </div>
            </section>
          </div>

          {/* Timeline Section */}
          <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Audit Trail</label>
            <div className="space-y-6 relative">
              {/* Vertical Line */}
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-200" />
              
              <div className="flex gap-4 relative">
                <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white mt-1" />
                <div>
                  <p className="text-xs font-bold text-slate-700">Ticket Created</p>
                  <p className="text-[10px] text-slate-500">{new Date(ticket.created_at).toLocaleString()}</p>
                </div>
              </div>

              {ticket.status === 'Resolved' && (
                <div className="flex gap-4 relative">
                  <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-white mt-1" />
                  <div>
                    <p className="text-xs font-bold text-green-700">Issue Resolved</p>
                    <p className="text-[10px] text-slate-500">Status updated by Staff</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <button 
            onClick={handleResolve}
            disabled={loading || ticket.status === 'Resolved'}
            className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 ${
              ticket.status === 'Resolved' 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : ticket.status === 'Resolved' ? (
              <><CheckCircle2 size={18} /> Resolution Complete</>
            ) : (
              <><CheckCircle size={18} /> Mark as Resolved</>
            )}
          </button>
          {ticket.status === 'Resolved' && (
             <p className="text-center text-[10px] text-slate-400 mt-3 font-medium italic">
                This ticket is closed and archived in the ERP database.
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailView;