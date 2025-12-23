export interface MotionVariables {
  force: number;
  mass: number;
  friction: number;
  airResistance: number;
  maxDistance: number;
  timeScale: number;
  velocity: number;
}

export interface SimulationObjectState {
  id: string;
  name: string;
  color: string;
  image: string;
  position: number; // x in meters
  velocity: number; // m/s
  acceleration: number; // m/s^2
  variables: MotionVariables;
  trail: { x: number; y: number; opacity: number }[];
  isFinished: boolean;
}

export enum SimulationStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}