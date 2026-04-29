import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import api from '../api';
import ChangePassword from './ChangePassword';

const Login = ({ onLoginSuccess }) => {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const [pendingUser, setPendingUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', creds);
      
      if (res.data.requiresPasswordChange) {
        // Don't log them in fully yet, show the change screen
        setPendingUser(res.data);
      } else {
        localStorage.setItem('user', JSON.stringify(res.data));
        onLoginSuccess(res.data);
      }
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  if (pendingUser) {
    return (
      <ChangePassword 
        userId={pendingUser.id} 
        onSuccess={() => onLoginSuccess(pendingUser)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-900 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">G&P ERP Access</h1>
          <p className="text-slate-500 text-sm mt-1">Enter credentials to enter firm portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="text" required placeholder="Username"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 transition-all"
              onChange={e => setCreds({...creds, username: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="password" required placeholder="Password"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 transition-all"
              onChange={e => setCreds({...creds, password: e.target.value})}
            />
          </div>
          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
          <button className="w-full bg-blue-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 mt-4">
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;