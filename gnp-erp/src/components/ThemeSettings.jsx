import React, { useEffect, useState } from 'react';
import { Palette, Sun, Moon, Leaf } from 'lucide-react';

const ThemeSettings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('erp-theme') || 'default');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('erp-theme', theme);
  }, [theme]);

  const themes = [
    { id: 'default', name: 'Blue', icon: <Sun size={14}/>, color: '#1e3a8a' },
    { id: 'emerald', name: 'Green', icon: <Leaf size={14}/>, color: '#064e3b' },
    { id: 'dark', name: 'Midnight', icon: <Moon size={14}/>, color: '#0f172a' }
  ];

  return (
    <div className="flex flex-col gap-2 p-2 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)]">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`group relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
            theme === t.id 
              ? 'bg-[var(--bg-card)] shadow-md ring-1 ring-[var(--border-color)] scale-[1.02]' 
              : 'hover:bg-[var(--bg-card)]/50 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Theme Color Preview Circle */}
            <div 
              className={`w-4 h-4 rounded-full border-2 transition-transform duration-300 ${
                theme === t.id ? 'border-[var(--primary)] scale-110' : 'border-transparent'
              }`} 
              style={{ backgroundColor: t.color }} 
            />
            <div className="flex flex-col items-start">
              <span className={`text-[11px] font-black uppercase tracking-widest ${
                theme === t.id ? 'text-[var(--primary)]' : 'text-slate-500'
              }`}>
                {t.name}
              </span>
            </div>
          </div>

          {/* Icon indicator for active theme */}
          <div className={`transition-all duration-500 ${
            theme === t.id ? 'text-[var(--primary)] opacity-100 rotate-0' : 'text-slate-300 opacity-0 -rotate-90'
          }`}>
            {t.icon}
          </div>

          {/* Hover Glow Effect */}
          <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
            theme === t.id ? 'opacity-100 bg-[var(--primary)]/5' : 'opacity-0 group-hover:opacity-100 bg-slate-400/5'
          }`} />
        </button>
      ))}
    </div>
  );
};

export default ThemeSettings;