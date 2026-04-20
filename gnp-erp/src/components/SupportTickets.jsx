import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight, Clock, Shield, AlertCircle, Filter, X, ChevronDown } from 'lucide-react';
import api from '../api';
import NewTicketModal from './NewTicketModal';
import TicketDetailView from './TicketDetailView';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState([]); // Array for multi-select
  const [userFilter, setUserFilter] = useState([]);     // Array for multi-select
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchStaff();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      const allTickets = response.data;
      setTickets(allTickets);
      
      // SYNC LOGIC: If a ticket is open in the detail view, update its data
      if (selectedTicket) {
        const updated = allTickets.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    const res = await api.get('/users');
    setAvailableStaff(res.data);
  };

  const toggleFilter = (value, type) => {
    if (type === 'status') {
      setStatusFilter(prev => 
        prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
      );
    } else {
      setUserFilter(prev => 
        prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
      );
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(ticket.status);
    const matchesUser = userFilter.length === 0 || userFilter.includes(ticket.assigned_to_id);
    return matchesStatus && matchesUser;
  });

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
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

  const getPriorityStyle = (p) => {
    if (p === 'High') return 'text-red-600 bg-red-50';
    if (p === 'Medium') return 'text-amber-600 bg-amber-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support Tickets</h1>
          <p className="text-slate-500 font-medium">Manage client queries and resolution tracking</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-4 rounded-2xl font-bold transition-all ${showFilters ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            <Filter size={20} /> {showFilters ? 'Hide Filters' : 'Filter View'}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: 'var(--primary)' }}
            className="flex items-center gap-2 bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-800 transition-all"
          >
            <Plus size={20} /> New Ticket
          </button>
        </div>
      </div>

      {/* Multi-Select Filter Bar */}
      {showFilters && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Status Multi-Select */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                {['Open', 'Pending', 'Hold', 'Resolved', 'Cancel'].map(status => (
                  <button
                    key={status}
                    onClick={() => toggleFilter(status, 'status')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${statusFilter.includes(status) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* User Multi-Select */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Filter by Assigned Staff</label>
              <div className="flex flex-wrap gap-2">
                {availableStaff.map(staff => (
                  <button
                    key={staff.id}
                    onClick={() => toggleFilter(staff.id, 'user')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${userFilter.includes(staff.id) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'}`}
                  >
                    {staff.username}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {(statusFilter.length > 0 || userFilter.length > 0) && (
            <button 
              onClick={() => { setStatusFilter([]); setUserFilter([]); }}
              className="mt-6 text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 hover:underline"
            >
              <X size={12} /> Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} onClick={() => { setSelectedTicket(ticket); setIsDetailOpen(true); }}className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6 font-bold text-slate-900">{ticket.subject}</td>
                <td className="p-6 text-center">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1 mx-auto w-24 ${getPriorityStyle(ticket.priority)}`}>
                    <AlertCircle size={10} /> {ticket.priority}
                  </span>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="p-6">
                  <span className="text-sm font-bold text-slate-600">{ticket.assignee?.username || 'Unassigned'}</span>
                </td>
                <td className="p-6 text-right">
                  <button onClick={() => { setSelectedTicket(ticket); setIsDetailOpen(true); }} className="p-3 bg-slate-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTickets.length === 0 && (
          <div className="p-20 text-center text-slate-400 font-medium">No tickets match the selected filters.</div>
        )}
      </div>

      <NewTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTicketAdded={fetchTickets} />
      <TicketDetailView isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} ticket={selectedTicket} onUpdate={fetchTickets} availableStaff={availableStaff} />
    </div>
  );
};

export default SupportTickets;