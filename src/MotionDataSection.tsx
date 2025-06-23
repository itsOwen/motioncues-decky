import { useState, useEffect } from "react";
import {
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  ToggleField
} from "@decky/ui";
import { callable } from "@decky/api";

// Define interfaces
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

interface MotionDataResponse {
  status: string;
  latest_data?: MotionData;
  monitoring: boolean;
  alerts: any[];
  history_count: number;
  message?: string;
}

interface ServiceStatus {
  status: string;
  installed: boolean;
  running: boolean;
}

// Define callables
const checkServiceStatus = callable<[], ServiceStatus>("check_service_status");
const getMotionData = callable<[], MotionDataResponse>("get_motion_data");
const startMotionMonitoring = callable<[], any>("start_motion_monitoring");
const logError = callable<[string], void>("log_error");

const MotionDataSection = () => {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [motionData, setMotionData] = useState<MotionDataResponse | null>(null);
  const [showRawData, setShowRawData] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkServiceStatus();
        setServiceStatus(status);
      } catch (error) {
        await logError(`MotionDataSection -> checkStatus: ${String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateMotionData = async () => {
      try {
        if (serviceStatus?.running && autoRefresh) {
          const data = await getMotionData();
          setMotionData(data);
        }
      } catch (error) {
        await logError(`Motion data update error: ${String(error)}`);
      }
    };

    if (serviceStatus?.running && autoRefresh) {
      const interval = setInterval(updateMotionData, 200); // Update every 200ms for smooth display
      return () => clearInterval(interval);
    }
    
    return () => {}; // Always return a cleanup function
  }, [serviceStatus?.running, autoRefresh]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp / 1000); // Convert microseconds to milliseconds
    return date.toLocaleTimeString() + '.' + String(date.getMilliseconds()).padStart(3, '0');
  };

  const getMotionIntensity = (magnitude: number, type: 'accel' | 'gyro'): { level: string; color: string; icon: string } => {
    if (type === 'accel') {
      if (magnitude > 1.5) return { level: 'High', color: '#f44336', icon: '🔴' };
      if (magnitude > 1.2) return { level: 'Medium', color: '#ff9800', icon: '🟠' };
      if (magnitude > 1.05) return { level: 'Low', color: '#ffeb3b', icon: '🟡' };
      return { level: 'Stable', color: '#4caf50', icon: '🟢' };
    } else {
      if (magnitude > 50) return { level: 'High', color: '#f44336', icon: '🔴' };
      if (magnitude > 20) return { level: 'Medium', color: '#ff9800', icon: '🟠' };
      if (magnitude > 5) return { level: 'Low', color: '#ffeb3b', icon: '🟡' };
      return { level: 'Stable', color: '#4caf50', icon: '🟢' };
    }
  };

  const renderMotionVisualization = () => {
    if (!motionData?.latest_data) return null;

    const data = motionData.latest_data;
    const accelIntensity = getMotionIntensity(data.magnitude.accel, 'accel');
    const gyroIntensity = getMotionIntensity(data.magnitude.gyro, 'gyro');

    return (
      <div style={{
        padding: '12px',
        backgroundColor: 'var(--decky-highlighted-ui-bg)',
        borderRadius: '4px',
        border: '1px solid var(--decky-subtle-border)',
        fontSize: '0.85em'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' }}>
          📊 Live Motion Data - Frame {data.frameId}
        </div>
        
        {/* Motion Status Indicators */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            textAlign: 'center',
            border: `2px solid ${accelIntensity.color}`
          }}>
            <div style={{ fontSize: '1.2em', marginBottom: '4px' }}>
              {accelIntensity.icon}
            </div>
            <div style={{ fontWeight: 'bold' }}>Accelerometer</div>
            <div style={{ color: accelIntensity.color }}>
              {accelIntensity.level}
            </div>
            <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
              {data.magnitude.accel.toFixed(3)}g
            </div>
          </div>
          
          <div style={{
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            textAlign: 'center',
            border: `2px solid ${gyroIntensity.color}`
          }}>
            <div style={{ fontSize: '1.2em', marginBottom: '4px' }}>
              {gyroIntensity.icon}
            </div>
            <div style={{ fontWeight: 'bold' }}>Gyroscope</div>
            <div style={{ color: gyroIntensity.color }}>
              {gyroIntensity.level}
            </div>
            <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
              {data.magnitude.gyro.toFixed(1)}°/s
            </div>
          </div>
        </div>

        {/* Detailed Values */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px',
          fontSize: '0.8em'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              📐 Accelerometer (g)
            </div>
            <div>X: {data.accel.x.toFixed(3)}</div>
            <div>Y: {data.accel.y.toFixed(3)}</div>
            <div>Z: {data.accel.z.toFixed(3)}</div>
          </div>
          
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              🔄 Gyroscope (°/s)
            </div>
            <div>Pitch: {data.gyro.pitch.toFixed(1)}</div>
            <div>Yaw: {data.gyro.yaw.toFixed(1)}</div>
            <div>Roll: {data.gyro.roll.toFixed(1)}</div>
          </div>
        </div>

        <div style={{ 
          marginTop: '12px', 
          paddingTop: '8px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.75em',
          opacity: 0.8,
          textAlign: 'center'
        }}>
          Last Update: {formatTimestamp(data.timestamp)}
        </div>
      </div>
    );
  };

  const renderRawDataView = () => {
    if (!motionData?.latest_data) return null;

    return (
      <div style={{
        padding: '12px',
        backgroundColor: 'var(--decky-selected-ui-bg)',
        borderRadius: '4px',
        fontSize: '0.75em',
        fontFamily: 'monospace',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          🔧 Raw JSON Data
        </div>
        <pre style={{ 
          margin: 0, 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-word',
          lineHeight: '1.4'
        }}>
          {JSON.stringify(motionData.latest_data, null, 2)}
        </pre>
      </div>
    );
  };

  if (loading) {
    return (
      <PanelSection title="Motion Data">
        <PanelSectionRow>
          <div>🔄 Loading motion data interface...</div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  if (!serviceStatus?.installed) {
    return (
      <PanelSection title="Motion Data">
        <PanelSectionRow>
          <div style={{ fontSize: '0.9em', opacity: 0.7 }}>
            Install the Motion Service first to view real-time motion data.
          </div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  if (!serviceStatus.running) {
    return (
      <PanelSection title="Motion Data">
        <PanelSectionRow>
          <div style={{ fontSize: '0.9em', opacity: 0.7 }}>
            Start the Motion Service to view real-time motion data.
          </div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  return (
    <PanelSection title="Motion Data">
      <PanelSectionRow>
        <ToggleField
          label="Auto Refresh"
          description="Automatically update motion data display"
          checked={autoRefresh}
          onChange={setAutoRefresh}
        />
      </PanelSectionRow>

      {motionData?.monitoring ? (
        <>
          <PanelSectionRow>
            {renderMotionVisualization()}
          </PanelSectionRow>

          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={() => setShowRawData(!showRawData)}
            >
              {showRawData ? "📊 Show Visualization" : "🔧 Show Raw Data"}
            </ButtonItem>
          </PanelSectionRow>
          
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={async () => {
                const data = await getMotionData();
                setMotionData(data);
              }}
            >
              🔄 Refresh Now
            </ButtonItem>
          </PanelSectionRow>

          {showRawData && (
            <PanelSectionRow>
              {renderRawDataView()}
            </PanelSectionRow>
          )}

          <PanelSectionRow>
            <div style={{
              padding: '8px',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderRadius: '4px',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              fontSize: '0.8em'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                📈 Data Collection Stats
              </div>
              <div>Total samples: {motionData.history_count}</div>
              <div>Recent alerts: {motionData.alerts.length}</div>
              <div>Update rate: ~5 Hz (200ms intervals)</div>
            </div>
          </PanelSectionRow>
        </>
      ) : (
        <PanelSectionRow>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            borderRadius: '4px',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '12px', fontSize: '2em' }}>⚠️</div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              Motion Monitoring Not Active
            </div>
            <div style={{ fontSize: '0.9em', marginBottom: '12px' }}>
              Enable motion monitoring in the Service Management section to view real-time data.
            </div>
            <ButtonItem
              layout="below"
              onClick={async () => {
                await startMotionMonitoring();
                const data = await getMotionData();
                setMotionData(data);
              }}
            >
              ▶️ Start Monitoring
            </ButtonItem>
          </div>
        </PanelSectionRow>
      )}

      <PanelSectionRow>
        <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '8px' }}>
          Real-time accelerometer and gyroscope data from your Steam Deck's built-in sensors. 
          Data is collected at ~60Hz and displayed at 5Hz for smooth visualization.
        </div>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default MotionDataSection;