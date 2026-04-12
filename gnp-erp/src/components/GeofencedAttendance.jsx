import React, { useState } from 'react';
import { MapPin, CheckCircle } from 'lucide-react';
import api from '../api';

const GeofencedAttendance = () => {
  const [status, setStatus] = useState('idle');

  const handleCheckIn = () => {
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await api.post('/attendance', {
          staff_name: "Peeyush Mishra", // Dynamic in real app
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location_name: "Client Site (Verified)"
        });
        setStatus('success');
      } catch (err) { setStatus('error'); }
    }, () => setStatus('denied'));
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin size={18}/> Digital Attendance</h3>
      <button 
        onClick={handleCheckIn}
        disabled={status === 'success'}
        className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
          status === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-700 text-white hover:bg-blue-800'
        }`}
      >
        {status === 'idle' && "Check-in at Client Site"}
        {status === 'locating' && "Verifying Location..."}
        {status === 'success' && <><CheckCircle size={20}/> Verified & Logged</>}
      </button>
      <p className="text-[10px] text-slate-400 mt-2 text-center italic">Requires GPS for audit compliance</p>
    </div>
  );
};

export default GeofencedAttendance;