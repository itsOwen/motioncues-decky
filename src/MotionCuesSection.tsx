import { useState, useEffect } from "react";
import {
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  ToggleField,
  DropdownItem
} from "@decky/ui";
import { callable } from "@decky/api";

// Define interfaces
interface ServiceResult {
  status: string;
  message?: string;
}

interface ServiceStatus {
  status: string;
  installed: boolean;
  running: boolean;
}

interface MotionSettings {
  status: string;
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

interface MotionAlert {
  timestamp: number;
  level: string;
  gyro: number;
  accel: number;
  cue_types: string[];
}

interface MotionDataResponse {
  status: string;
  monitoring: boolean;
  alerts: MotionAlert[];
}

interface SensitivityOption {
  label: string;
  value: number;
  description: string;
}

interface CueTypeOption {
  label: string;
  value: string;
  description: string;
}

// Define callables
const checkServiceStatus = callable<[], ServiceStatus>("check_service_status");
const getMotionSettings = callable<[], MotionSettings>("get_motion_settings");
const setMotionCuesEnabled = callable<[boolean], ServiceResult>("set_motion_cues_enabled");
const setMotionSensitivity = callable<[number], ServiceResult>("set_motion_sensitivity");
const setCueTypes = callable<[string[]], ServiceResult>("set_cue_types");
const getMotionData = callable<[], MotionDataResponse>("get_motion_data");
const clearMotionAlerts = callable<[], ServiceResult>("clear_motion_alerts");
const logError = callable<[string], void>("log_error");

const MotionCuesSection = () => {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [motionSettings, setMotionSettingsState] = useState<MotionSettings | null>(null);
  const [motionData, setMotionData] = useState<MotionDataResponse | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const sensitivityOptions: SensitivityOption[] = [
    { 
      label: 'Low Sensitivity', 
      value: 1, 
      description: 'Only triggers on very intense motion (50°/s gyro, 1.5g accel)' 
    },
    { 
      label: 'Medium Sensitivity', 
      value: 2, 
      description: 'Balanced detection for typical gaming (30°/s gyro, 1.3g accel)' 
    },
    { 
      label: 'High Sensitivity', 
      value: 3, 
      description: 'Triggers on smaller motions (20°/s gyro, 1.1g accel)' 
    }
  ];

  const cueTypeOptions: CueTypeOption[] = [
    { 
      label: 'Visual Cues', 
      value: 'visual', 
      description: 'On-screen notifications and visual indicators' 
    },
    { 
      label: 'Haptic Feedback', 
      value: 'haptic', 
      description: 'Steam Deck vibration/rumble feedback' 
    },
    { 
      label: 'Audio Alerts', 
      value: 'audio', 
      description: 'Sound notifications for motion events' 
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [status, settings, data] = await Promise.all([
          checkServiceStatus(),
          getMotionSettings(),
          getMotionData()
        ]);
        
        setServiceStatus(status);
        setMotionSettingsState(settings);
        setMotionData(data);
      } catch (error) {
        await logError(`MotionCuesSection -> loadData: ${String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCuesToggle = async () => {
    if (!motionSettings) return;

    try {
      setResult('Updating motion cues...');
      
      const response = await setMotionCuesEnabled(!motionSettings.cues_enabled);
      
      if (response.status === "success") {
        setResult(`✅ Motion cues ${!motionSettings.cues_enabled ? 'enabled' : 'disabled'}`);
        
        // Update settings
        const newSettings = await getMotionSettings();
        setMotionSettingsState(newSettings);
      } else {
        setResult(`❌ Failed: ${response.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${String(error)}`);
      await logError(`Motion cues toggle error: ${String(error)}`);
    }
  };

  const handleSensitivityChange = async (level: number) => {
    try {
      setResult('Updating sensitivity...');
      
      const response = await setMotionSensitivity(level);
      
      if (response.status === "success") {
        setResult(`✅ Sensitivity set to ${sensitivityOptions.find(o => o.value === level)?.label}`);
        
        // Update settings
        const newSettings = await getMotionSettings();
        setMotionSettingsState(newSettings);
      } else {
        setResult(`❌ Failed: ${response.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${String(error)}`);
      await logError(`Sensitivity change error: ${String(error)}`);
    }
  };

  const handleCueTypeToggle = async (cueType: string) => {
    if (!motionSettings) return;

    try {
      const currentTypes = motionSettings.cue_types;
      const newTypes = currentTypes.includes(cueType)
        ? currentTypes.filter(t => t !== cueType)
        : [...currentTypes, cueType];

      setResult('Updating cue types...');
      
      const response = await setCueTypes(newTypes);
      
      if (response.status === "success") {
        setResult(`✅ Cue types updated`);
        
        // Update settings
        const newSettings = await getMotionSettings();
        setMotionSettingsState(newSettings);
      } else {
        setResult(`❌ Failed: ${response.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${String(error)}`);
      await logError(`Cue type toggle error: ${String(error)}`);
    }
  };

  const handleClearAlerts = async () => {
    try {
      const response = await clearMotionAlerts();
      
      if (response.status === "success") {
        setResult('✅ Motion alerts cleared');
        
        // Update data
        const newData = await getMotionData();
        setMotionData(newData);
      } else {
        setResult(`❌ Failed: ${response.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${String(error)}`);
      await logError(`Clear alerts error: ${String(error)}`);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'severe': return '#f44336';
      case 'moderate': return '#ff9800';
      case 'mild': return '#ffeb3b';
      default: return '#9e9e9e';
    }
  };

  const getLevelIcon = (level: string): string => {
    switch (level) {
      case 'severe': return '🔴';
      case 'moderate': return '🟠';
      case 'mild': return '🟡';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <PanelSection title="Motion Cues">
        <PanelSectionRow>
          <div>🔄 Loading motion cues settings...</div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  if (!serviceStatus?.installed) {
    return (
      <PanelSection title="Motion Cues">
        <PanelSectionRow>
          <div style={{ fontSize: '0.9em', opacity: 0.7 }}>
            Install the Motion Service first to enable motion cues functionality.
          </div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  if (!serviceStatus.running) {
    return (
      <PanelSection title="Motion Cues">
        <PanelSectionRow>
          <div style={{ fontSize: '0.9em', opacity: 0.7 }}>
            Start the Motion Service to configure motion cues.
          </div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  return (
    <PanelSection title="Motion Cues">
      <PanelSectionRow>
        <div style={{
          padding: '12px',
          backgroundColor: 'var(--decky-highlighted-ui-bg)',
          borderRadius: '4px',
          border: '1px solid var(--decky-subtle-border)',
          fontSize: '0.85em',
          marginBottom: '12px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
            🍃 Motion Cues for Motion Sickness Prevention
          </div>
          <div>
            Similar to Apple's motion cues, this feature analyzes your Steam Deck's motion 
            and provides alerts when detecting patterns that may cause motion sickness during gaming.
          </div>
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <ToggleField
          label="Enable Motion Cues"
          description={motionSettings?.cues_enabled ? 
            "Motion cues are active and monitoring for motion patterns" : 
            "Enable intelligent motion sickness prevention"
          }
          checked={motionSettings?.cues_enabled || false}
          onChange={handleCuesToggle}
        />
      </PanelSectionRow>

      {motionSettings?.cues_enabled && (
        <>
          <PanelSectionRow>
            <DropdownItem
              label="Sensitivity Level"
              description={sensitivityOptions.find(o => o.value === motionSettings.sensitivity_level)?.description || ''}
              rgOptions={sensitivityOptions.map(option => ({
                data: option.value,
                label: option.label
              }))}
              selectedOption={motionSettings.sensitivity_level}
              onChange={(option) => handleSensitivityChange(option.data)}
            />
          </PanelSectionRow>

          <PanelSectionRow>
            <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9em' }}>
              Cue Types:
            </div>
            {cueTypeOptions.map(cueType => (
              <div key={cueType.value} style={{ marginBottom: '8px' }}>
                <ToggleField
                  label={cueType.label}
                  description={cueType.description}
                  checked={motionSettings.cue_types.includes(cueType.value)}
                  onChange={() => handleCueTypeToggle(cueType.value)}
                />
              </div>
            ))}
          </PanelSectionRow>

          {motionSettings.thresholds && (
            <PanelSectionRow>
              <div style={{
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
                fontSize: '0.8em'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                  📊 Current Thresholds ({motionSettings.sensitivity_name})
                </div>
                <div>Gyroscope: {motionSettings.thresholds.gyro}°/sec</div>
                <div>Accelerometer: {motionSettings.thresholds.accel}g</div>
                <div>Time window: {motionSettings.thresholds.time_window}s</div>
              </div>
            </PanelSectionRow>
          )}

          {motionData?.monitoring && (
            <PanelSectionRow>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--decky-selected-ui-bg)',
                borderRadius: '4px',
                fontSize: '0.85em'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontWeight: 'bold' }}>
                    🚨 Recent Motion Alerts ({motionData.alerts.length})
                  </div>
                  {motionData.alerts.length > 0 && (
                    <ButtonItem
                      layout="below"
                      onClick={handleClearAlerts}
                    >
                      Clear
                    </ButtonItem>
                  )}
                </div>
                
                {motionData.alerts.length === 0 ? (
                  <div style={{ opacity: 0.7 }}>No recent motion alerts</div>
                ) : (
                  <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                    {motionData.alerts.slice(-5).reverse().map((alert, index) => (
                      <div key={index} style={{
                        padding: '6px',
                        marginBottom: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '3px',
                        fontSize: '0.8em',
                        borderLeft: `3px solid ${getLevelColor(alert.level)}`
                      }}>
                        <div style={{ fontWeight: 'bold' }}>
                          {getLevelIcon(alert.level)} {alert.level.toUpperCase()} Motion
                        </div>
                        <div>
                          {formatTimestamp(alert.timestamp)} - 
                          Gyro: {alert.gyro.toFixed(1)}°/s, 
                          Accel: {alert.accel.toFixed(2)}g
                        </div>
                        <div style={{ opacity: 0.8 }}>
                          Cues: {alert.cue_types.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PanelSectionRow>
          )}
        </>
      )}

      {result && (
        <PanelSectionRow>
          <div style={{
            padding: '12px',
            marginTop: '8px',
            backgroundColor: 'var(--decky-selected-ui-bg)',
            borderRadius: '4px',
            fontSize: '0.9em'
          }}>
            {result}
          </div>
        </PanelSectionRow>
      )}

      <PanelSectionRow>
        <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '8px' }}>
          Motion cues help prevent motion sickness by alerting you to movement patterns 
          that commonly trigger symptoms during gaming.
        </div>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default MotionCuesSection;