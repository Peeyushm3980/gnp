import React, { useState } from 'react';
import ERPDashboard from './components/ERPDashboard';
import DocumentVault from './components/DocumentVault';
import SupportTickets from './components/SupportTickets';
import ClientCRM from './components/ClientCRM';
import FirmAccounts from './components/FirmAccounts';
import StaffTracker from './components/StaffTracker';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import { LayoutDashboard, FolderOpen, TicketCheck, Users, Handshake, FilePieChart, Menu, X, MapPin , LogOut} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);  
  const [currentPage, setCurrentPage] = useState('Projects');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const menuItems = [
    { name: 'Projects', icon: LayoutDashboard },
    { name: 'Documents', icon: FolderOpen },
    { name: 'Tickets', icon: TicketCheck },
    { name: 'HR/Payroll', icon: Users },
    { name: 'CRM', icon: Handshake },
    { name: 'Accounts', icon: FilePieChart },
    { name: 'Staff Tracker', icon: MapPin },
    { name: 'Users', icon: Users, adminOnly: true }
  ];

  const handleLogout = () => {
    // 1. Clear state
    setUser(null);
    setCurrentPage('Projects');
    
    // 2. Clear storage (if you implemented persistent login)
    localStorage.removeItem('user');
    
    // 3. Optional: Notify backend if using sessions
    // api.post('/logout'); 
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'Projects': return <ERPDashboard />;
      case 'Documents': return <DocumentVault />;
      case 'Tickets': return <SupportTickets />;
      case 'CRM': return <ClientCRM />;
      case 'Accounts': return <FirmAccounts />;
      case 'Staff Tracker': return <StaffTracker />;
      case 'Users': return <UserManagement />;
      default: return <div className="p-20 text-center text-slate-400">Under Development</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Responsive) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col p-6 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="flex items-center justify-between mb-10 text-blue-900">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 p-2 rounded-lg text-white"><LayoutDashboard size={20} /></div>
            <span className="font-bold text-xl tracking-tight">G&P ERP</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400"><X /></button>
        </div>

        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => { setCurrentPage(item.name); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                currentPage === item.name ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold"
          >
            <LogOut size={20} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* MOBILE HEADER */}
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu /></button>
          <span className="font-bold text-blue-900">G&P Office</span>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold">GP</div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;