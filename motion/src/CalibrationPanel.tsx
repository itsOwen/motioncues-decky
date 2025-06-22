import { FC, useState } from "react";
import {
  Focusable,
  DialogButton,
  Field,
  Spinner
} from "@decky/ui";

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

interface CalibrationPanelProps {
  motionData: MotionData;
  onCancel: () => void;
  onComplete: (scaleX: number, scaleY: number, scaleZ: number) => void;
  onSetOffsets: () => Promise<void>;
}

const CalibrationPanel: FC<CalibrationPanelProps> = ({ 
  motionData, 
  onCancel, 
  onComplete, 
  onSetOffsets 
}) => {
  const [step, setStep] = useState<number>(1);
  const [settingOffsets, setSettingOffsets] = useState<boolean>(false);
  const [scaleX, setScaleX] = useState<number>(1.0);
  const [scaleY, setScaleY] = useState<number>(1.0);
  const [scaleZ, setScaleZ] = useState<number>(1.0);
  
  // Format motion values for display
  const formatValue = (value: number) => value.toFixed(3);
  
  // Handle set offsets button
  const handleSetOffsets = async () => {
    setSettingOffsets(true);
    await onSetOffsets();
    setSettingOffsets(false);
    setStep(2);
  };
  
  // Handle complete button
  const handleComplete = () => {
    onComplete(scaleX, scaleY, scaleZ);
  };
  
  // Render calibration instructions based on current step
  const renderInstructions = () => {
    switch (step) {
      case 1:
        return (
          <div style={{ marginBottom: '16px' }}>
            <p>Place your Steam Deck on a flat, level surface and keep it still.</p>
            <p>This will calibrate the motion sensors to correctly detect acceleration.</p>
            <p>Press "Set Zero Position" when ready.</p>
          </div>
        );
      case 2:
        return (
          <div style={{ marginBottom: '16px' }}>
            <p>Now you can adjust the sensitivity for each axis.</p>
            <p>If motion cues appear too sensitive or not sensitive enough, adjust these values.</p>
            <p>Higher values = more sensitive, Lower values = less sensitive.</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Render calibration step 1 (setting offsets)
  const renderStep1 = () => {
    return (
      <>
        <div style={{ marginBottom: '16px' }}>
          <div>Current Accelerometer Values:</div>
          <div>X: {formatValue(motionData.accel_x)}</div>
          <div>Y: {formatValue(motionData.accel_y)}</div>
          <div>Z: {formatValue(motionData.accel_z)}</div>
        </div>
        
        <DialogButton
          onClick={handleSetOffsets}
          disabled={settingOffsets}
        >
          {settingOffsets ? <Spinner /> : "Set Zero Position"}
        </DialogButton>
      </>
    );
  };
  
  // Render calibration step 2 (setting scales)
  const renderStep2 = () => {
    return (
      <>
        <Field 
          label="X-Axis Sensitivity"
          description="Left-right motion sensitivity"
          bottomSeparator="none"
        >
          <Focusable style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={scaleX}
                onChange={(e) => setScaleX(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginLeft: '10px', minWidth: '40px', textAlign: 'right' }}>
              {scaleX.toFixed(1)}
            </div>
          </Focusable>
        </Field>
        
        <Field 
          label="Y-Axis Sensitivity"
          description="Front-back motion sensitivity"
          bottomSeparator="none"
        >
          <Focusable style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={scaleY}
                onChange={(e) => setScaleY(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginLeft: '10px', minWidth: '40px', textAlign: 'right' }}>
              {scaleY.toFixed(1)}
            </div>
          </Focusable>
        </Field>
        
        <Field 
          label="Z-Axis Sensitivity"
          description="Up-down motion sensitivity"
          bottomSeparator="none"
        >
          <Focusable style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={scaleZ}
                onChange={(e) => setScaleZ(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginLeft: '10px', minWidth: '40px', textAlign: 'right' }}>
              {scaleZ.toFixed(1)}
            </div>
          </Focusable>
        </Field>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
          <DialogButton onClick={() => setStep(1)}>
            Back
          </DialogButton>
          <DialogButton onClick={handleComplete}>
            Complete Calibration
          </DialogButton>
        </div>
      </>
    );
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      padding: '24px',
      borderRadius: '8px',
      maxWidth: '80%',
      zIndex: 10000,
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Calibrate Motion Sensors</h3>
      
      {renderInstructions()}
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      
      {step === 1 && (
        <DialogButton onClick={onCancel} style={{ marginTop: '16px' }}>
          Cancel
        </DialogButton>
      )}
    </div>
  );
};

export default CalibrationPanel;