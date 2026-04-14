import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ERPDashboard from './components/ERPDashboard';
import DocumentVault from './components/DocumentVault';
import SupportTickets from './components/SupportTickets';
import ClientCRM from './components/ClientCRM';
import FirmAccounts from './components/FirmAccounts';
import StaffTracker from './components/StaffTracker';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import ThemeSettings from './components/ThemeSettings';
import StaffHierarchy from './components/StaffHierarchy';
import { 
  LayoutDashboard, FolderOpen, TicketCheck, 
  Users, Handshake, FilePieChart, Menu, 
  X, MapPin, LogOut , Network
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);  
  const [currentPage, setCurrentPage] = useState('Projects');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('erp-theme') || 'default');

  useEffect(() => {
    // Apply theme to the HTML tag for CSS variable selection
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('erp-theme', theme);
  }, [theme]);

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const menuItems = [
    { name: 'Projects', icon: LayoutDashboard },
    { name: 'Documents', icon: FolderOpen },
    { name: 'Tickets', icon: TicketCheck },
    { name: 'Hierarchy', icon: Network },
    { name: 'HR/Payroll', icon: Users },
    { name: 'CRM', icon: Handshake },
    { name: 'Accounts', icon: FilePieChart },
    { name: 'Staff Tracker', icon: MapPin },
    { name: 'Users', icon: Users, adminOnly: true }
  ].filter(item => !item.adminOnly || user.role === 'admin');

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('Projects');
    localStorage.removeItem('user');
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'Projects': return <ERPDashboard />;
      case 'Documents': return <DocumentVault />;
      case 'Tickets': return <SupportTickets />;
      case 'Hierarchy': return <StaffHierarchy loggedInUserId={user.id} />;
      case 'CRM': return <ClientCRM />;
      case 'Accounts': return <FirmAccounts />;
      case 'Staff Tracker': return <StaffTracker />;
      case 'Users': return <UserManagement />;
      default: return <div className="p-20 text-center text-slate-400">Under Development</div>;
    }
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden transition-colors duration-300">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderColor: 'var(--border-color)',
          color: 'var(--text-main)' 
        }}
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col p-6 transition-all duration-300 transform border-r
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-10 text-[var(--primary)]">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--primary)] p-2 rounded-lg text-white shadow-lg shadow-[var(--primary)]/20">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--text-main)]">G&P ERP</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400"><X /></button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => { setCurrentPage(item.name); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                currentPage === item.name 
                  ? 'bg-[var(--primary-light)] text-[var(--primary)] font-bold shadow-sm' 
                  : 'text-slate-500 hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Unified Theme & Logout Section */}
        <div className="mt-auto pt-4 space-y-4">
          <div className="border-t border-[var(--border-color)] pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2 text-center">
              Color Theme
            </p>
            <ThemeSettings />
          </div>
          
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
      <main 
        style={{ 
          backgroundColor: 'var(--bg-main)', 
          color: 'var(--text-main)' 
        }}
        className="flex-1 flex flex-col min-w-0 overflow-hidden transition-colors duration-300"
      >
        {/* MOBILE HEADER */}
        <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-4 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-[var(--primary-light)] rounded-lg"><Menu /></button>
          <span className="font-bold text-[var(--primary)]">G&P Office</span>
          <div className="w-8 h-8 bg-[var(--primary-light)] text-[var(--primary)] rounded-full flex items-center justify-center text-[10px] font-bold">GP</div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;