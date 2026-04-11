import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import api from '../api';

const ReassignModal = ({ isOpen, onClose, task, onTaskUpdated }) => {
  const [newAssignee, setNewAssignee] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !task) return null;

  const handleReassign = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.patch(`/tasks/${task.id}`, {
        assigned_to: newAssignee
      });
      onTaskUpdated(response.data);
      onClose();
    } catch (error) {
      alert("Reassignment failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-lg">Reassign Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleReassign} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">
              Current: <span className="font-bold text-slate-700">{task.assigned_to}</span>
            </p>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">New Assignee</label>
            <input 
              required
              autoFocus
              className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter staff name..."
              onChange={(e) => setNewAssignee(e.target.value)}
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
          >
            <UserCheck size={18} /> {loading ? "Updating..." : "Confirm Reassignment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReassignModal;