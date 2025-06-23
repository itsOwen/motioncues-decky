import { useState, useEffect } from "react";
import {
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  ConfirmModal,
  showModal
} from "@decky/ui";
import { definePlugin, callable } from "@decky/api";
import { GiSoundWaves } from "react-icons/gi";
import MotionServiceSection from "./MotionServiceSection";
import MotionCuesSection from "./MotionCuesSection";
import MotionDataSection from "./MotionDataSection";

interface ServiceResult {
  status: string;
  message?: string;
  output?: string;
  enabled?: boolean;
}

interface ServiceStatus {
  status: string;
  installed: boolean;
  running: boolean;
  udp_available?: boolean;
  message?: string;
}

// Define callables
const installMotionService = callable<[], ServiceResult>("install_motion_service");
const checkServiceStatus = callable<[], ServiceStatus>("check_service_status");
const startMotionService = callable<[], ServiceResult>("start_motion_service");
const stopMotionService = callable<[], ServiceResult>("stop_motion_service");
const uninstallMotionService = callable<[], ServiceResult>("uninstall_motion_service");
const toggleMotionCues = callable<[], ServiceResult>("toggle_motion_cues");
const getDebugInfo = callable<[], any>("get_debug_info");
const logError = callable<[string], void>("log_error");

function MotionServiceMainSection() {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<string>('');
  const [installing, setInstalling] = useState<boolean>(false);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Check service status periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkServiceStatus();
        setServiceStatus(status);
      } catch (error) {
        await logError(`Status check error: ${String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInstall = async () => {
    try {
      setInstalling(true);
      setResult('🔄 Installing Motion Service dependencies...');
      
      // Get debug info first
      const debug = await getDebugInfo();
      setDebugInfo(debug);
      
      const response = await installMotionService();
      
      if (response.status === "success") {
        setResult('✅ Motion Service dependencies installed successfully!');
        // Refresh status
        const newStatus = await checkServiceStatus();
        setServiceStatus(newStatus);
      } else {
        setResult(`❌ Installation failed: ${response.message}`);
        setShowDebugInfo(true); // Show debug info on failure
      }
    } catch (error) {
      setResult(`❌ Installation error: ${String(error)}`);
      setShowDebugInfo(true);
      await logError(`Install error: ${String(error)}`);
    } finally {
      setInstalling(false);
    }
  };

  const handleUninstall = async () => {
    showModal(
      <ConfirmModal
        strTitle="Uninstall Motion Service Dependencies"
        strDescription="This will completely remove all Motion Service files and stop the service. This action cannot be undone. Continue?"
        strOKButtonText="Uninstall"
        strCancelButtonText="Cancel"
        onOK={async () => {
          try {
            setResult('🔄 Uninstalling Motion Service dependencies...');
            const response = await uninstallMotionService();
            
            if (response.status === "success") {
              setResult('✅ Motion Service dependencies uninstalled successfully.');
              // Refresh status
              const newStatus = await checkServiceStatus();
              setServiceStatus(newStatus);
            } else {
              setResult(`❌ Uninstall failed: ${response.message}`);
            }
          } catch (error) {
            setResult(`❌ Uninstall error: ${String(error)}`);
            await logError(`Uninstall error: ${String(error)}`);
          }
        }}
      />
    );
  };

  const handleToggleCues = async () => {
    try {
      const response = await toggleMotionCues();
      if (response.status === "success") {
        setResult(`✅ Motion cues ${response.enabled ? 'enabled' : 'disabled'}`);
      } else {
        setResult(`❌ Failed to toggle cues: ${response.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${String(error)}`);
      await logError(`Toggle cues error: ${String(error)}`);
    }
  };

  const renderStatusDisplay = () => {
    if (loading) {
      return (
        <PanelSectionRow>
          <div>🔄 Checking Motion Service status...</div>
        </PanelSectionRow>
      );
    }

    if (!serviceStatus) {
      return (
        <PanelSectionRow>
          <div style={{ color: "red" }}>❌ Unable to check service status</div>
        </PanelSectionRow>
      );
    }

    const getStatusDisplay = () => {
      if (!serviceStatus.installed) {
        return "🔴 Motion Service Dependencies Not Installed";
      }
      
      if (serviceStatus.running) {
        if (serviceStatus.udp_available) {
          return "🟢 Motion Service Active & Ready";
        } else {
          return "🟡 Motion Service Running (Starting up...)";
        }
      }
      
      return "🟠 Motion Service Dependencies Installed (Service Stopped)";
    };

    return (
      <PanelSectionRow>
        <div style={{ 
          color: serviceStatus.installed && serviceStatus.running ? "green" : 
                serviceStatus.installed ? "orange" : "red" 
        }}>
          {getStatusDisplay()}
        </div>
      </PanelSectionRow>
    );
  };

  const renderDebugInfo = () => {
    if (!showDebugInfo || !debugInfo) return null;

    return (
      <PanelSectionRow>
        <div style={{
          padding: '12px',
          backgroundColor: 'var(--decky-selected-ui-bg)',
          borderRadius: '4px',
          fontSize: '0.8em',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔧 Debug Information</div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </PanelSectionRow>
    );
  };

  // If not installed, show only the install button
  if (!serviceStatus?.installed) {
    return (
      <PanelSection title="Motion Service">
        {renderStatusDisplay()}
        
        <PanelSectionRow>
          <ButtonItem 
            layout="below" 
            onClick={handleInstall}
            disabled={installing}
          >
            {installing ? "🔄 Installing Dependencies..." : "📥 Install Dependencies"}
          </ButtonItem>
        </PanelSectionRow>

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

        {renderDebugInfo()}

        {showDebugInfo && (
          <PanelSectionRow>
            <ButtonItem 
              layout="below" 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              {showDebugInfo ? "🔍 Hide Debug Info" : "🔍 Show Debug Info"}
            </ButtonItem>
          </PanelSectionRow>
        )}

        <PanelSectionRow>
          <div style={{ fontSize: '0.85em', opacity: 0.8, marginTop: '8px' }}>
            Install the Motion Service dependencies to enable real-time motion data and motion sickness prevention features.
          </div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  // If installed, show full interface
  return (
    <>
      <PanelSection title="Motion Service Control">
        {renderStatusDisplay()}

        <PanelSectionRow>
          <ButtonItem 
            layout="below" 
            onClick={async () => {
              const response = serviceStatus.running 
                ? await stopMotionService() 
                : await startMotionService();
              setResult(response.message || 'Operation completed');
            }}
          >
            {serviceStatus.running ? "⏹️ Stop Service" : "▶️ Start Service"}
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem 
            layout="below" 
            onClick={handleToggleCues}
          >
            🍃 Toggle Motion Cues
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem 
            layout="below" 
            onClick={handleUninstall}
          >
            🗑️ Uninstall Dependencies
          </ButtonItem>
        </PanelSectionRow>

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
          <div style={{ fontSize: '0.85em', opacity: 0.8, marginTop: '8px' }}>
            Motion Service provides real-time motion data and intelligent motion sickness prevention.
          </div>
        </PanelSectionRow>
      </PanelSection>

      <MotionServiceSection />
      <MotionCuesSection />
      <MotionDataSection />
    </>
  );
}

export default definePlugin(() => ({
  name: "Motion Service Plugin",
  titleView: <div>Motion Service</div>,
  alwaysRender: true,
  content: (
    <MotionServiceMainSection />
  ),
  icon: <GiSoundWaves />,
  onDismount() {
    console.log("Motion Service plugin unmounted");
  },
}));