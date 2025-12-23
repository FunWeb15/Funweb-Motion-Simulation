import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationStatus, SimulationObjectState, MotionVariables } from './types';
import { CHARACTERS, INITIAL_VARIABLES, PHYSICS } from './constants';
import Sidebar from './components/Sidebar';
import SimulationCanvas from './components/SimulationCanvas';
import ControlBar from './components/ControlBar';
import Header from './components/Header';

const App: React.FC = () => {
  const [status, setStatus] = useState<SimulationStatus>(SimulationStatus.IDLE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalVars, setGlobalVars] = useState<MotionVariables>({
    force: INITIAL_VARIABLES.force,
    mass: INITIAL_VARIABLES.mass,
    friction: INITIAL_VARIABLES.friction,
    airResistance: INITIAL_VARIABLES.airResistance,
    maxDistance: INITIAL_VARIABLES.maxDistance,
    timeScale: INITIAL_VARIABLES.timeScale,
    velocity: INITIAL_VARIABLES.velocity,
  });

  // Unique variables for each object
  const [objectVars, setObjectVars] = useState<Record<string, MotionVariables>>({
    blossom: { ...globalVars },
    bubbles: { ...globalVars },
    buttercup: { ...globalVars },
  });

  const [objects, setObjects] = useState<SimulationObjectState[]>(
    CHARACTERS.map((char) => ({
      id: char.id,
      name: char.name,
      color: char.color,
      image: char.image,
      position: 0,
      velocity: 0,
      acceleration: 0,
      variables: { ...globalVars },
      trail: [],
      isFinished: false,
    }))
  );

  const requestRef = useRef<number>();

  const resetSimulation = useCallback(() => {
    setStatus(SimulationStatus.IDLE);
    setObjects(prev => prev.map(obj => ({
      ...obj,
      position: 0,
      velocity: objectVars[obj.id].velocity || 0,
      acceleration: 0,
      trail: [],
      isFinished: false,
      variables: { ...objectVars[obj.id] }
    })));
  }, [objectVars]);

  const updatePhysics = useCallback(() => {
    if (status !== SimulationStatus.RUNNING) return;

    setObjects((prevObjects) => {
      const newObjects = prevObjects.map((obj) => {
        if (obj.isFinished) return obj;

        const vars = obj.variables;
        const dt = PHYSICS.DT * globalVars.timeScale;

        const frictionForce = vars.friction * vars.mass * PHYSICS.GRAVITY;
        const dragForce = vars.airResistance * obj.velocity;
        const netForce = Math.max(0, vars.force - frictionForce - dragForce);
        
        const acceleration = netForce / vars.mass;
        const velocity = obj.velocity + acceleration * dt;
        let position = obj.position + velocity * dt;

        let isFinished = false;
        if (position >= globalVars.maxDistance) {
          position = globalVars.maxDistance;
          isFinished = true;
        }

        const newTrail = [...obj.trail, { x: position, y: 0, opacity: 1.0 }]
          .slice(-PHYSICS.MAX_TRAIL_LENGTH)
          .map(t => ({ ...t, opacity: t.opacity - PHYSICS.TRAIL_FADE_SPEED }));

        return {
          ...obj,
          position,
          velocity: isFinished ? 0 : velocity,
          acceleration: isFinished ? 0 : acceleration,
          trail: newTrail.filter(t => t.opacity > 0),
          isFinished
        };
      });

      if (newObjects.every(obj => obj.isFinished)) {
        setStatus(SimulationStatus.FINISHED);
      }

      return newObjects;
    });

    requestRef.current = requestAnimationFrame(updatePhysics);
  }, [status, globalVars.timeScale, globalVars.maxDistance]);

  useEffect(() => {
    if (status === SimulationStatus.RUNNING) {
      requestRef.current = requestAnimationFrame(updatePhysics);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, updatePhysics]);

  const toggleSimulation = () => {
    if (status === SimulationStatus.IDLE || status === SimulationStatus.PAUSED) {
      setStatus(SimulationStatus.RUNNING);
    } else if (status === SimulationStatus.RUNNING) {
      setStatus(SimulationStatus.PAUSED);
    } else if (status === SimulationStatus.FINISHED) {
      resetSimulation();
      setStatus(SimulationStatus.RUNNING);
    }
  };

  useEffect(() => {
    if (status === SimulationStatus.IDLE) {
      setObjects(prev => prev.map(obj => ({
        ...obj,
        velocity: objectVars[obj.id].velocity,
        variables: { ...objectVars[obj.id], maxDistance: globalVars.maxDistance }
      })));
    }
  }, [objectVars, status, globalVars.maxDistance]);

  const handleGlobalChange = (key: keyof MotionVariables, value: number) => {
    // Global settings are allowed to be modified live (any status)
    setGlobalVars(prev => ({ ...prev, [key]: value }));
    if (key === 'maxDistance') {
      setObjects(prev => prev.map(obj => ({
        ...obj,
        variables: { ...obj.variables, maxDistance: value }
      })));
    }
  };

  const handleIndividualChange = (objId: string, key: keyof MotionVariables, value: number) => {
    // Enforce strict interactivity locking: only allow individual changes when in IDLE state
    if (status !== SimulationStatus.IDLE) return;

    setObjectVars(prev => ({
      ...prev,
      [objId]: { ...prev[objId], [key]: value }
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        toggleSimulation();
      } else if (e.key.toLowerCase() === 'r') {
        resetSimulation();
      } else if (e.key.toLowerCase() === 'p') {
        if (status === SimulationStatus.RUNNING) setStatus(SimulationStatus.PAUSED);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, toggleSimulation, resetSimulation]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 font-sans select-none overflow-hidden touch-none">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex flex-1 overflow-hidden relative">
        {/* Sidebar for individual controls */}
        <div className={`
          fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 lg:z-10 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            objectVars={objectVars} 
            onIndividualChange={handleIndividualChange}
            globalVars={globalVars}
            onGlobalChange={handleGlobalChange}
            simulationActive={status !== SimulationStatus.IDLE}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Simulation View */}
        <div className="flex-1 flex flex-col relative bg-slate-800 shadow-inner p-2 sm:p-4 landscape:max-lg:p-1 overflow-hidden">
          <SimulationCanvas 
            objects={objects} 
            maxDistance={globalVars.maxDistance}
            globalFriction={globalVars.friction}
            globalDrag={globalVars.airResistance}
          />
          
          <ControlBar 
            status={status}
            onToggle={toggleSimulation}
            onReset={resetSimulation}
          />
        </div>
      </main>

      {/* Floating Back Button */}
      <a 
        href="motionsim.html" 
        className="fixed bottom-6 left-6 z-30 bg-slate-700/80 hover:bg-slate-600 text-white px-4 py-2 rounded-full shadow-lg hidden sm:flex items-center gap-2 transition-all active:scale-95 border border-slate-500 backdrop-blur-md landscape:max-lg:bottom-2 landscape:max-lg:left-2 landscape:max-lg:px-2 landscape:max-lg:py-1 landscape:max-lg:text-[10px]"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Back to Menu</span>
      </a>
    </div>
  );
};

export default App;