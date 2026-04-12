import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, AlertCircle, ArrowRightLeft, 
  Clock, CheckCircle2, TrendingUp, MapPin, 
  ExternalLink, Bell, CheckCircle, FileWarning,
  MessageCircle 
} from 'lucide-react';
import api from '../api';
import NewEngagementModal from './NewEngagementModal';
import ReassignModal from './ReassignModal';
import GeofencedAttendance from './GeofencedAttendance';

// --- WHATSAPP HELPER ---
const sendWhatsAppNotification = (clientPhone, clientName, documentName, expiryDate) => {
  const phone = clientPhone || "919876543210"; 
  const cleanPhone = phone.replace(/\D/g, '');
  const finalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  const message = `Dear ${clientName}, this is a reminder from G&P Associates. Your ${documentName} is expiring on ${expiryDate}. Please provide the updated documents to avoid any filing delays.`;

  const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

const ERPDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState('idle');
  
  const [isEngageOpen, setIsEngageOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [taskRes, expiryRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/compliance/expiring')
      ]);
      setTasks(taskRes.data);
      setExpiringDocs(expiryRes.data);
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = () => {
    setAttendanceStatus('locating');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await api.post('/attendance', {
          staff_name: "Peeyush Mishra",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location_name: "Client Site (Verified)"
        });
        setAttendanceStatus('success');
      } catch (err) { setAttendanceStatus('error'); }
    }, () => setAttendanceStatus('denied'));
  };

  if (loading) return <div className="p-10 text-slate-500 animate-pulse text-center font-bold">Synchronizing G&P ERP Data...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Partner's Command Center</h1>
          <p className="text-slate-500 text-sm">G&P Firm Operations • April 2026</p>
        </div>
        <button 
          onClick={() => setIsEngageOpen(true)}
          className="bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-blue-200 shadow-xl hover:bg-blue-800 transition-all hover:-translate-y-0.5"
        >
          + New Engagement
        </button>
      </div>

      {/* --- TOP ROW: STATS & ATTENDANCE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Active Engagements" value={tasks.length} icon={<TrendingUp size={20}/>} color="bg-blue-600" />
          <StatCard title="Urgent Handover" value={tasks.filter(t => t.assigned_to.includes('Leave')).length} icon={<AlertCircle size={20}/>} color="bg-red-500" />
          <StatCard title="Compliance Risks" value={expiringDocs.length} icon={<FileWarning size={20}/>} color="bg-orange-500" />
        </div>
        
        <div className="lg:col-span-1">
          <GeofencedAttendance />
        </div>
      </div>

      {/* --- MIDDLE ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Task Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-slate-800">Operational Continuity</h3>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-bold uppercase tracking-widest">Real-time</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Client / Service</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm">{task.client}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{task.service}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                          {task.assigned_to[0]}
                        </div>
                        <span className="text-sm font-medium text-slate-600">{task.assigned_to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                        task.assigned_to.includes('Leave') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {task.assigned_to.includes('Leave') ? 'ACTION REQUIRED' : 'ON TRACK'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => { setSelectedTask(task); setIsReassignOpen(true); }}
                        className="text-blue-700 hover:text-blue-800 text-xs font-bold inline-flex items-center gap-1"
                      >
                        <ArrowRightLeft size={14} /> Reassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Attendance Widget (Original Logic) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Register</span>
              <MapPin size={16} className="text-blue-600" />
            </div>
            <button 
              onClick={handleAttendance}
              disabled={attendanceStatus === 'success'}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                attendanceStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
              }`}
            >
              {attendanceStatus === 'idle' && "Mark Site Attendance"}
              {attendanceStatus === 'locating' && "Verifying GPS..."}
              {attendanceStatus === 'success' && "Checked In"}
            </button>
          </div>

          {/* DSC/Compliance Tracker */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-900 text-white font-bold text-sm flex justify-between items-center">
              <span>Compliance Expiry</span>
              <Bell size={16} className="text-orange-400 animate-pulse" />
            </div>
            <div className="p-2 divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {expiringDocs.length > 0 ? expiringDocs.map(doc => (
                <div key={doc.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{doc.filename}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> {doc.client_name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-red-600">
                      {new Date(doc.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                    <button 
                      onClick={() => sendWhatsAppNotification(
                        doc.client_phone, 
                        doc.client_name, 
                        doc.filename, 
                        new Date(doc.expiry_date).toLocaleDateString()
                      )}
                      className="text-[9px] font-bold text-green-600 uppercase mt-1 flex items-center justify-end gap-1 hover:underline"
                    >
                      <MessageCircle size={10} /> Notify WA
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center">
                  <CheckCircle size={24} className="text-green-500 mx-auto mb-2 opacity-20" />
                  <p className="text-slate-400 text-xs italic">All compliance up to date</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Portal Links */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Govt Portals</h3>
            <div className="grid grid-cols-2 gap-3">
              <PortalLink name="Income Tax" url="https://eportal.incometax.gov.in" />
              <PortalLink name="GST Portal" url="https://www.gst.gov.in" />
              <PortalLink name="MCA V3" url="https://www.mca.gov.in" />
              <PortalLink name="TRACES" url="https://www.tdscpc.gov.in" />
            </div>
          </div>
        </div>
      </div>

      <NewEngagementModal isOpen={isEngageOpen} onClose={() => setIsEngageOpen(false)} onTaskAdded={fetchDashboardData} />
      <ReassignModal isOpen={isReassignOpen} task={selectedTask} onClose={() => setIsReassignOpen(false)} onTaskUpdated={fetchDashboardData} />
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
    <div className={`absolute top-0 right-0 p-4 ${color} text-white rounded-bl-3xl opacity-10 group-hover:opacity-20 transition-all`}>
      {icon}
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

const PortalLink = ({ name, url }) => (
  <a 
    href={url} 
    target="_blank" 
    rel="noreferrer"
    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
  >
    <span className="text-[11px] font-bold text-slate-600">{name}</span>
    <ExternalLink size={12} className="text-slate-300" />
  </a>
);

export default ERPDashboard;