// Decky Loader will pass this api in, it's versioned to allow for backwards compatibility.
// @ts-ignore

// Prevents it from being duplicated in output.
const manifest = {"name":"Motion Service"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
// Initialize
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
// Version 1 throws on version mismatch so we have to account for that here.
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const definePlugin = (fn) => {
    return (...args) => {
        // TODO: Maybe wrap this
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var {
        attr,
        size,
        title
      } = props,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function GiSoundWaves (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M468.53 236.03H486v39.94h-17.47v-39.94zm-34.426 51.634h17.47v-63.328h-17.47v63.328zm-33.848 32.756h17.47V191.58h-17.47v128.84zm-32.177 25.276h17.47V167.483h-17.47v178.17zm-34.448-43.521h17.47v-92.35h-17.47v92.35zm-34.994 69.879h17.47v-236.06h-17.525v236.06zM264.2 405.9h17.47V106.1H264.2V405.9zm-33.848-46.284h17.47V152.383h-17.47v207.234zm-35.016-58.85h17.47v-87.35h-17.47v87.35zm-33.847-20.823h17.47V231.98h-17.47v48.042zm-33.848 25.66h17.47v-99.24h-17.47v99.272zm-33.302 48.04h17.47V152.678H94.34v201zm-33.847-30.702h17.47V187.333h-17.47v135.642zM26 287.664h17.47v-63.328H26v63.328z"},"child":[]}]})(props);
}

// Define callables
const checkServiceStatus$3 = callable("check_service_status");
const startMotionService$1 = callable("start_motion_service");
const stopMotionService$1 = callable("stop_motion_service");
const startMotionMonitoring$1 = callable("start_motion_monitoring");
const stopMotionMonitoring = callable("stop_motion_monitoring");
const getMotionData$2 = callable("get_motion_data");
const logError$3 = callable("log_error");
const MotionServiceSection = () => {
    const [serviceStatus, setServiceStatus] = SP_REACT.useState(null);
    const [motionData, setMotionData] = SP_REACT.useState(null);
    const [result, setResult] = SP_REACT.useState('');
    const [loading, setLoading] = SP_REACT.useState(true);
    SP_REACT.useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await checkServiceStatus$3();
                setServiceStatus(status);
                if (status.running) {
                    const data = await getMotionData$2();
                    setMotionData(data);
                }
            }
            catch (error) {
                await logError$3(`MotionServiceSection -> checkStatus: ${String(error)}`);
            }
            finally {
                setLoading(false);
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, []);
    const handleServiceToggle = async () => {
        if (!serviceStatus)
            return;
        try {
            setResult('Updating service...');
            const response = serviceStatus.running
                ? await stopMotionService$1()
                : await startMotionService$1();
            if (response.status === "success") {
                setResult(`✅ Service ${serviceStatus.running ? 'stopped' : 'started'} successfully`);
                // Update status after a brief delay
                setTimeout(async () => {
                    const newStatus = await checkServiceStatus$3();
                    setServiceStatus(newStatus);
                }, 1000);
            }
            else {
                setResult(`❌ Failed: ${response.message}`);
            }
        }
        catch (error) {
            setResult(`❌ Error: ${String(error)}`);
            await logError$3(`Service toggle error: ${String(error)}`);
        }
    };
    const handleMonitoringToggle = async () => {
        if (!motionData)
            return;
        try {
            setResult('Updating monitoring...');
            const response = motionData.monitoring
                ? await stopMotionMonitoring()
                : await startMotionMonitoring$1();
            if (response.status === "success") {
                setResult(`✅ Monitoring ${motionData.monitoring ? 'stopped' : 'started'}`);
                // Update data
                setTimeout(async () => {
                    const newData = await getMotionData$2();
                    setMotionData(newData);
                }, 500);
            }
            else {
                setResult(`❌ Failed: ${response.message}`);
            }
        }
        catch (error) {
            setResult(`❌ Error: ${String(error)}`);
            await logError$3(`Monitoring toggle error: ${String(error)}`);
        }
    };
    if (loading) {
        return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Service Management" },
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", null, "\uD83D\uDD04 Loading service information..."))));
    }
    if (!serviceStatus?.installed) {
        return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Service Management" },
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: { fontSize: '0.9em', opacity: 0.7 } }, "Install the Motion Service first to access service management options."))));
    }
    return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Service Management" },
        window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement(DFL.ToggleField, { label: "Motion Service", description: serviceStatus.running ? "Service is currently running" : "Service is currently stopped", checked: serviceStatus.running, onChange: handleServiceToggle })),
        serviceStatus.running && (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement(DFL.ToggleField, { label: "Motion Data Monitoring", description: motionData?.monitoring ?
                        `Active - ${motionData.history_count} samples collected` :
                        "Start collecting motion data for analysis", checked: motionData?.monitoring || false, onChange: handleMonitoringToggle })),
            motionData?.monitoring && (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: {
                        padding: '12px',
                        backgroundColor: 'var(--decky-highlighted-ui-bg)',
                        borderRadius: '4px',
                        border: '1px solid var(--decky-subtle-border)',
                        fontSize: '0.85em'
                    } },
                    window.SP_REACT.createElement("div", { style: { fontWeight: 'bold', marginBottom: '8px' } }, "\uD83D\uDCCA Monitoring Status"),
                    window.SP_REACT.createElement("div", { style: { marginBottom: '4px' } },
                        "Samples collected: ",
                        motionData.history_count),
                    window.SP_REACT.createElement("div", { style: { marginBottom: '4px' } },
                        "Recent alerts: ",
                        motionData.alerts.length),
                    motionData.latest_data && (window.SP_REACT.createElement("div", { style: { fontSize: '0.8em', opacity: 0.8 } },
                        "Last update: Frame ",
                        motionData.latest_data.frameId))))),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: {
                        padding: '8px',
                        backgroundColor: serviceStatus.udp_available ?
                            'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                        borderRadius: '4px',
                        border: serviceStatus.udp_available ?
                            '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(255, 152, 0, 0.3)',
                        fontSize: '0.85em'
                    } },
                    window.SP_REACT.createElement("div", { style: { fontWeight: 'bold', marginBottom: '4px' } }, "\uD83C\uDF10 Network Status"),
                    window.SP_REACT.createElement("div", null,
                        "UDP Port 27760: ",
                        serviceStatus.udp_available ?
                            "✅ Responding" : "⚠️ Not responding"),
                    !serviceStatus.udp_available && (window.SP_REACT.createElement("div", { style: { fontSize: '0.8em', opacity: 0.8, marginTop: '4px' } }, "Service may still be starting up")))))),
        result && (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement("div", { style: {
                    padding: '12px',
                    marginTop: '8px',
                    backgroundColor: 'var(--decky-selected-ui-bg)',
                    borderRadius: '4px',
                    fontSize: '0.9em'
                } }, result))),
        window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement("div", { style: { fontSize: '0.8em', opacity: 0.7, marginTop: '8px' } }, "The service runs as a systemd user service and provides motion data via UDP on port 27760."))));
};

// Define callables
const checkServiceStatus$2 = callable("check_service_status");
const getMotionSettings = callable("get_motion_settings");
const setMotionCuesEnabled = callable("set_motion_cues_enabled");
const setMotionSensitivity = callable("set_motion_sensitivity");
const setCueTypes = callable("set_cue_types");
const getMotionData$1 = callable("get_motion_data");
const clearMotionAlerts = callable("clear_motion_alerts");
const logError$2 = callable("log_error");
const MotionCuesSection = () => {
    const [serviceStatus, setServiceStatus] = SP_REACT.useState(null);
    const [motionSettings, setMotionSettingsState] = SP_REACT.useState(null);
    const [motionData, setMotionData] = SP_REACT.useState(null);
    const [result, setResult] = SP_REACT.useState('');
    const [loading, setLoading] = SP_REACT.useState(true);
    const sensitivityOptions = [
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
    const cueTypeOptions = [
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
    SP_REACT.useEffect(() => {
        const loadData = async () => {
            try {
                const [status, settings, data] = await Promise.all([
                    checkServiceStatus$2(),
                    getMotionSettings(),
                    getMotionData$1()
                ]);
                setServiceStatus(status);
                setMotionSettingsState(settings);
                setMotionData(data);
            }
            catch (error) {
                await logError$2(`MotionCuesSection -> loadData: ${String(error)}`);
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, []);
    const handleCuesToggle = async () => {
        if (!motionSettings)
            return;
        try {
            setResult('Updating motion cues...');
            const response = await setMotionCuesEnabled(!motionSettings.cues_enabled);
            if (response.status === "success") {
                setResult(`✅ Motion cues ${!motionSettings.cues_enabled ? 'enabled' : 'disabled'}`);
                // Update settings
                const newSettings = await getMotionSettings();
                setMotionSettingsState(newSettings);
            }
            else {
                setResult(`❌ Failed: ${response.message}`);
            }
        }
        catch (error) {
            setResult(`❌ Error: ${String(error)}`);
            await logError$2(`Motion cues toggle error: ${String(error)}`);
        }
    };
    const handleSensitivityChange = async (level) => {
        try {
            setResult('Updating sensitivity...');
            const response = await setMotionSensitivity(level);
            if (response.status === "success") {
                setResult(`✅ Sensitivity set to ${sensitivityOptions.find(o => o.value === level)?.label}`);
                // Update settings
                const newSettings = await getMotionSettings();
                setMotionSettingsState(newSettings);
            }
            else {
                setResult(`❌ Failed: ${response.message}`);
            }
        }
        catch (error) {
            setResult(`❌ Error: ${String(error)}`);
            await logError$2(`Sensitivity change error: ${String(error)}`);
        }
    };
    const handleCueTypeToggle = async (cueType) => {
        if (!motionSettings)
            return;
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
            }
            else {
                setResult(`❌ Failed: ${response.message}`);
            }
        }
        catch (error) {
            setResult(`❌ Error: ${String(error)}`);
            await logError$2(`Cue type toggle error: ${String(error)}`);
        }
    };
    const handleClearAlerts = async () => {
        try {
            const response = await clearMotionAlerts();
            if (response.status === "success") {
                setResult('✅ Motion alerts cleared');
                // Update data
                const newData = await getMotionData$1();
                setMotionData(newData);
            }
            else {
                setResult(`❌ Failed: ${response.message}`);
            }
        }
        catch (error) {
            setResult(`❌ Error: ${String(error)}`);
            await logError$2(`Clear alerts error: ${String(error)}`);
        }
    };
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString();
    };
    const getLevelColor = (level) => {
        switch (level) {
            case 'severe': return '#f44336';
            case 'moderate': return '#ff9800';
            case 'mild': return '#ffeb3b';
            default: return '#9e9e9e';
        }
    };
    const getLevelIcon = (level) => {
        switch (level) {
            case 'severe': return '🔴';
            case 'moderate': return '🟠';
            case 'mild': return '🟡';
            default: return '⚪';
        }
    };
    if (loading) {
        return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Motion Cues" },
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", null, "\uD83D\uDD04 Loading motion cues settings..."))));
    }
    if (!serviceStatus?.installed) {
        return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Motion Cues" },
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: { fontSize: '0.9em', opacity: 0.7 } }, "Install the Motion Service first to enable motion cues functionality."))));
    }
    if (!serviceStatus.running) {
        return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Motion Cues" },
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: { fontSize: '0.9em', opacity: 0.7 } }, "Start the Motion Service to configure motion cues."))));
    }
    return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Motion Cues" },
        window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement("div", { style: {
                    padding: '12px',
                    backgroundColor: 'var(--decky-highlighted-ui-bg)',
                    borderRadius: '4px',
                    border: '1px solid var(--decky-subtle-border)',
                    fontSize: '0.85em',
                    marginBottom: '12px'
                } },
                window.SP_REACT.createElement("div", { style: { fontWeight: 'bold', marginBottom: '6px' } }, "\uD83C\uDF43 Motion Cues for Motion Sickness Prevention"),
                window.SP_REACT.createElement("div", null, "Similar to Apple's motion cues, this feature analyzes your Steam Deck's motion and provides alerts when detecting patterns that may cause motion sickness during gaming."))),
        window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement(DFL.ToggleField, { label: "Enable Motion Cues", description: motionSettings?.cues_enabled ?
                    "Motion cues are active and monitoring for motion patterns" :
                    "Enable intelligent motion sickness prevention", checked: motionSettings?.cues_enabled || false, onChange: handleCuesToggle })),
        motionSettings?.cues_enabled && (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement(DFL.DropdownItem, { label: "Sensitivity Level", description: sensitivityOptions.find(o => o.value === motionSettings.sensitivity_level)?.description || '', rgOptions: sensitivityOptions.map(option => ({
                        data: option.value,
                        label: option.label
                    })), selectedOption: motionSettings.sensitivity_level, onChange: (option) => handleSensitivityChange(option.data) })),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: { marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9em' } }, "Cue Types:"),
                cueTypeOptions.map(cueType => (window.SP_REACT.createElement("div", { key: cueType.value, style: { marginBottom: '8px' } },
                    window.SP_REACT.createElement(DFL.ToggleField, { label: cueType.label, description: cueType.description, checked: motionSettings.cue_types.includes(cueType.value), onChange: () => handleCueTypeToggle(cueType.value) }))))),
            motionSettings.thresholds && (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: {
                        padding: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                        fontSize: '0.8em'
                    } },
                    window.SP_REACT.createElement("div", { style: { fontWeight: 'bold', marginBottom: '6px' } },
                        "\uD83D\uDCCA Current Thresholds (",
                        motionSettings.sensitivity_name,
                        ")"),
                    window.SP_REACT.createElement("div", null,
                        "Gyroscope: ",
                        motionSettings.thresholds.gyro,
                        "\u00B0/sec"),
                    window.SP_REACT.createElement("div", null,
                        "Accelerometer: ",
                        motionSettings.thresholds.accel,
                        "g"),
                    window.SP_REACT.createElement("div", null,
                        "Time window: ",
                        motionSettings.thresholds.time_window,
                        "s")))),
            motionData?.monitoring && (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: {
                        padding: '12px',
                        backgroundColor: 'var(--decky-selected-ui-bg)',
                        borderRadius: '4px',
                        fontSize: '0.85em'
                    } },
                    window.SP_REACT.createElement("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                        } },
                        window.SP_REACT.createElement("div", { style: { fontWeight: 'bold' } },
                            "\uD83D\uDEA8 Recent Motion Alerts (",
                            motionData.alerts.length,
                            ")"),
                        motionData.alerts.length > 0 && (window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: handleClearAlerts }, "Clear"))),
                    motionData.alerts.length === 0 ? (window.SP_REACT.createElement("div", { style: { opacity: 0.7 } }, "No recent motion alerts")) : (window.SP_REACT.createElement("div", { style: { maxHeight: '120px', overflowY: 'auto' } }, motionData.alerts.slice(-5).reverse().map((alert, index) => (window.SP_REACT.createElement("div", { key: index, style: {
                            padding: '6px',
                            marginBottom: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '3px',
                            fontSize: '0.8em',
                            borderLeft: `3px solid ${getLevelColor(alert.level)}`
                        } },
                        window.SP_REACT.createElement("div", { style: { fontWeight: 'bold' } },
                            getLevelIcon(alert.level),
                            " ",
                            alert.level.toUpperCase(),
                            " Motion"),
                        window.SP_REACT.createElement("div", null,
                            formatTimestamp(alert.timestamp),
                            " - Gyro: ",
                            alert.gyro.toFixed(1),
                            "\u00B0/s, Accel: ",
                            alert.accel.toFixed(2),
                            "g"),
                        window.SP_REACT.createElement("div", { style: { opacity: 0.8 } },
                            "Cues: ",
                            alert.cue_types.join(', ')))))))))))),
        result && (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement("div", { style: {
                    padding: '12px',
                    marginTop: '8px',
                    backgroundColor: 'var(--decky-selected-ui-bg)',
                    borderRadius: '4px',
                    fontSize: '0.9em'
                } }, result))),
        window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement("div", { style: { fontSize: '0.8em', opacity: 0.7, marginTop: '8px' } }, "Motion cues help prevent motion sickness by alerting you to movement patterns that commonly trigger symptoms during gaming."))));
};

// Define callables
const checkServiceStatus$1 = callable("check_service_status");
const getMotionData = callable("get_motion_data");
const startMotionMonitoring = callable("start_motion_monitoring");
const logError$1 = callable("log_error");
const MotionDataSection = () => {
    const [serviceStatus, setServiceStatus] = SP_REACT.useState(null);
    const [motionData, setMotionData] = SP_REACT.useState(null);
    const [showRawData, setShowRawData] = SP_REACT.useState(false);
    const [autoRefresh, setAutoRefresh] = SP_REACT.useState(true);
    const [loading, setLoading] = SP_REACT.useState(true);
    SP_REACT.useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await checkServiceStatus$1();
                setServiceStatus(status);
            }
            catch (error) {
                await logError$1(`MotionDataSection -> checkStatus: ${String(error)}`);
            }
            finally {
                setLoading(false);
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);
    SP_REACT.useEffect(() => {
        const updateMotionData = async () => {
            try {
                if (serviceStatus?.running && autoRefresh) {
                    const data = await getMotionData();
                    setMotionData(data);
                }
            }
            catch (error) {
                await logError$1(`Motion data update error: ${String(error)}`);
            }
        };
        if (serviceStatus?.running && autoRefresh) {
            const interval = setInterval(updateMotionData, 200); // Update every 200ms for smooth display
            return () => clearInterval(interval);
        }
        return () => { }; // Always return a cleanup function
    }, [serviceStatus?.running, autoRefresh]);
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp / 1000); // Convert microseconds to milliseconds
        return date.toLocaleTimeString() + '.' + String(date.getMilliseconds()).padStart(3, '0');
    };
    const getMotionIntensity = (magnitude, type) => {
        if (type === 'accel') {
            if (magnitude > 1.5)
                return { level: 'High', color: '#f44336', icon: '🔴' };
            if (magnitude > 1.2)
                return { level: 'Medium', color: '#ff9800', icon: '🟠' };
            if (magnitude > 1.05)
                return { level: 'Low', color: '#ffeb3b', icon: '🟡' };
            return { level: 'Stable', color: '#4caf50', icon: '🟢' };
        }
        else {
            if (magnitude > 50)
                return { level: 'High', color: '#f44336', icon: '🔴' };
            if (magnitude > 20)
                return { level: 'Medium', color: '#ff9800', icon: '🟠' };
            if (magnitude > 5)
                return { level: 'Low', color: '#ffeb3b', icon: '🟡' };
            return { level: 'Stable', color: '#4caf50', icon: '🟢' };
        }
    };
    const renderMotionVisualization = () => {
        if (!motionData?.latest_data)
            return null;
        const data = motionData.latest_data;
        const accelIntensity = getMotionIntensity(data.magnitude.accel, 'accel');
        const gyroIntensity = getMotionIntensity(data.magnitude.gyro, 'gyro');
        return (window.SP_REACT.createElement("div", { style: {
                padding: '12px',
                backgroundColor: 'var(--decky-highlighted-ui-bg)',
                borderRadius: '4px',
                border: '1px solid var(--decky-subtle-border)',
                fontSize: '0.85em'
            } },
            window.SP_REACT.createElement("div", { style: { fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' } },
                "\uD83D\uDCCA Live Motion Data - Frame ",
                data.frameId),
            window.SP_REACT.createElement("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px'
                } },
                window.SP_REACT.createElement("div", { style: {
                        padding: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                        textAlign: 'center',
                        border: `2px solid ${accelIntensity.color}`
                    } },
                    window.SP_REACT.createElement("div", { style: { fontSize: '1.2em', marginBottom: '4px' } }, accelIntensity.icon),
                    window.SP_REACT.createElement("div", { style: { fontWeight: 'bold' } }, "Accelerometer"),
                    window.SP_REACT.createElement("div", { style: { color: accelIntensity.color } }, accelIntensity.level),
                    window.SP_REACT.createElement("div", { style: { fontSize: '0.9em', opacity: 0.8 } },
                        data.magnitude.accel.toFixed(3),
                        "g")),
                window.SP_REACT.createElement("div", { style: {
                        padding: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                        textAlign: 'center',
                        border: `2px solid ${gyroIntensity.color}`
                    } },
                    window.SP_REACT.createElement("div", { style: { fontSize: '1.2em', marginBottom: '4px' } }, gyroIntensity.icon),
                    window.SP_REACT.createElement("div", { style: { fontWeight: 'bold' } }, "Gyroscope"),
                    window.SP_REACT.createElement("div", { style: { color: gyroIntensity.color } }, gyroIntensity.level),
                    window.SP_REACT.createElement("div", { style: { fontSize: '0.9em', opacity: 0.8 } },
                        data.magnitude.gyro.toFixed(1),
                        "\u00B0/s"))),
            window.SP_REACT.createElement("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '0.8em'
                } },
                window.SP_REACT.createElement("div", null,
                    window.SP_REACT.createElement("div", { style: { fontWeight: 'bold', marginBottom: '6px' } }, "\uD83D\uDCD0 Accelerometer (g)"),
                    window.SP_REACT.createElement("div", null,
                        "X: ",
                        data.accel.x.toFixed(3)),
                    window.SP_REACT.createElement("div", null,
                        "Y: ",
                        data.accel.y.toFixed(3)),
                    window.SP_REACT.createElement("div", null,
                        "Z: ",
                        data.accel.z.toFixed(3))),
                window.SP_REACT.createElement("div", null,
                    window.SP_REACT.createElement("div", { style: { fontWeight: 'bold', marginBottom: '6px' } }, "\uD83D\uDD04 Gyroscope (\u00B0/s)"),
                    window.SP_REACT.createElement("div", null,
                        "Pitch: ",
                        data.gyro.pitch.toFixed(1)),
                    window.SP_REACT.createElement("div", null,
                        "Yaw: ",
                        data.gyro.yaw.toFixed(1)),
                    window.SP_REACT.createElement("div", null,
                        "Roll: ",
                        data.gyro.roll.toFixed(1)))),
            window.SP_REACT.createElement("div", { style: {
                    marginTop: '12px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.75em',
                    opacity: 0.8,
                    textAlign: 'center'
                } },
                "Last Update: ",
                formatTimestamp(data.timestamp))));
    };
    const renderRawDataView = () => {
        if (!motionData?.latest_data)
            return null;
        return (window.SP_REACT.createElement("div", { style: {
                padding: '12px',
                backgroundColor: 'var(--decky-selected-ui-bg)',
                borderRadius: '4px',
                fontSize: '0.75em',
                fontFamily: 'monospace',
                maxHeight: '200px',
                overflowY: 'auto'
            } },
            window.SP_REACT.createElement("div", { style: { fontWeight: 'bold', marginBottom: '8px' } }, "\uD83D\uDD27 Raw JSON Data"),
            window.SP_REACT.createElement("pre", { style: {
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.4'
                } }, JSON.stringify(motionData.latest_data, null, 2))));
    };
    if (loading) {
        return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Motion Data" },
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", null, "\uD83D\uDD04 Loading motion data interface..."))));
    }
    if (!serviceStatus?.installed) {
        return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Motion Data" },
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: { fontSize: '0.9em', opacity: 0.7 } }, "Install the Motion Service first to view real-time motion data."))));
    }
    if (!serviceStatus.running) {
        return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Motion Data" },
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: { fontSize: '0.9em', opacity: 0.7 } }, "Start the Motion Service to view real-time motion data."))));
    }
    return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Motion Data" },
        window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement(DFL.ToggleField, { label: "Auto Refresh", description: "Automatically update motion data display", checked: autoRefresh, onChange: setAutoRefresh })),
        motionData?.monitoring ? (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
            window.SP_REACT.createElement(DFL.PanelSectionRow, null, renderMotionVisualization()),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: () => setShowRawData(!showRawData) }, showRawData ? "📊 Show Visualization" : "🔧 Show Raw Data")),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: async () => {
                        const data = await getMotionData();
                        setMotionData(data);
                    } }, "\uD83D\uDD04 Refresh Now")),
            showRawData && (window.SP_REACT.createElement(DFL.PanelSectionRow, null, renderRawDataView())),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: {
                        padding: '8px',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderRadius: '4px',
                        border: '1px solid rgba(33, 150, 243, 0.3)',
                        fontSize: '0.8em'
                    } },
                    window.SP_REACT.createElement("div", { style: { fontWeight: 'bold', marginBottom: '4px' } }, "\uD83D\uDCC8 Data Collection Stats"),
                    window.SP_REACT.createElement("div", null,
                        "Total samples: ",
                        motionData.history_count),
                    window.SP_REACT.createElement("div", null,
                        "Recent alerts: ",
                        motionData.alerts.length),
                    window.SP_REACT.createElement("div", null, "Update rate: ~5 Hz (200ms intervals)"))))) : (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement("div", { style: {
                    padding: '12px',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    textAlign: 'center'
                } },
                window.SP_REACT.createElement("div", { style: { marginBottom: '12px', fontSize: '2em' } }, "\u26A0\uFE0F"),
                window.SP_REACT.createElement("div", { style: { fontWeight: 'bold', marginBottom: '8px' } }, "Motion Monitoring Not Active"),
                window.SP_REACT.createElement("div", { style: { fontSize: '0.9em', marginBottom: '12px' } }, "Enable motion monitoring in the Service Management section to view real-time data."),
                window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: async () => {
                        await startMotionMonitoring();
                        const data = await getMotionData();
                        setMotionData(data);
                    } }, "\u25B6\uFE0F Start Monitoring")))),
        window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement("div", { style: { fontSize: '0.8em', opacity: 0.7, marginTop: '8px' } }, "Real-time accelerometer and gyroscope data from your Steam Deck's built-in sensors. Data is collected at ~60Hz and displayed at 5Hz for smooth visualization."))));
};

// Define callables
const installMotionService = callable("install_motion_service");
const checkServiceStatus = callable("check_service_status");
const startMotionService = callable("start_motion_service");
const stopMotionService = callable("stop_motion_service");
const uninstallMotionService = callable("uninstall_motion_service");
const toggleMotionCues = callable("toggle_motion_cues");
const getDebugInfo = callable("get_debug_info");
const logError = callable("log_error");
function MotionServiceMainSection() {
    const [serviceStatus, setServiceStatus] = SP_REACT.useState(null);
    const [loading, setLoading] = SP_REACT.useState(true);
    const [result, setResult] = SP_REACT.useState('');
    const [installing, setInstalling] = SP_REACT.useState(false);
    const [showDebugInfo, setShowDebugInfo] = SP_REACT.useState(false);
    const [debugInfo, setDebugInfo] = SP_REACT.useState(null);
    // Check service status periodically
    SP_REACT.useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await checkServiceStatus();
                setServiceStatus(status);
            }
            catch (error) {
                await logError(`Status check error: ${String(error)}`);
            }
            finally {
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
            }
            else {
                setResult(`❌ Installation failed: ${response.message}`);
                setShowDebugInfo(true); // Show debug info on failure
            }
        }
        catch (error) {
            setResult(`❌ Installation error: ${String(error)}`);
            setShowDebugInfo(true);
            await logError(`Install error: ${String(error)}`);
        }
        finally {
            setInstalling(false);
        }
    };
    const handleUninstall = async () => {
        DFL.showModal(window.SP_REACT.createElement(DFL.ConfirmModal, { strTitle: "Uninstall Motion Service Dependencies", strDescription: "This will completely remove all Motion Service files and stop the service. This action cannot be undone. Continue?", strOKButtonText: "Uninstall", strCancelButtonText: "Cancel", onOK: async () => {
                try {
                    setResult('🔄 Uninstalling Motion Service dependencies...');
                    const response = await uninstallMotionService();
                    if (response.status === "success") {
                        setResult('✅ Motion Service dependencies uninstalled successfully.');
                        // Refresh status
                        const newStatus = await checkServiceStatus();
                        setServiceStatus(newStatus);
                    }
                    else {
                        setResult(`❌ Uninstall failed: ${response.message}`);
                    }
                }
                catch (error) {
                    setResult(`❌ Uninstall error: ${String(error)}`);
                    await logError(`Uninstall error: ${String(error)}`);
                }
            } }));
    };
    const handleToggleCues = async () => {
        try {
            const response = await toggleMotionCues();
            if (response.status === "success") {
                setResult(`✅ Motion cues ${response.enabled ? 'enabled' : 'disabled'}`);
            }
            else {
                setResult(`❌ Failed to toggle cues: ${response.message}`);
            }
        }
        catch (error) {
            setResult(`❌ Error: ${String(error)}`);
            await logError(`Toggle cues error: ${String(error)}`);
        }
    };
    const renderStatusDisplay = () => {
        if (loading) {
            return (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", null, "\uD83D\uDD04 Checking Motion Service status...")));
        }
        if (!serviceStatus) {
            return (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: { color: "red" } }, "\u274C Unable to check service status")));
        }
        const getStatusDisplay = () => {
            if (!serviceStatus.installed) {
                return "🔴 Motion Service Dependencies Not Installed";
            }
            if (serviceStatus.running) {
                if (serviceStatus.udp_available) {
                    return "🟢 Motion Service Active & Ready";
                }
                else {
                    return "🟡 Motion Service Running (Starting up...)";
                }
            }
            return "🟠 Motion Service Dependencies Installed (Service Stopped)";
        };
        return (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement("div", { style: {
                    color: serviceStatus.installed && serviceStatus.running ? "green" :
                        serviceStatus.installed ? "orange" : "red"
                } }, getStatusDisplay())));
    };
    const renderDebugInfo = () => {
        if (!showDebugInfo || !debugInfo)
            return null;
        return (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement("div", { style: {
                    padding: '12px',
                    backgroundColor: 'var(--decky-selected-ui-bg)',
                    borderRadius: '4px',
                    fontSize: '0.8em',
                    maxHeight: '200px',
                    overflowY: 'auto'
                } },
                window.SP_REACT.createElement("div", { style: { fontWeight: 'bold', marginBottom: '8px' } }, "\uD83D\uDD27 Debug Information"),
                window.SP_REACT.createElement("pre", { style: { margin: 0, whiteSpace: 'pre-wrap' } }, JSON.stringify(debugInfo, null, 2)))));
    };
    // If not installed, show only the install button
    if (!serviceStatus?.installed) {
        return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Motion Service" },
            renderStatusDisplay(),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: handleInstall, disabled: installing }, installing ? "🔄 Installing Dependencies..." : "📥 Install Dependencies")),
            result && (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: {
                        padding: '12px',
                        marginTop: '8px',
                        backgroundColor: 'var(--decky-selected-ui-bg)',
                        borderRadius: '4px',
                        fontSize: '0.9em'
                    } }, result))),
            renderDebugInfo(),
            showDebugInfo && (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: () => setShowDebugInfo(!showDebugInfo) }, showDebugInfo ? "🔍 Hide Debug Info" : "🔍 Show Debug Info"))),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: { fontSize: '0.85em', opacity: 0.8, marginTop: '8px' } }, "Install the Motion Service dependencies to enable real-time motion data and motion sickness prevention features."))));
    }
    // If installed, show full interface
    return (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
        window.SP_REACT.createElement(DFL.PanelSection, { title: "Motion Service Control" },
            renderStatusDisplay(),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: async () => {
                        const response = serviceStatus.running
                            ? await stopMotionService()
                            : await startMotionService();
                        setResult(response.message || 'Operation completed');
                    } }, serviceStatus.running ? "⏹️ Stop Service" : "▶️ Start Service")),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: handleToggleCues }, "\uD83C\uDF43 Toggle Motion Cues")),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: handleUninstall }, "\uD83D\uDDD1\uFE0F Uninstall Dependencies")),
            result && (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: {
                        padding: '12px',
                        marginTop: '8px',
                        backgroundColor: 'var(--decky-selected-ui-bg)',
                        borderRadius: '4px',
                        fontSize: '0.9em'
                    } }, result))),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: { fontSize: '0.85em', opacity: 0.8, marginTop: '8px' } }, "Motion Service provides real-time motion data and intelligent motion sickness prevention."))),
        window.SP_REACT.createElement(MotionServiceSection, null),
        window.SP_REACT.createElement(MotionCuesSection, null),
        window.SP_REACT.createElement(MotionDataSection, null)));
}
var index = definePlugin(() => ({
    name: "Motion Service Plugin",
    titleView: window.SP_REACT.createElement("div", null, "Motion Service"),
    alwaysRender: true,
    content: (window.SP_REACT.createElement(MotionServiceMainSection, null)),
    icon: window.SP_REACT.createElement(GiSoundWaves, null),
    onDismount() {
        console.log("Motion Service plugin unmounted");
    },
}));

export { index as default };
//# sourceMappingURL=index.js.map
