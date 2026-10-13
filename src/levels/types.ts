export type V3 = [number, number, number];
type Base = { position: V3; color?: number; rotation?: V3 };
export type Piece =
  | (Base & { type: 'box' | 'ramp'; size: V3; seesaw?: boolean })
  | (Base & { type: 'cylinder'; radius: number; height: number })
  | (Base & { type: 'movingPlatform'; size: V3; axis: 'x' | 'z'; travel: number; period: number; phase: number })
  | (Base & { type: 'pendulum'; length: number; period: number; phase: number })
  | (Base & { type: 'windZone'; size: V3; force: number; phase: number })
  | (Base & { type: 'checkpoint'; radius: number })
  | (Base & { type: 'goal'; radius: number });
export interface Level { id: number; name: string; subtitle: string; cargo: 'pizza' | 'crates' | 'egg'; length: number; target: string; start: V3; killY: number; pieces: Piece[]; }
export const palette = { ground: 0xf4d35e, accent: 0xee6c4d, hazard: 0x3d5a80, cargo: 0x98c1d9, goal: 0x7bd389 };
