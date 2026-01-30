
export interface RomData {
  name: string;
  data: string; // Binary string or base64
}

// JSNES Global declarations
declare global {
  interface Window {
    jsnes: any;
  }
}

export interface NesControllerState {
  UP: boolean;
  DOWN: boolean;
  LEFT: boolean;
  RIGHT: boolean;
  A: boolean;
  B: boolean;
  START: boolean;
  SELECT: boolean;
}

export enum ControllerButton {
  UP = 1 << 4,
  DOWN = 1 << 5,
  LEFT = 1 << 6,
  RIGHT = 1 << 7,
  A = 1 << 0,
  B = 1 << 1,
  SELECT = 1 << 2,
  START = 1 << 3,
}
