import React, { useState, useEffect } from 'react';
import NewEngagementModal from './NewEngagementModal';
import ReassignModal from './ReassignModal';
import api from '../api';
import { 
  LayoutDashboard, AlertCircle, ArrowRightLeft, 
  Clock, CheckCircle2, TrendingUp, Users2, FileText 
} from 'lucide-react';

const ERPDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isReassignOpen, setIsReassignOpen] = useState(false);

  const handleOpenReassign = (task) => {
    setSelectedTask(task);
    setIsReassignOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleNewTask = (newTask) => {
    setTasks([newTask, ...tasks]); // Add new task to the top of the list
  };

  // Dynamic Widget Logic
  const stats = {
    total: tasks.length,
    urgent: tasks.filter(t => t.status === 'Pending').length,
    absence: tasks.filter(t => t.assigned_to.includes('Leave')).length,
    efficiency: "94%" // Can be calculated based on completed vs total
  };

  if (loading) return <div className="p-8 text-slate-500">Connecting to G&P Cloud...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Work Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time status of G&P client engagements</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:bg-blue-800 transition-all"
        >
          + New Engagement
        </button>
      </div>
      <NewEngagementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskAdded={handleNewTask}
      />
      <ReassignModal 
        isOpen={isReassignOpen} 
        task={selectedTask} 
        onClose={() => setIsReassignOpen(false)} 
        onTaskUpdated={handleTaskUpdated} 
      />
      {/* DYNAMIC WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Tasks" value={stats.total} color="text-blue-600" />
        <StatCard title="Pending/Urgent" value={stats.urgent} color="text-red-600" alert={stats.urgent > 0} />
        <StatCard title="Staff Absence" value={stats.absence} color="text-orange-600" />
        <StatCard title="Efficiency" value={stats.efficiency} color="text-green-600" />
      </div>

      {/* DYNAMIC TABLE */}

      {/* --- RESPONSIVE WIDGETS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard title="GST Deadlines" value="08" color="text-red-600" alert={true} icon={<Clock size={16}/>} />
        <StatCard title="Staff Absence" value="02" color="text-orange-600" icon={<Users2 size={16}/>} />
        <StatCard title="Pending Docs" value="45" color="text-blue-600" icon={<FileText size={16}/>} />
        <StatCard title="Efficiency" value="94%" color="text-green-600" icon={<TrendingUp size={16}/>} />
      </div>

      {/* --- MAIN TABLE SECTION --- */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-lg font-bold">Priority Handover Queue</h3>
          <span className="text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Live Sync: Active
          </span>
        </div>

        {/* Horizontal scroll wrapper for mobile table view */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 font-semibold">Client & Service</th>
                <th className="px-6 py-4 font-semibold">Staff Assigned</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Documentation</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50">
                <td className="px-6 py-5">
                  <div className="font-bold">{task.client}</div>
                  <div className="text-xs text-slate-500">{task.service}</div>
                </td>
                <td className="px-6 py-5">{task.assigned_to}</td>
                <td className="px-6 py-5">
                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                     task.status === 'Pending' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                   }`}>
                     {task.status}
                   </span>
                </td>
                <td className="px-6 py-5 text-xs italic">{task.last_action}</td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleOpenReassign(task)}
                      className={`inline-flex items-center gap-2 text-xs font-bold transition-colors ${
                        task.assigned_to.includes('Leave') ? 'text-blue-700' : 'text-slate-400 hover:text-blue-600'
                      }`}
                    >
                      <ArrowRightLeft size={14} />
                      {task.assigned_to.includes('Leave') ? 'Pick Up Task' : 'Reassign'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile-only hint */}
        <div className="lg:hidden px-6 py-3 bg-slate-50 text-[10px] text-slate-400 text-center italic">
          Swipe left to see full table details
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, color, alert, icon }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-center text-slate-400 mb-2 font-bold text-[10px] uppercase tracking-wider">
      <span>{title}</span>
      {icon}
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</span>
      {alert && <AlertCircle size={18} className="text-red-500 animate-pulse" />}
    </div>
  </div>
);

export default ERPDashboard;