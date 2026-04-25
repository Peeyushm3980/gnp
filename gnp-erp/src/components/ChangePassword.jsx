import React, { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import api from '../api';

const ChangePassword = ({ userId, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("Passwords do not match");
    if (newPassword === 'password123') return setError("Cannot use the default password");

    try {
      await api.post('/users/change-password', { 
        user_id: userId, 
        new_password: newPassword 
      });
      onSuccess(); // Triggers the final login redirect
    } catch (err) {
      setError("Failed to update password");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl p-10 border border-slate-100 text-center">
        <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-4">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Secure Your Account</h1>
        <p className="text-slate-500 text-sm mt-1 mb-8">You are using a default password. Please set a new one to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" required placeholder="New Password"
            className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600"
            onChange={e => setNewPassword(e.target.value)}
          />
          <input 
            type="password" required placeholder="Confirm New Password"
            className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600"
            onChange={e => setConfirmPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          <button className="w-full bg-blue-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-800 shadow-lg">
            Update & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;