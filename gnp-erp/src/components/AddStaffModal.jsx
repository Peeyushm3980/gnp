import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, Lock, User, GitMerge } from 'lucide-react';
import api from '../api';

const AddStaffModal = ({ isOpen, onClose, onStaffAdded }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    parent_id: ''
  });
  const [availableManagers, setAvailableManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const res = await api.get('/users');
          setAvailableManagers(res.data);
        } catch (err) {
          console.error("Failed to fetch managers", err);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      username: formData.username,
      password: formData.password,
      role: formData.role,
      parent_id: formData.parent_id ? Number(formData.parent_id) : null
    };
    try {
      await api.post('/users', formData);
      onStaffAdded(); // Refresh the list
      onClose();      // Close modal
      setFormData({ username: '', password: '', role: 'user', parent_id: '' });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg"><UserPlus size={20}/></div>
            <h2 className="font-bold text-xl text-slate-900">Add New Staff</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <input 
                required
                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="e.g. naksh_ca"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Temporary Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <input 
                type="password" required
                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reports To (Manager)</label>
            <div className="relative">
              <GitMerge className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-600 transition-all appearance-none text-sm text-slate-700"
                value={formData.parent_id}
                onChange={e => setFormData({...formData, parent_id: e.target.value})}
              >
                <option value="">No Manager (Root Level)</option>
                {availableManagers.map(m => (
                  <option key={m.id} value={m.id}>{m.username} ({m.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Access Level</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'user'})}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.role === 'user' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 grayscale opacity-60'
                }`}
              >
                <User size={20} className="text-blue-600"/>
                <span className="text-xs font-bold text-blue-900">Staff User</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'admin'})}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.role === 'admin' ? 'border-purple-600 bg-purple-50/50' : 'border-slate-100 grayscale opacity-60'
                }`}
              >
                <Shield size={20} className="text-purple-600"/>
                <span className="text-xs font-bold text-purple-900">Partner/Admin</span>
              </button>
            </div>
          </div>

          <button 
            disabled={loading}
            style={{ backgroundColor: 'var(--primary)' }}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 mt-4"
          >
            {loading ? "Creating Account..." : "Confirm & Add to Firm"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;