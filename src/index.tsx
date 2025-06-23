// src/index.tsx
import { useState, useEffect } from "react";
import {
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  ToggleField,
  SliderField,
  showModal,
  ConfirmModal
} from "@decky/ui";
import { definePlugin, callable } from "@decky/api";
import { FiActivity } from "react-icons/fi";

// Import components
import MotionOverlay from "./MotionOverlay";
import CalibrationPanel from "./CalibrationPanel";

// Define interfaces
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

interface ServiceStatus {
  installed: boolean;
  running: boolean;
}

// Define callable functions
const checkDsuInstalled = callable<[], ServiceStatus>("check_dsu_installed");
const installDsu = callable<[], any>("install_dsu");
const uninstallDsu = callable<[], any>("uninstall_dsu");
const startDsuService = callable<[], any>("start_dsu_service");
const stopDsuService = callable<[], any>("stop_dsu_service");
const toggleEnabled = callable<[boolean], any>("toggle_enabled");
const getMotionData = callable<[], MotionData>("get_motion_data");
const updateSettings = callable<[Partial<PluginSettings>], any>("update_settings");
const getSettings = callable<[], PluginSettings>("get_settings");
const setCalibrationOffsets = callable<[], any>("set_calibration_offsets");
const finishCalibration = callable<[number, number, number], any>("finish_calibration");

// Main plugin component
function MotionComfortContent() {
  // States
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({ installed: false, running: false });
  const [installing, setInstalling] = useState<boolean>(false);
  const [uninstalling, setUninstalling] = useState<boolean>(false);
  const [motionData, setMotionData] = useState<MotionData | null>(null);
  const [settings, setSettings] = useState<PluginSettings | null>(null);
  const [dataUpdateInterval, setDataUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [showCalibration, setShowCalibration] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("Loading initial data...");
        const status = await checkDsuInstalled();
        console.log("Initial status:", status);
        setServiceStatus(status);
        
        const loadedSettings = await getSettings();
        console.log("Loaded settings:", loadedSettings);
        setSettings(loadedSettings);

        if (status.running && loadedSettings.enabled) {
          startDataUpdates();
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    
    loadInitialData();
    
    // Set up regular service status check (more frequent)
    const statusInterval = setInterval(async () => {
      try {
        const status = await checkDsuInstalled();
        console.log("Status poll:", status);
        setServiceStatus(prevStatus => {
          // Only update if status actually changed
          if (prevStatus.installed !== status.installed || prevStatus.running !== status.running) {
            console.log("Status changed:", prevStatus, "->", status);
            return status;
          }
          return prevStatus;
        });
      } catch (error) {
        console.error("Error checking service status:", error);
      }
    }, 2000); // Check every 2 seconds for faster updates
    
    return () => {
      clearInterval(statusInterval);
      if (dataUpdateInterval) {
        clearInterval(dataUpdateInterval);
      }
    };
  }, []);

  // Start motion data updates
  const startDataUpdates = () => {
    if (dataUpdateInterval) {
      clearInterval(dataUpdateInterval);
    }
    
    const interval = setInterval(async () => {
      try {
        const data = await getMotionData();
        setMotionData(data);
        
        // Show overlay if auto-activate is enabled and we have fresh data
        if (settings?.auto_activate && data.fresh) {
          // Check if motion exceeds threshold (sensitivity)
          const threshold = 0.1 + (1.0 - (settings?.sensitivity || 0.5)) * 0.4;
          const motion = Math.sqrt(
            Math.pow(data.accel_x, 2) + 
            Math.pow(data.accel_y, 2) + 
            Math.pow(data.accel_z, 2)
          );
          
          if (Math.abs(motion - 1.0) > threshold) {
            setShowOverlay(true);
          } else {
            // Only hide if auto-activate is true
            setShowOverlay(false);
          }
        }
      } catch (error) {
        console.error("Error fetching motion data:", error);
      }
    }, 33); // ~30fps
    
    setDataUpdateInterval(interval);
  };

  // Stop motion data updates
  const stopDataUpdates = () => {
    if (dataUpdateInterval) {
      clearInterval(dataUpdateInterval);
      setDataUpdateInterval(null);
    }
    setShowOverlay(false);
  };

  // Manual refresh function
  const handleRefreshStatus = async () => {
    try {
      console.log("Manual refresh triggered");
      const status = await checkDsuInstalled();
      console.log("Manual refresh result:", status);
      setServiceStatus(status);
      
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
      
      if (status.running && loadedSettings.enabled) {
        startDataUpdates();
      }
    } catch (error) {
      console.error("Error during manual refresh:", error);
    }
  };

  // Handle install button click
  const handleInstall = async () => {
    try {
      setInstalling(true);
      console.log("Starting installation...");
      const result = await installDsu();
      console.log("Installation result:", result);
      
      if (result.status === "success") {
        // Force multiple status checks to ensure UI updates
        console.log("Installation successful, forcing status updates...");
        
        // Immediate check
        try {
          const status1 = await checkDsuInstalled();
          console.log("Immediate status check:", status1);
          setServiceStatus(status1);
        } catch (error) {
          console.error("Immediate status check failed:", error);
        }
        
        // Check after 1 second
        setTimeout(async () => {
          try {
            const status2 = await checkDsuInstalled();
            console.log("1-second delayed status check:", status2);
            setServiceStatus(status2);
            
            // If service is running and plugin is enabled, start data updates
            if (status2.running && settings?.enabled) {
              startDataUpdates();
            }
          } catch (error) {
            console.error("Error checking status after 1s:", error);
          }
        }, 1000);
        
        // Check after 3 seconds
        setTimeout(async () => {
          try {
            const status3 = await checkDsuInstalled();
            console.log("3-second delayed status check:", status3);
            setServiceStatus(status3);
          } catch (error) {
            console.error("Error checking status after 3s:", error);
          }
        }, 3000);
        
      } else {
        console.error("Installation failed:", result.message);
      }
    } catch (error) {
      console.error("Error installing DSU:", error);
    } finally {
      setInstalling(false);
    }
  };

  // Handle uninstall button click
  const handleUninstall = async () => {
    showModal(
      <ConfirmModal
        strTitle="Confirm Uninstallation"
        strDescription="Are you sure you want to uninstall SteamDeckGyroDSU? This will disable motion comfort features."
        strOKButtonText="Uninstall"
        strCancelButtonText="Cancel"
        onOK={async () => {
          try {
            setUninstalling(true);
            stopDataUpdates();
            const result = await uninstallDsu();
            if (result.status === "success") {
              // Force status update after uninstall
              setTimeout(async () => {
                try {
                  const status = await checkDsuInstalled();
                  setServiceStatus(status);
                } catch (error) {
                  console.error("Error checking status after uninstall:", error);
                  // Force UI update even if check fails
                  setServiceStatus({ installed: false, running: false });
                }
              }, 1000);
            } else {
              console.error("Uninstallation failed:", result.message);
            }
          } catch (error) {
            console.error("Error uninstalling DSU:", error);
          } finally {
            setUninstalling(false);
          }
        }}
      />
    );
  };

  // Handle service start/stop
  const handleServiceToggle = async () => {
    try {
      if (serviceStatus.running) {
        const result = await stopDsuService();
        if (result.status === "success") {
          setServiceStatus({ ...serviceStatus, running: false });
          stopDataUpdates();
        }
      } else {
        const result = await startDsuService();
        if (result.status === "success") {
          // Check status after a brief delay
          setTimeout(async () => {
            try {
              const status = await checkDsuInstalled();
              setServiceStatus(status);
              if (status.running && settings?.enabled) {
                startDataUpdates();
              }
            } catch (error) {
              console.error("Error checking status after service start:", error);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error toggling service:", error);
    }
  };

  // Handle enable/disable toggle
  const handleEnabledToggle = async (enabled: boolean) => {
    try {
      const result = await toggleEnabled(enabled);
      if (result.status === "success") {
        setSettings(prev => prev ? { ...prev, enabled } : null);
        
        if (enabled && serviceStatus.running) {
          startDataUpdates();
        } else {
          stopDataUpdates();
        }
      }
    } catch (error) {
      console.error("Error toggling enabled state:", error);
    }
  };

  // Handle sensitivity change
  const handleSensitivityChange = async (value: number) => {
    try {
      const result = await updateSettings({ sensitivity: value });
      if (result.status === "success") {
        setSettings(prev => prev ? { ...prev, sensitivity: value } : null);
      }
    } catch (error) {
      console.error("Error updating sensitivity:", error);
    }
  };

  // Handle overlay toggle
  const handleOverlayToggle = async (show: boolean) => {
    setShowOverlay(show);
    
    // If auto-activate is enabled, disable it when manually toggling
    if (settings?.auto_activate && show) {
      const result = await updateSettings({ auto_activate: false });
      if (result.status === "success") {
        setSettings(prev => prev ? { ...prev, auto_activate: false } : null);
      }
    }
  };

  // Handle auto-activate toggle
  const handleAutoActivateToggle = async (auto_activate: boolean) => {
    try {
      const result = await updateSettings({ auto_activate });
      if (result.status === "success") {
        setSettings(prev => prev ? { ...prev, auto_activate } : null);
      }
    } catch (error) {
      console.error("Error toggling auto-activate:", error);
    }
  };

  // Handle calibration button click
  const handleCalibrationClick = async () => {
    try {
      // We'll start calibration directly in the backend when opening the panel
      const result = await callable<[], any>("start_calibration")();
      if (result.status === "success") {
        setShowCalibration(true);
      }
    } catch (error) {
      console.error("Error starting calibration:", error);
    }
  };

  // Handle styles panel
  const handleStylesClick = () => {
    // For now, we'll just show a settings update in the main panel
    const visualStyles = [
      { label: "Edge Lines", value: "edge_lines" },
      { label: "Corner Dots", value: "corner_dots" },
      { label: "Center Circle", value: "center_circle" }
    ];
    
    const colors = [
      { label: "Green", value: "#00FF00" },
      { label: "Blue", value: "#00AAFF" },
      { label: "Red", value: "#FF0000" },
      { label: "Yellow", value: "#FFFF00" },
      { label: "White", value: "#FFFFFF" }
    ];

    // Show a simplified style settings in the main UI
    if (settings) {
      const modal = showModal(
        <div style={{ padding: "16px" }}>
          <h3>Visual Style Settings</h3>
          <p>Select the visual style for motion cues:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {visualStyles.map(style => (
              <button 
                key={style.value}
                onClick={async () => {
                  const result = await updateSettings({ visual_style: style.value });
                  if (result.status === "success") {
                    setSettings(prev => prev ? { ...prev, visual_style: style.value } : null);
                  }
                }}
                style={{
                  padding: "8px",
                  backgroundColor: settings.visual_style === style.value ? "#1a9fff" : "#2b2b2b",
                  border: "none",
                  borderRadius: "4px",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                {style.label}
              </button>
            ))}
          </div>
          
          <h4 style={{ marginTop: "16px" }}>Color</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {colors.map(color => (
              <div 
                key={color.value}
                onClick={async () => {
                  const result = await updateSettings({ color: color.value });
                  if (result.status === "success") {
                    setSettings(prev => prev ? { ...prev, color: color.value } : null);
                  }
                }}
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: color.value,
                  border: settings.color === color.value ? "2px solid white" : "2px solid transparent",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              />
            ))}
          </div>
          
          <h4 style={{ marginTop: "16px" }}>Opacity</h4>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.opacity}
              onChange={async (e) => {
                const value = parseFloat(e.target.value);
                const result = await updateSettings({ opacity: value });
                if (result.status === "success") {
                  setSettings(prev => prev ? { ...prev, opacity: value } : null);
                }
              }}
              style={{ width: "100%" }}
            />
            <div style={{ marginLeft: "8px", width: "40px" }}>{settings.opacity.toFixed(2)}</div>
          </div>
          
          <div style={{ 
            marginTop: "16px",
            width: "100%",
            height: "40px",
            backgroundColor: settings.color,
            opacity: settings.opacity,
            borderRadius: "4px"
          }} />
          
          <button
            onClick={() => modal.Close()}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              backgroundColor: "#1a9fff",
              border: "none",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
              width: "100%"
            }}
          >
            Close
          </button>
        </div>
      );
    }
  };

  // Render debug values
  const renderDebugValues = () => {
    if (!motionData) return null;
    
    const formatValue = (value: number) => value.toFixed(3);
    
    return (
      <PanelSectionRow>
        <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
          <div>Accel X: {formatValue(motionData.accel_x)}</div>
          <div>Accel Y: {formatValue(motionData.accel_y)}</div>
          <div>Accel Z: {formatValue(motionData.accel_z)}</div>
          <div>Gyro Pitch: {formatValue(motionData.gyro_pitch)}</div>
          <div>Gyro Yaw: {formatValue(motionData.gyro_yaw)}</div>
          <div>Gyro Roll: {formatValue(motionData.gyro_roll)}</div>
          <div>Data fresh: {motionData.fresh ? "Yes" : "No"}</div>
        </div>
      </PanelSectionRow>
    );
  };

  return (
    <>
      <PanelSection title="Motion Comfort">
        {/* Debug info - remove in production */}
        <PanelSectionRow>
          <div style={{ fontSize: '0.7em', opacity: 0.6, padding: '4px', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
            <div>Debug: installed={serviceStatus.installed.toString()}, running={serviceStatus.running.toString()}</div>
            <div>Settings loaded: {settings ? 'Yes' : 'No'}</div>
          </div>
        </PanelSectionRow>
        
        {/* Manual refresh button */}
        <PanelSectionRow>
          <ButtonItem 
            layout="below"
            onClick={handleRefreshStatus}
          >
            🔄 Refresh Status
          </ButtonItem>
        </PanelSectionRow>
        
        {!serviceStatus.installed ? (
          <PanelSectionRow>
            <ButtonItem 
              layout="below"
              onClick={handleInstall}
              disabled={installing}
            >
              {installing ? "Installing..." : "🔧 Install SteamDeckGyroDSU"}
            </ButtonItem>
          </PanelSectionRow>
        ) : (
          <>
            <PanelSectionRow>
              <div style={{ color: serviceStatus.running ? "green" : "red" }}>
                {serviceStatus.running ? "🟢 Service Running" : "🔴 Service Stopped"}
              </div>
            </PanelSectionRow>
            
            <PanelSectionRow>
              <ButtonItem
                layout="below"
                onClick={handleServiceToggle}
              >
                {serviceStatus.running ? "⏹️ Stop Service" : "▶️ Start Service"}
              </ButtonItem>
            </PanelSectionRow>
            
            {settings && (
              <>
                <PanelSectionRow>
                  <ToggleField
                    label="Enable Motion Comfort"
                    description="Display visual cues to reduce motion sickness"
                    checked={settings.enabled}
                    onChange={handleEnabledToggle}
                    disabled={!serviceStatus.running}
                  />
                </PanelSectionRow>
                
                {settings.enabled && (
                  <>
                    <PanelSectionRow>
                      <SliderField
                        label="Sensitivity"
                        value={settings.sensitivity}
                        min={0.1}
                        max={1.0}
                        step={0.05}
                        onChange={handleSensitivityChange}
                      />
                    </PanelSectionRow>
                    
                    <PanelSectionRow>
                      <ToggleField
                        label="Auto-Activate"
                        description="Automatically show visual cues when motion is detected"
                        checked={settings.auto_activate}
                        onChange={handleAutoActivateToggle}
                      />
                    </PanelSectionRow>
                    
                    <PanelSectionRow>
                      <ToggleField
                        label="Show Visual Cues"
                        description="Manually toggle visual cues overlay"
                        checked={showOverlay}
                        onChange={handleOverlayToggle}
                      />
                    </PanelSectionRow>
                    
                    <PanelSectionRow>
                      <ButtonItem
                        layout="below"
                        onClick={handleCalibrationClick}
                      >
                        🔄 Calibrate Motion Sensors
                      </ButtonItem>
                    </PanelSectionRow>
                    
                    <PanelSectionRow>
                      <ButtonItem
                        layout="below"
                        onClick={handleStylesClick}
                      >
                        🎨 Visual Style Settings
                      </ButtonItem>
                    </PanelSectionRow>
                    
                    {/* Debug values, can be removed in production */}
                    {renderDebugValues()}
                  </>
                )}
              </>
            )}
            
            <PanelSectionRow>
              <ButtonItem
                layout="below"
                onClick={handleUninstall}
                disabled={uninstalling}
              >
                {uninstalling ? "Uninstalling..." : "🗑️ Uninstall SteamDeckGyroDSU"}
              </ButtonItem>
            </PanelSectionRow>
          </>
        )}
      </PanelSection>
      
      {/* Motion overlay */}
      {showOverlay && settings && motionData && (
        <MotionOverlay 
          motionData={motionData} 
          settings={settings}
        />
      )}
      
      {/* Calibration panel */}
      {showCalibration && motionData && (
        <CalibrationPanel
          motionData={motionData}
          onCancel={() => setShowCalibration(false)}
          onComplete={(scaleX, scaleY, scaleZ) => {
            finishCalibration(scaleX, scaleY, scaleZ);
            setShowCalibration(false);
          }}
          onSetOffsets={async () => {
            await setCalibrationOffsets();
          }}
        />
      )}
    </>
  );
}

export default definePlugin(() => ({
  name: "Motion Comfort",
  titleView: <div>Motion Comfort</div>,
  alwaysRender: true,
  content: <MotionComfortContent />,
  icon: <FiActivity />,
  onDismount() {
    console.log("Plugin unmounted");
  },
}));