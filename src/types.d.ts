declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

// Steam Deck Motion Service Types
declare global {
  interface MotionData {
    timestamp: number;
    accel: {
      x: number;
      y: number;
      z: number;
    };
    gyro: {
      pitch: number;
      yaw: number;
      roll: number;
    };
    magnitude: {
      accel: number;
      gyro: number;
    };
    frameId: number;
  }

  interface MotionAlert {
    timestamp: number;
    level: 'mild' | 'moderate' | 'severe';
    gyro: number;
    accel: number;
    cue_types: string[];
  }

  interface MotionSettings {
    cues_enabled: boolean;
    sensitivity_level: number;
    sensitivity_name: string;
    cue_types: string[];
    thresholds: {
      gyro: number;
      accel: number;
      time_window: number;
    };
  }
}