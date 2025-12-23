export const PHYSICS = {
  GRAVITY: 9.8,
  FRAME_RATE: 60,
  DT: 1 / 60,
  PIXELS_PER_METER: 10, // Scale factor
  MAX_TRAIL_LENGTH: 50,
  TRAIL_FADE_SPEED: 0.02,
};

export const COLORS = {
  BLOSSOM: '#ff69b4', // Pink
  BUBBLES: '#00d2ff', // Light Blue
  BUTTERCUP: '#32cd32', // Light Green
  TRACK_ACCENT: '#334155',
  TRACK_BG: '#1e293b',
};

export const CHARACTERS = [
  {
    id: 'blossom',
    name: 'Blossom',
    color: COLORS.BLOSSOM,
    image: '/assets/blossom.png',
  },
  {
    id: 'bubbles',
    name: 'Bubbles',
    color: COLORS.BUBBLES,
    image: '/assets/bubbles.png',
  },
  {
    id: 'buttercup',
    name: 'Buttercup',
    color: COLORS.BUTTERCUP,
    image: '/assets/buttercup.png',
  }
];

export const INITIAL_VARIABLES: Record<string, any> = {
  force: 50,
  mass: 5,
  friction: 0.1,
  airResistance: 0.2,
  maxDistance: 300,
  timeScale: 1.0,
  velocity: 10,
};