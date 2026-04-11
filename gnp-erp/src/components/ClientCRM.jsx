import React, { useState, useEffect } from 'react';
import { UserPlus, TrendingUp, Phone, Mail, MoreVertical, Search, Filter } from 'lucide-react';
import api from '../api';
import NewLeadModal from './NewLeadModal';

const ClientCRM = () => {
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.data);
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadAdded = (newLead) => {
    setLeads([newLead, ...leads]);
  };

  // Calculate Total Pipeline Value
  const totalValue = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Client CRM</h1>
          <p className="text-slate-500 text-sm mt-1">Manage new business inquiries and pipeline growth</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:bg-blue-800 transition-all text-sm flex items-center gap-2"
        >
          <UserPlus size={18}/> + Add New Lead
        </button>
      </div>

      <NewLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLeadAdded={handleLeadAdded} 
      />

      {/* PIPELINE OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mb-1">Total Pipeline Value</p>
            <p className="text-3xl font-bold">₹{totalValue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-blue-600/30 p-3 rounded-2xl">
            <TrendingUp size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-center">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Active Leads</p>
          <p className="text-3xl font-bold text-slate-800">{leads.length}</p>
        </div>
      </div>

      {/* LEADS LIST */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">New Potential Clients</h3>
          <div className="flex gap-2">
             <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-200"><Filter size={18}/></button>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-slate-400 italic">Connecting to CRM database...</div>
        ) : leads.length === 0 ? (
          <div className="p-20 text-center text-slate-400">No leads found. Start adding prospects!</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {leads.map((lead) => (
              <div key={lead.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50/50 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                    {lead.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{lead.name}</div>
                    <div className="text-xs text-slate-500 font-medium">{lead.company}</div>
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <div className="text-sm font-bold text-slate-900">₹{lead.value.toLocaleString('en-IN')}</div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    lead.status === 'Negotiation' ? 'bg-orange-100 text-orange-700' : 
                    lead.status === 'Closed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {lead.status}
                  </span>
                </div>

                <div className="flex gap-1 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                  <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Phone size={18} /></button>
                  <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Mail size={18} /></button>
                  <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><MoreVertical size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCRM;