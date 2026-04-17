import React, { useState } from 'react';
import { X, User, Shield, Clock, AlertCircle, CheckCircle2, CheckCircle } from 'lucide-react';
import api from '../api';

const TicketDetailView = ({ ticket, isOpen, onClose, onUpdate, availableStaff }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !ticket) return null;

  const handleAuditUpdate = async (payload) => {
    setLoading(true);
    try {
      await api.patch(`/tickets/${ticket.id}`, payload);
      if (onUpdate) await onUpdate(); // This now updates the parent AND the selectedTicket
    } catch (error) {
      console.error("Update failed:", error);
      alert("Audit update failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Hold': 'bg-amber-100 text-amber-700 border-amber-200',
      'Pending': 'bg-blue-100 text-blue-700 border-blue-200',
      'Cancel': 'bg-red-100 text-red-700 border-red-200',
      'Open': 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return map[status] || map['Open'];
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Slide-over Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-900">Audit Detail</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ticket #{ticket.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Main Info Section */}
          <section>
            <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4 ${getStatusBadge(ticket.status)}`}>
              {ticket.status}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{ticket.subject}</h1>
            <div className="flex items-center gap-2 text-slate-500 font-medium italic">
              <AlertCircle size={16} />
              <span>Priority: {ticket.priority}</span>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Audit Controls Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Status Change Grid */}
            <section>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Modify Workflow Status</label>
              <div className="grid grid-cols-3 gap-2">
                {['Open', 'Pending', 'Hold', 'Resolved', 'Cancel'].map((s) => (
                  <button
                    key={s}
                    disabled={loading}
                    onClick={() => handleAuditUpdate({ status: s })}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                      ticket.status === s 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                      : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Reassignment Dropdown */}
            <section>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assign Auditor/Staff</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <select 
                  disabled={loading}
                  key={ticket.assigned_to_id}
                  value={ticket.assigned_to_id || ''}
                  onChange={(e) => handleAuditUpdate({ assigned_to_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold appearance-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {availableStaff?.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.username}</option>
                  ))}
                </select>
              </div>
            </section>
          </div>

          <hr className="border-slate-100" />

          {/* Audit Trail Timeline */}
          <section>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Audit History Trail</label>
            <div className="space-y-6 border-l-2 border-slate-100 ml-2 pl-6">
              {ticket.audit_logs?.slice().sort((a,b) => b.id - a.id).map((log) => (
                <div key={log.id} className="relative">
                  {/* Timeline Point */}
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{log.change_type}</span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Clock size={10} />
                        {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold">{log.changed_by}</span> updated from 
                      <span className="text-slate-400 line-through mx-1">{log.old_value || 'None'}</span> to 
                      <span className="text-slate-900 font-bold ml-1">{log.new_value}</span>
                    </p>
                  </div>
                </div>
              ))}
              {(!ticket.audit_logs || ticket.audit_logs.length === 0) && (
                <p className="text-xs text-slate-400 italic">No audit events recorded for this ticket.</p>
              )}
            </div>
          </section>
        </div>

        {/* Footer Quick Action */}
        <div className="p-8 border-t border-slate-100 bg-white">
          <button 
            onClick={() => handleAuditUpdate({ status: 'Resolved' })}
            disabled={loading || ticket.status === 'Resolved'}
            className={`w-full font-bold py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-xl ${
              ticket.status === 'Resolved' 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-1 active:translate-y-0 shadow-emerald-100'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : ticket.status === 'Resolved' ? (
              <><CheckCircle2 size={20} /> Resolution Audit Complete</>
            ) : (
              <><CheckCircle size={20} /> Quick Resolve Ticket</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailView;