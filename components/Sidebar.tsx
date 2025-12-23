import React from 'react';
import { MotionVariables } from '../types';
import { CHARACTERS } from '../constants';

interface SidebarProps {
  objectVars: Record<string, MotionVariables>;
  onIndividualChange: (id: string, key: keyof MotionVariables, value: number) => void;
  globalVars: MotionVariables;
  onGlobalChange: (key: keyof MotionVariables, value: number) => void;
  simulationActive: boolean;
  onClose?: () => void;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  tooltip: string;
  colorClass: string;
  onChange: (val: number) => void;
  disabled?: boolean;
}> = ({ label, value, min, max, step, unit, tooltip, colorClass, onChange, disabled }) => (
  <div className="mb-4 group relative">
    <div className="flex justify-between items-center mb-1">
      <label className="text-[10px] sm:text-xs font-bold text-slate-300 flex items-center gap-1">
        {label}
        <i className="fas fa-info-circle text-[10px] text-slate-500 cursor-help" title={tooltip}></i>
      </label>
      <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-100 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
        {value}{unit}
      </span>
    </div>
    <input 
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      disabled={disabled}
      className={`w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-${colorClass} hover:opacity-100 transition-opacity ${disabled ? 'opacity-50 cursor-not-allowed' : 'opacity-80'}`}
    />
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  objectVars, 
  onIndividualChange, 
  globalVars,
  onGlobalChange,
  simulationActive,
  onClose
}) => {
  return (
    <aside className="w-72 sm:w-80 bg-slate-950 border-r border-slate-800 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-2xl">
      
      {/* Sidebar Header for Mobile */}
      <div className="lg:hidden flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900">
        <h2 className="text-xs font-black text-slate-300 uppercase tracking-widest">Settings</h2>
        <button onClick={onClose} className="p-1 text-slate-500 hover:text-white">
          <i className="fas fa-times text-lg"></i>
        </button>
      </div>

      {/* Global Controls - Enabled Live */}
      <section className="p-4 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-sm font-black text-slate-400 mb-4 uppercase flex items-center gap-2">
          <i className="fas fa-globe text-blue-400"></i> Global Settings
        </h2>
        <Slider 
          label="Track Distance"
          value={globalVars.maxDistance}
          min={50} max={500} step={10} unit="m"
          tooltip="The length of the race track."
          colorClass="blue-500"
          onChange={(v) => onGlobalChange('maxDistance', v)}
          disabled={false}
        />
        <Slider 
          label="Time Scale"
          value={globalVars.timeScale}
          min={0.1} max={3} step={0.1} unit="x"
          tooltip="Speed of time in the simulation."
          colorClass="yellow-500"
          onChange={(v) => onGlobalChange('timeScale', v)}
          disabled={false}
        />
      </section>

      {/* Individual Controls - Locked during Active Simulation */}
      {CHARACTERS.map((char) => (
        <section key={char.id} className="p-4 border-b border-slate-800 last:border-0 hover:bg-slate-900/20 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shadow-md shrink-0"
              style={{ borderColor: char.color, backgroundColor: `${char.color}22` }}
            >
              <i className="fas fa-user-astronaut text-[10px] sm:text-base" style={{ color: char.color }}></i>
            </div>
            <h3 className="font-bold text-[11px] sm:text-sm text-slate-200 uppercase tracking-tighter truncate" style={{ color: char.color }}>
              {char.name}'s Variables
            </h3>
          </div>

          <Slider 
            label="Initial Speed"
            value={objectVars[char.id].velocity}
            min={0} max={40} step={1} unit=" m/s"
            tooltip="Set starting speed manually."
            colorClass="violet-500"
            onChange={(v) => onIndividualChange(char.id, 'velocity', v)}
            disabled={simulationActive}
          />
          <Slider 
            label="appliedForce"
            value={objectVars[char.id].force}
            min={0} max={100} step={1} unit=" N"
            tooltip="Pushing strength. F ∝ a"
            colorClass="pink-500"
            onChange={(v) => onIndividualChange(char.id, 'force', v)}
            disabled={simulationActive}
          />
          <Slider 
            label="mass"
            value={objectVars[char.id].mass}
            min={1} max={25} step={1} unit=" kg"
            tooltip="How heavy/hard to move. m ∝ 1/a"
            colorClass="emerald-500"
            onChange={(v) => onIndividualChange(char.id, 'mass', v)}
            disabled={simulationActive}
          />
          <Slider 
            label="surfaceFriction"
            value={objectVars[char.id].friction}
            min={0} max={0.3} step={0.01} unit=""
            tooltip="Roughness of the track."
            colorClass="orange-500"
            onChange={(v) => onIndividualChange(char.id, 'friction', v)}
            disabled={simulationActive}
          />
          <Slider 
            label="airResistance"
            value={objectVars[char.id].airResistance}
            min={0} max={1} step={0.01} unit=""
            tooltip="Wind drag."
            colorClass="sky-500"
            onChange={(v) => onIndividualChange(char.id, 'airResistance', v)}
            disabled={simulationActive}
          />
        </section>
      ))}

      {/* Info Legend */}
      <div className="p-4 mt-auto bg-slate-900/40 text-[9px] sm:text-[10px] text-slate-500 leading-tight">
        <p className="mb-2 uppercase font-bold tracking-widest text-slate-400">Physics Reminders:</p>
        <ul className="space-y-1 list-disc pl-3">
          <li>F = m × a (Newton's 2nd Law)</li>
          <li>Net Force = Force - Friction - Drag</li>
          <li>Speed = Distance / Time</li>
          <li>Acceleration = Change in Speed / Time</li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;