// src/MotionOverlay.tsx
import { FC, useEffect, useState } from "react";
import { MotionDataPoint } from "./types";

interface MotionData {
  accel_x: number;
  accel_y: number;
  accel_z: number;
  gyro_pitch: number;
  gyro_yaw: number;
  gyro_roll: number;
  timestamp: number;
  fresh: boolean;
}

interface CalibrationSettings {
  offset_x: number;
  offset_y: number;
  offset_z: number;
  scale_x: number;
  scale_y: number;
  scale_z: number;
}

interface PluginSettings {
  enabled: boolean;
  sensitivity: number;
  visual_style: string;
  color: string;
  opacity: number;
  auto_activate: boolean;
  calibration: CalibrationSettings;
}

interface MotionOverlayProps {
  motionData: MotionData;
  settings: PluginSettings;
}

// Helper function to convert motion data to a value between 0-1 for visual rendering
const normalizeMotionValue = (value: number, sensitivity: number): number => {
  // Apply sensitivity - higher sensitivity = lower threshold
  const threshold = 0.1 + (1.0 - sensitivity) * 0.4;
  
  // Calculate how much the value deviates from 1.0 (normal gravity)
  const deviation = Math.abs(value - 1.0);
  
  // Scale from threshold to 1.0
  return Math.min(1.0, Math.max(0.0, (deviation - threshold) / (1.0 - threshold)));
};

// Keep track of motion history for smoother animations
const MAX_HISTORY_LENGTH = 5;

const MotionOverlay: FC<MotionOverlayProps> = ({ motionData, settings }) => {
  const [motionHistory, setMotionHistory] = useState<MotionDataPoint[]>([]);
  
  // Update motion history
  useEffect(() => {
    // Create a new motion data point
    const newPoint: MotionDataPoint = {
      x: normalizeMotionValue(motionData.accel_x, settings.sensitivity),
      y: normalizeMotionValue(motionData.accel_y, settings.sensitivity),
      z: normalizeMotionValue(motionData.accel_z, settings.sensitivity),
      pitch: motionData.gyro_pitch,
      yaw: motionData.gyro_yaw,
      roll: motionData.gyro_roll,
      timestamp: motionData.timestamp
    };
    
    // Add to history and maintain maximum length
    setMotionHistory(prev => {
      const newHistory = [newPoint, ...prev];
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        return newHistory.slice(0, MAX_HISTORY_LENGTH);
      }
      return newHistory;
    });
  }, [motionData, settings.sensitivity]);
  
  // Calculate smoothed motion values for rendering
  const getSmoothedValue = (axis: 'x' | 'y' | 'z'): number => {
    if (motionHistory.length === 0) return 0;
    
    // Weight more recent values higher
    let totalWeight = 0;
    let weightedSum = 0;
    
    motionHistory.forEach((point, index) => {
      const weight = MAX_HISTORY_LENGTH - index;
      totalWeight += weight;
      weightedSum += point[axis] * weight;
    });
    
    return weightedSum / totalWeight;
  };
  
  // Render different visual styles
  const renderVisualCues = () => {
    const xValue = getSmoothedValue('x');
    const yValue = getSmoothedValue('y');
    const zValue = getSmoothedValue('z');
    
    // Common style settings
    const color = settings.color;
    const opacity = settings.opacity;
    
    switch (settings.visual_style) {
      case "edge_lines":
        return renderEdgeLines(xValue, yValue, color, opacity);
      case "corner_dots":
        return renderCornerDots(xValue, yValue, color, opacity);
      case "center_circle":
        return renderCenterCircle(xValue, yValue, zValue, color, opacity);
      default:
        return renderEdgeLines(xValue, yValue, color, opacity);
    }
  };
  
  // Edge lines style (similar to Apple motion cues)
  const renderEdgeLines = (x: number, y: number, color: string, opacity: number) => {
    const lineThickness = 4;
    const maxLength = 100;
    
    return (
      <>
        {/* Top edge */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${maxLength * x}px`,
          height: `${lineThickness}px`,
          backgroundColor: color,
          opacity: opacity * x,
          transition: 'width 0.1s ease-out, opacity 0.1s ease-out'
        }} />
        
        {/* Bottom edge */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${maxLength * x}px`,
          height: `${lineThickness}px`,
          backgroundColor: color,
          opacity: opacity * x,
          transition: 'width 0.1s ease-out, opacity 0.1s ease-out'
        }} />
        
        {/* Left edge */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: `${lineThickness}px`,
          height: `${maxLength * y}px`,
          backgroundColor: color,
          opacity: opacity * y,
          transition: 'height 0.1s ease-out, opacity 0.1s ease-out'
        }} />
        
        {/* Right edge */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: `${lineThickness}px`,
          height: `${maxLength * y}px`,
          backgroundColor: color,
          opacity: opacity * y,
          transition: 'height 0.1s ease-out, opacity 0.1s ease-out'
        }} />
      </>
    );
  };
  
  // Corner dots style
  const renderCornerDots = (x: number, y: number, color: string, opacity: number) => {
    const dotSize = 10;
    const maxOffset = 30;
    
    return (
      <>
        {/* Top-left corner */}
        <div style={{
          position: 'absolute',
          top: `${maxOffset * y}px`,
          left: `${maxOffset * x}px`,
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: color,
          opacity: opacity * Math.max(x, y),
          transition: 'all 0.1s ease-out'
        }} />
        
        {/* Top-right corner */}
        <div style={{
          position: 'absolute',
          top: `${maxOffset * y}px`,
          right: `${maxOffset * x}px`,
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: color,
          opacity: opacity * Math.max(x, y),
          transition: 'all 0.1s ease-out'
        }} />
        
        {/* Bottom-left corner */}
        <div style={{
          position: 'absolute',
          bottom: `${maxOffset * y}px`,
          left: `${maxOffset * x}px`,
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: color,
          opacity: opacity * Math.max(x, y),
          transition: 'all 0.1s ease-out'
        }} />
        
        {/* Bottom-right corner */}
        <div style={{
          position: 'absolute',
          bottom: `${maxOffset * y}px`,
          right: `${maxOffset * x}px`,
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: color,
          opacity: opacity * Math.max(x, y),
          transition: 'all 0.1s ease-out'
        }} />
      </>
    );
  };
  
  // Center circle style
  const renderCenterCircle = (x: number, y: number, z: number, color: string, opacity: number) => {
    const baseSize = 20;
    const maxSize = 80;
    const size = baseSize + (maxSize - baseSize) * Math.max(x, y, z);
    
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: 'transparent',
        border: `2px solid ${color}`,
        opacity: opacity * Math.max(x, y, z),
        transition: 'all 0.1s ease-out'
      }} />
    );
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 9999,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      {renderVisualCues()}
    </div>
  );
};

export default MotionOverlay;