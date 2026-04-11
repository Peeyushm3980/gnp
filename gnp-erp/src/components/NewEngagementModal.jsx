import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api';

const NewEngagementModal = ({ isOpen, onClose, onTaskAdded }) => {
  const [formData, setFormData] = useState({
    client: '',
    service: 'Statutory Audit',
    assigned_to: '',
    status: 'Pending',
    last_action: 'Engagement Started'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/tasks', formData);
      onTaskAdded(response.data); // Update the list in parent component
      onClose(); // Close modal
    } catch (error) {
      alert("Error creating engagement: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-xl text-slate-800">New Engagement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Client Name</label>
            <input 
              required
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Apollo Hospitals"
              onChange={(e) => setFormData({...formData, client: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Category</label>
            <select 
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              onChange={(e) => setFormData({...formData, service: e.target.value})}
            >
              <option>Statutory Audit</option>
              <option>GST Filing</option>
              <option>Income Tax</option>
              <option>ROC Compliance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign To</label>
            <input 
              required
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Employee Name"
              onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-800 transition-all mt-4"
          >
            Create Engagement
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewEngagementModal;