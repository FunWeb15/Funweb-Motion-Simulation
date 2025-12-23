import React from 'react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 p-2 sm:p-4 landscape:max-lg:p-1 landscape:max-lg:h-12 flex justify-between items-center shadow-md relative z-20">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Sidebar Toggle */}
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle Settings"
        >
          <i className="fas fa-bars text-xl landscape:max-lg:text-lg"></i>
        </button>

        <div className="w-8 h-8 sm:w-10 sm:h-10 landscape:max-lg:w-7 landscape:max-lg:h-7 bg-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse shrink-0">
          <i className="fas fa-atom text-white text-base sm:text-xl landscape:max-lg:text-sm"></i>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-xl landscape:max-lg:text-xs font-bold bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 bg-clip-text text-transparent truncate">
            Funweb Physics: Motion
          </h1>
          <p className="text-[8px] sm:text-xs landscape:max-lg:hidden text-slate-400 uppercase tracking-widest font-semibold truncate">
            Grade 7 Simulation Interactive
          </p>
        </div>
      </div>
      
      <div className="hidden md:flex landscape:max-lg:hidden gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-3 h-3 rounded-full bg-pink-500"></span>
          <span>Force</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>Mass</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>Speed</span>
        </div>
      </div>
    </header>
  );
};

export default Header;