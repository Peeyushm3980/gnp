import React, { useState } from 'react';
import { X, UserPlus, IndianRupee } from 'lucide-react';
import api from '../api';

const NewLeadModal = ({ isOpen, onClose, onLeadAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    status: 'Initial Call',
    value: 0
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/leads', formData);
      onLeadAdded(response.data);
      onClose();
    } catch (error) {
      alert("Error adding lead: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <UserPlus className="text-blue-600" size={20}/> Add New Lead
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Contact Name</label>
            <input 
              required
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Vikas Khanna"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Company Name</label>
            <input 
              required
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Zomato Ltd"
              onChange={(e) => setFormData({...formData, company: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Status</label>
              <select 
                className="w-full border border-slate-200 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option>Initial Call</option>
                <option>Negotiation</option>
                <option>Contract Sent</option>
                <option>Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Est. Value</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">₹</span>
                <input 
                  type="number"
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 pl-7 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-800 transition-all mt-4"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Create Lead
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewLeadModal;