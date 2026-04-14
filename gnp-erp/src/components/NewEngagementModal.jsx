import React, { useState, useEffect } from 'react';
import { X, Users, Briefcase } from 'lucide-react';
import api from '../api';

const NewEngagementModal = ({ isOpen, onClose, onTaskAdded }) => {
  const [formData, setFormData] = useState({
    client: '',
    service: 'Statutory Audit',
    assigned_to: '',
    status: 'Pending',
    last_action: 'Engagement Started'
  });

  const [availableStaff, setAvailableStaff] = useState([]);
  const [fetching, setFetching] = useState(false);

  // NEW: Fetch active staff members when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchStaff = async () => {
        setFetching(true);
        try {
          const response = await api.get('/users');
          setAvailableStaff(response.data);
        } catch (error) {
          console.error("Failed to load staff for engagement:", error);
        } finally {
          setFetching(false);
        }
      };
      fetchStaff();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.assigned_to) return alert("Please select a staff member to assign this task.");
    
    try {
      const response = await api.post('/tasks', formData);
      onTaskAdded(response.data);
      onClose();
    } catch (error) {
      alert("Error creating engagement: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-xl text-slate-800">New Engagement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-[10px] tracking-widest">Client Name</label>
            <input 
              required
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="e.g. Reliance Industries"
              onChange={(e) => setFormData({...formData, client: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-[10px] tracking-widest">Service Category</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 text-slate-300" size={16} />
              <select 
                className="w-full border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm appearance-none"
                onChange={(e) => setFormData({...formData, service: e.target.value})}
              >
                <option>Statutory Audit</option>
                <option>GST Filing</option>
                <option>Income Tax</option>
                <option>ROC Compliance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-[10px] tracking-widest">Assign To</label>
            <div className="relative">
              <Users className="absolute left-3 top-3 text-slate-300" size={18} />
              {/* UPDATED: Dropdown instead of Text Input */}
              <select 
                required
                className="w-full border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm appearance-none"
                value={formData.assigned_to}
                onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                disabled={fetching}
              >
                <option value="">{fetching ? "Loading staff list..." : "Choose staff member..."}</option>
                {availableStaff.map((staff) => (
                  <option key={staff.id} value={staff.username}>
                    {staff.username} ({staff.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={fetching}
            className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-800 transition-all mt-4 active:scale-95 disabled:bg-slate-300"
          >
            Create Task Engagement
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewEngagementModal;