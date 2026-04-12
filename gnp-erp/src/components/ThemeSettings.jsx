import React, { useEffect, useState } from 'react';
import { Sun, Moon, Leaf, Sunrise, Crown, ChevronDown, Palette } from 'lucide-react';

const ThemeSettings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('erp-theme') || 'default');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('erp-theme', theme);
  }, [theme]);

  const themes = [
    { id: 'default', name: 'G&P Blue', icon: <Sun size={14}/>, color: '#1e3a8a' },
    { id: 'emerald', name: 'Eco Green', icon: <Leaf size={14}/>, color: '#064e3b' },
    { id: 'sunset', name: 'Sunset', icon: <Sunrise size={14}/>, color: '#ea580c' },
    { id: 'royal', name: 'Royal', icon: <Crown size={14}/>, color: '#7c3aed' },
    { id: 'dark', name: 'Midnight', icon: <Moon size={14}/>, color: '#0f172a' }
  ];

  const currentThemeData = themes.find(t => t.id === theme) || themes[0];

  return (
    <div className="relative w-full px-2">
      {/* Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full shadow-inner border border-white/20" 
            style={{ backgroundColor: currentThemeData.color }} 
          />
          <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)]">
            {currentThemeData.name}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-2 right-2 mb-2 p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl z-[100] animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex flex-col gap-1">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${
                  theme === t.id 
                    ? 'bg-[var(--primary-light)] text-[var(--primary)]' 
                    : 'hover:bg-[var(--bg-main)] text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: t.color }} 
                  />
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    {t.name}
                  </span>
                </div>
                {theme === t.id && t.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSettings;