import React, { useState } from 'react';
import { X, MessageSquarePlus } from 'lucide-react';
import api from '../api';

const NewTicketModal = ({ isOpen, onClose, onTicketAdded }) => {
  const [formData, setFormData] = useState({
    subject: '',
    client: '',
    priority: 'Medium'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/tickets', formData);
      onTicketAdded(response.data);
      onClose();
    } catch (error) {
      alert("Error creating ticket: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <MessageSquarePlus className="text-blue-600" size={20}/> New Ticket
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Client Name</label>
            <input 
              required
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Tech Mahindra"
              onChange={(e) => setFormData({...formData, client: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Subject / Issue</label>
            <input 
              required
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Delay in TDS Certificate"
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Priority Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['Low', 'Medium', 'High'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({...formData, priority: p})}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    formData.priority === p 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-800 transition-all mt-4"
          >
            Log Ticket
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTicketModal;