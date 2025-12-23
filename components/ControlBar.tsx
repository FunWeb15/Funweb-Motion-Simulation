import React from 'react';
import { SimulationStatus } from '../types';

interface ControlBarProps {
  status: SimulationStatus;
  onToggle: () => void;
  onReset: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ status, onToggle, onReset }) => {
  const isRunning = status === SimulationStatus.RUNNING;
  const isFinished = status === SimulationStatus.FINISHED;

  return (
    <div className="mt-2 sm:mt-4 landscape:max-lg:mt-1 flex flex-wrap justify-center items-center gap-3 sm:gap-6 landscape:max-lg:gap-2 p-2 sm:p-4 landscape:max-lg:p-1.5 bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex gap-2 sm:gap-6 landscape:max-lg:gap-2 w-full sm:w-auto justify-center">
        <button 
          onClick={onToggle}
          className={`
            flex items-center justify-center gap-2 px-4 sm:px-8 py-2.5 sm:py-3 landscape:max-lg:py-1.5 landscape:max-lg:px-4 rounded-lg sm:rounded-xl font-black uppercase text-xs sm:text-sm landscape:max-lg:text-[10px] tracking-wider transition-all transform active:scale-90
            ${isFinished ? 'bg-indigo-600 hover:bg-indigo-500' : isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}
            text-white shadow-[0_3px_0_rgb(0,0,0,0.3)] hover:shadow-none hover:translate-y-[1px] sm:shadow-[0_4px_0_rgb(0,0,0,0.3)] sm:hover:translate-y-[2px]
            flex-1 sm:flex-none
          `}
        >
          <i className={`fas ${isFinished ? 'fa-redo' : isRunning ? 'fa-pause' : 'fa-play'}`}></i>
          <span className="whitespace-nowrap">{isFinished ? 'Restart' : isRunning ? 'Pause' : 'Start Race'}</span>
        </button>

        <button 
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 landscape:max-lg:py-1.5 landscape:max-lg:px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg sm:rounded-xl font-bold uppercase text-xs sm:text-sm landscape:max-lg:text-[10px] tracking-wider transition-all transform active:scale-95 shadow-[0_3px_0_rgb(0,0,0,0.3)] hover:shadow-none hover:translate-y-[1px] sm:shadow-[0_4px_0_rgb(0,0,0,0.3)] sm:hover:translate-y-[2px] flex-1 sm:flex-none"
        >
          <i className="fas fa-undo"></i>
          Reset
        </button>
      </div>

      <div className="flex items-center px-4 border-l border-slate-800 h-10 landscape:max-lg:h-6 landscape:max-lg:px-2">
        <div className="flex flex-col items-center">
          <span className="text-[8px] sm:text-[10px] landscape:max-lg:text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">Status</span>
          <span className={`text-[10px] sm:text-xs landscape:max-lg:text-[9px] font-bold uppercase ${isRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`}>
            {status}
          </span>
        </div>
      </div>
      
      <div className="hidden lg:flex flex-col items-center px-4 border-l border-slate-800 text-slate-500">
        <span className="text-[10px] font-black uppercase tracking-widest">Hotkeys</span>
        <span className="text-xs font-bold">[Space] [P] [R]</span>
      </div>
    </div>
  );
};

export default ControlBar;