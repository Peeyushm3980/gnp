import React, { useState, useEffect } from 'react';
import { MapPin, Clock, User, ExternalLink, RefreshCcw } from 'lucide-react';
import api from '../api';

const StaffTracker = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/attendance/latest');
      setLocations(response.data);
    } catch (err) {
      console.error("Failed to fetch locations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Location Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time GPS verification for audit site visits</p>
        </div>
        <button 
          onClick={fetchLocations}
          className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-slate-200"
        >
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                  <User size={24} />
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md uppercase tracking-wider">
                  Active Now
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-800">{loc.staff_name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin size={12} className="text-blue-600" /> {loc.location_name}
              </p>

              <div className="mt-6 p-4 bg-slate-50 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Last Verified</span>
                  <span className="text-[10px] font-medium text-slate-700 flex items-center gap-1">
                    <Clock size={10} /> {new Date(loc.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Coordinates</span>
                  <span className="text-[10px] font-mono text-slate-600">
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              <a 
                href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
              >
                View on Google Maps <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}

        {locations.length === 0 && !loading && (
          <div className="col-span-full p-20 text-center text-slate-400 italic">
            No attendance logs found in the database.
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffTracker;