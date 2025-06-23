import { useState, useEffect } from "react";
import {
  PanelSection,
  PanelSectionRow,
  ToggleField
} from "@decky/ui";
import { callable } from "@decky/api";

// Define interfaces
interface ServiceResult {
  status: string;
  message?: string;
  output?: string;
}

interface ServiceStatus {
  status: string;
  installed: boolean;
  running: boolean;
  udp_available?: boolean;
  message?: string;
}

interface MotionDataResponse {
  status: string;
  latest_data?: any;
  monitoring: boolean;
  alerts: any[];
  history_count: number;
  message?: string;
}

// Define callables
const checkServiceStatus = callable<[], ServiceStatus>("check_service_status");
const startMotionService = callable<[], ServiceResult>("start_motion_service");
const stopMotionService = callable<[], ServiceResult>("stop_motion_service");
const startMotionMonitoring = callable<[], ServiceResult>("start_motion_monitoring");
const stopMotionMonitoring = callable<[], ServiceResult>("stop_motion_monitoring");
const getMotionData = callable<[], MotionDataResponse>("get_motion_data");
const logError = callable<[string], void>("log_error");

const MotionServiceSection = () => {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [motionData, setMotionData] = useState<MotionDataResponse | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkServiceStatus();
        setServiceStatus(status);
        
        if (status.running) {
          const data = await getMotionData();
          setMotionData(data);
        }
      } catch (error) {
        await logError(`MotionServiceSection -> checkStatus: ${String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleServiceToggle = async () => {
    if (!serviceStatus) return;

    try {
      setResult('Updating service...');
      
      const response = serviceStatus.running 
        ? await stopMotionService()
        : await startMotionService();
      
      if (response.status === "success") {
        setResult(`✅ Service ${serviceStatus.running ? 'stopped' : 'started'} successfully`);
        
        // Update status after a brief delay
        setTimeout(async () => {
          const newStatus = await checkServiceStatus();
          setServiceStatus(newStatus);
        }, 1000);
      } else {
        setResult(`❌ Failed: ${response.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${String(error)}`);
      await logError(`Service toggle error: ${String(error)}`);
    }
  };

  const handleMonitoringToggle = async () => {
    if (!motionData) return;

    try {
      setResult('Updating monitoring...');
      
      const response = motionData.monitoring 
        ? await stopMotionMonitoring()
        : await startMotionMonitoring();
      
      if (response.status === "success") {
        setResult(`✅ Monitoring ${motionData.monitoring ? 'stopped' : 'started'}`);
        
        // Update data
        setTimeout(async () => {
          const newData = await getMotionData();
          setMotionData(newData);
        }, 500);
      } else {
        setResult(`❌ Failed: ${response.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${String(error)}`);
      await logError(`Monitoring toggle error: ${String(error)}`);
    }
  };

  if (loading) {
    return (
      <PanelSection title="Service Management">
        <PanelSectionRow>
          <div>🔄 Loading service information...</div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  if (!serviceStatus?.installed) {
    return (
      <PanelSection title="Service Management">
        <PanelSectionRow>
          <div style={{ fontSize: '0.9em', opacity: 0.7 }}>
            Install the Motion Service first to access service management options.
          </div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  return (
    <PanelSection title="Service Management">
      <PanelSectionRow>
        <ToggleField
          label="Motion Service"
          description={serviceStatus.running ? "Service is currently running" : "Service is currently stopped"}
          checked={serviceStatus.running}
          onChange={handleServiceToggle}
        />
      </PanelSectionRow>

      {serviceStatus.running && (
        <>
          <PanelSectionRow>
            <ToggleField
              label="Motion Data Monitoring"
              description={motionData?.monitoring ? 
                `Active - ${motionData.history_count} samples collected` : 
                "Start collecting motion data for analysis"
              }
              checked={motionData?.monitoring || false}
              onChange={handleMonitoringToggle}
            />
          </PanelSectionRow>

          {motionData?.monitoring && (
            <PanelSectionRow>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--decky-highlighted-ui-bg)',
                borderRadius: '4px',
                border: '1px solid var(--decky-subtle-border)',
                fontSize: '0.85em'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  📊 Monitoring Status
                </div>
                <div style={{ marginBottom: '4px' }}>
                  Samples collected: {motionData.history_count}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  Recent alerts: {motionData.alerts.length}
                </div>
                {motionData.latest_data && (
                  <div style={{ fontSize: '0.8em', opacity: 0.8 }}>
                    Last update: Frame {motionData.latest_data.frameId}
                  </div>
                )}
              </div>
            </PanelSectionRow>
          )}

          <PanelSectionRow>
            <div style={{
              padding: '8px',
              backgroundColor: serviceStatus.udp_available ? 
                'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
              borderRadius: '4px',
              border: serviceStatus.udp_available ? 
                '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(255, 152, 0, 0.3)',
              fontSize: '0.85em'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                🌐 Network Status
              </div>
              <div>
                UDP Port 27760: {serviceStatus.udp_available ? 
                  "✅ Responding" : "⚠️ Not responding"
                }
              </div>
              {!serviceStatus.udp_available && (
                <div style={{ fontSize: '0.8em', opacity: 0.8, marginTop: '4px' }}>
                  Service may still be starting up
                </div>
              )}
            </div>
          </PanelSectionRow>
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
          The service runs as a systemd user service and provides motion data via UDP on port 27760.
        </div>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default MotionServiceSection;