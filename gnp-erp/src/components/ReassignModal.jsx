import React, { useState, useEffect } from 'react';
import { X, UserCheck, Users } from 'lucide-react';
import api from '../api';

const ReassignModal = ({ isOpen, onClose, task, onTaskUpdated }) => {
  const [newAssignee, setNewAssignee] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchStaff = async () => {
        setFetching(true);
        try {
          const response = await api.get('/users');
          setAvailableStaff(response.data);
        } catch (error) {
          console.error("Failed to load staff list:", error);
        } finally {
          setFetching(false);
        }
      };
      fetchStaff();
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!newAssignee) return alert("Please select a staff member");
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
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Current: <span className="font-bold text-[var(--primary)]">{task.assigned_to}</span>
            </p>
            
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              New Assignee
            </label>
            
            <div className="relative">
              <Users className="absolute left-3 top-3 text-slate-400" size={18} />
              {/* THE DROPDOWN IS NOW THE ONLY INPUT */}
              <select 
                required
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-[var(--primary)] appearance-none text-sm transition-all"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                disabled={fetching}
              >
                <option value="">{fetching ? "Loading staff..." : "Choose staff member..."}</option>
                {availableStaff.map((staff) => (
                  <option key={staff.id} value={staff.username} className="bg-[var(--bg-card)] text-[var(--text-main)]">
                    {staff.username} ({staff.role})
                  </option>
                ))}
              </select>
              
              {/* Visual arrow for the select dropdown */}
              <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
          </div>
          
          <button 
            disabled={loading || fetching}
            style={{ backgroundColor: 'var(--primary)' }}
            className="w-full text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[var(--primary)]/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Confirm Reassignment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReassignModal;