import React, { useState, useEffect } from 'react';
import { X, MessageSquarePlus } from 'lucide-react';
import api from '../api';

const NewTicketModal = ({ isOpen, onClose, onTicketAdded, initialData }) => {
  const [formData, setFormData] = useState({
    subject: '',
    client: '',
    priority: 'Medium'
  });

  // SYNC LOGIC: When initialData (from an email) is passed, update the form
  useEffect(() => {
    if (initialData) {
      setFormData({
        subject: initialData.subject || '',
        client: initialData.sender || '', // Mapping Sender to Client
        priority: 'Low' // Defaulting to Low as requested
      });
    } else {
      // Reset to defaults if opening a fresh blank ticket
      setFormData({ subject: '', client: '', priority: 'Medium' });
    }
  }, [initialData, isOpen]);

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
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <MessageSquarePlus className="text-blue-600" size={20}/> 
            {initialData ? 'Convert Email to Ticket' : 'New Ticket'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Client Name (Sender)</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={formData.client}
              onChange={(e) => setFormData({...formData, client: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Subject</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={formData.subject}
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
            Confirm & Create Ticket
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTicketModal;