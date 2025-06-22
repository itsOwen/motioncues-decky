// Decky Loader will pass this api in, it's versioned to allow for backwards compatibility.
// @ts-ignore

// Prevents it from being duplicated in output.
const manifest = {"name":"Motion Comfort"};
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
function FiActivity (props) {
  return GenIcon({"attr":{"viewBox":"0 0 24 24","fill":"none","stroke":"currentColor","strokeWidth":"2","strokeLinecap":"round","strokeLinejoin":"round"},"child":[{"tag":"polyline","attr":{"points":"22 12 18 12 15 21 9 3 6 12 2 12"},"child":[]}]})(props);
}

// src/MotionOverlay.tsx

// Helper function to convert motion data to a value between 0-1 for visual rendering
const normalizeMotionValue = (value, sensitivity) => {
    // Apply sensitivity - higher sensitivity = lower threshold
    const threshold = 0.1 + (1.0 - sensitivity) * 0.4;
    // Calculate how much the value deviates from 1.0 (normal gravity)
    const deviation = Math.abs(value - 1.0);
    // Scale from threshold to 1.0
    return Math.min(1.0, Math.max(0.0, (deviation - threshold) / (1.0 - threshold)));
};
// Keep track of motion history for smoother animations
const MAX_HISTORY_LENGTH = 5;
const MotionOverlay = ({ motionData, settings }) => {
    const [motionHistory, setMotionHistory] = SP_REACT.useState([]);
    // Update motion history
    SP_REACT.useEffect(() => {
        // Create a new motion data point
        const newPoint = {
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
    const getSmoothedValue = (axis) => {
        if (motionHistory.length === 0)
            return 0;
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
    const renderEdgeLines = (x, y, color, opacity) => {
        const lineThickness = 4;
        const maxLength = 100;
        return (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
            window.SP_REACT.createElement("div", { style: {
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: `${maxLength * x}px`,
                    height: `${lineThickness}px`,
                    backgroundColor: color,
                    opacity: opacity * x,
                    transition: 'width 0.1s ease-out, opacity 0.1s ease-out'
                } }),
            window.SP_REACT.createElement("div", { style: {
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: `${maxLength * x}px`,
                    height: `${lineThickness}px`,
                    backgroundColor: color,
                    opacity: opacity * x,
                    transition: 'width 0.1s ease-out, opacity 0.1s ease-out'
                } }),
            window.SP_REACT.createElement("div", { style: {
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: `${lineThickness}px`,
                    height: `${maxLength * y}px`,
                    backgroundColor: color,
                    opacity: opacity * y,
                    transition: 'height 0.1s ease-out, opacity 0.1s ease-out'
                } }),
            window.SP_REACT.createElement("div", { style: {
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: `${lineThickness}px`,
                    height: `${maxLength * y}px`,
                    backgroundColor: color,
                    opacity: opacity * y,
                    transition: 'height 0.1s ease-out, opacity 0.1s ease-out'
                } })));
    };
    // Corner dots style
    const renderCornerDots = (x, y, color, opacity) => {
        const dotSize = 10;
        const maxOffset = 30;
        return (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
            window.SP_REACT.createElement("div", { style: {
                    position: 'absolute',
                    top: `${maxOffset * y}px`,
                    left: `${maxOffset * x}px`,
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                    borderRadius: '50%',
                    backgroundColor: color,
                    opacity: opacity * Math.max(x, y),
                    transition: 'all 0.1s ease-out'
                } }),
            window.SP_REACT.createElement("div", { style: {
                    position: 'absolute',
                    top: `${maxOffset * y}px`,
                    right: `${maxOffset * x}px`,
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                    borderRadius: '50%',
                    backgroundColor: color,
                    opacity: opacity * Math.max(x, y),
                    transition: 'all 0.1s ease-out'
                } }),
            window.SP_REACT.createElement("div", { style: {
                    position: 'absolute',
                    bottom: `${maxOffset * y}px`,
                    left: `${maxOffset * x}px`,
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                    borderRadius: '50%',
                    backgroundColor: color,
                    opacity: opacity * Math.max(x, y),
                    transition: 'all 0.1s ease-out'
                } }),
            window.SP_REACT.createElement("div", { style: {
                    position: 'absolute',
                    bottom: `${maxOffset * y}px`,
                    right: `${maxOffset * x}px`,
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                    borderRadius: '50%',
                    backgroundColor: color,
                    opacity: opacity * Math.max(x, y),
                    transition: 'all 0.1s ease-out'
                } })));
    };
    // Center circle style
    const renderCenterCircle = (x, y, z, color, opacity) => {
        const baseSize = 20;
        const maxSize = 80;
        const size = baseSize + (maxSize - baseSize) * Math.max(x, y, z);
        return (window.SP_REACT.createElement("div", { style: {
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
            } }));
    };
    return (window.SP_REACT.createElement("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            pointerEvents: 'none',
            overflow: 'hidden'
        } }, renderVisualCues()));
};

const CalibrationPanel = ({ motionData, onCancel, onComplete, onSetOffsets }) => {
    const [step, setStep] = SP_REACT.useState(1);
    const [settingOffsets, setSettingOffsets] = SP_REACT.useState(false);
    const [scaleX, setScaleX] = SP_REACT.useState(1.0);
    const [scaleY, setScaleY] = SP_REACT.useState(1.0);
    const [scaleZ, setScaleZ] = SP_REACT.useState(1.0);
    // Format motion values for display
    const formatValue = (value) => value.toFixed(3);
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
                return (window.SP_REACT.createElement("div", { style: { marginBottom: '16px' } },
                    window.SP_REACT.createElement("p", null, "Place your Steam Deck on a flat, level surface and keep it still."),
                    window.SP_REACT.createElement("p", null, "This will calibrate the motion sensors to correctly detect acceleration."),
                    window.SP_REACT.createElement("p", null, "Press \"Set Zero Position\" when ready.")));
            case 2:
                return (window.SP_REACT.createElement("div", { style: { marginBottom: '16px' } },
                    window.SP_REACT.createElement("p", null, "Now you can adjust the sensitivity for each axis."),
                    window.SP_REACT.createElement("p", null, "If motion cues appear too sensitive or not sensitive enough, adjust these values."),
                    window.SP_REACT.createElement("p", null, "Higher values = more sensitive, Lower values = less sensitive.")));
            default:
                return null;
        }
    };
    // Render calibration step 1 (setting offsets)
    const renderStep1 = () => {
        return (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
            window.SP_REACT.createElement("div", { style: { marginBottom: '16px' } },
                window.SP_REACT.createElement("div", null, "Current Accelerometer Values:"),
                window.SP_REACT.createElement("div", null,
                    "X: ",
                    formatValue(motionData.accel_x)),
                window.SP_REACT.createElement("div", null,
                    "Y: ",
                    formatValue(motionData.accel_y)),
                window.SP_REACT.createElement("div", null,
                    "Z: ",
                    formatValue(motionData.accel_z))),
            window.SP_REACT.createElement(DFL.DialogButton, { onClick: handleSetOffsets, disabled: settingOffsets }, settingOffsets ? window.SP_REACT.createElement(DFL.Spinner, null) : "Set Zero Position")));
    };
    // Render calibration step 2 (setting scales)
    const renderStep2 = () => {
        return (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
            window.SP_REACT.createElement(DFL.Field, { label: "X-Axis Sensitivity", description: "Left-right motion sensitivity", bottomSeparator: "none" },
                window.SP_REACT.createElement(DFL.Focusable, { style: { display: 'flex', alignItems: 'center' } },
                    window.SP_REACT.createElement("div", { style: { flex: 1 } },
                        window.SP_REACT.createElement("input", { type: "range", min: "0.5", max: "2.0", step: "0.1", value: scaleX, onChange: (e) => setScaleX(parseFloat(e.target.value)), style: { width: '100%' } })),
                    window.SP_REACT.createElement("div", { style: { marginLeft: '10px', minWidth: '40px', textAlign: 'right' } }, scaleX.toFixed(1)))),
            window.SP_REACT.createElement(DFL.Field, { label: "Y-Axis Sensitivity", description: "Front-back motion sensitivity", bottomSeparator: "none" },
                window.SP_REACT.createElement(DFL.Focusable, { style: { display: 'flex', alignItems: 'center' } },
                    window.SP_REACT.createElement("div", { style: { flex: 1 } },
                        window.SP_REACT.createElement("input", { type: "range", min: "0.5", max: "2.0", step: "0.1", value: scaleY, onChange: (e) => setScaleY(parseFloat(e.target.value)), style: { width: '100%' } })),
                    window.SP_REACT.createElement("div", { style: { marginLeft: '10px', minWidth: '40px', textAlign: 'right' } }, scaleY.toFixed(1)))),
            window.SP_REACT.createElement(DFL.Field, { label: "Z-Axis Sensitivity", description: "Up-down motion sensitivity", bottomSeparator: "none" },
                window.SP_REACT.createElement(DFL.Focusable, { style: { display: 'flex', alignItems: 'center' } },
                    window.SP_REACT.createElement("div", { style: { flex: 1 } },
                        window.SP_REACT.createElement("input", { type: "range", min: "0.5", max: "2.0", step: "0.1", value: scaleZ, onChange: (e) => setScaleZ(parseFloat(e.target.value)), style: { width: '100%' } })),
                    window.SP_REACT.createElement("div", { style: { marginLeft: '10px', minWidth: '40px', textAlign: 'right' } }, scaleZ.toFixed(1)))),
            window.SP_REACT.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: '16px' } },
                window.SP_REACT.createElement(DFL.DialogButton, { onClick: () => setStep(1) }, "Back"),
                window.SP_REACT.createElement(DFL.DialogButton, { onClick: handleComplete }, "Complete Calibration"))));
    };
    return (window.SP_REACT.createElement("div", { style: {
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
        } },
        window.SP_REACT.createElement("h3", { style: { marginTop: 0, marginBottom: '16px' } }, "Calibrate Motion Sensors"),
        renderInstructions(),
        step === 1 && renderStep1(),
        step === 2 && renderStep2(),
        step === 1 && (window.SP_REACT.createElement(DFL.DialogButton, { onClick: onCancel, style: { marginTop: '16px' } }, "Cancel"))));
};

// src/index.tsx

// Define callable functions
const checkDsuInstalled = callable("check_dsu_installed");
const installDsu = callable("install_dsu");
const uninstallDsu = callable("uninstall_dsu");
const startDsuService = callable("start_dsu_service");
const stopDsuService = callable("stop_dsu_service");
const toggleEnabled = callable("toggle_enabled");
const getMotionData = callable("get_motion_data");
const updateSettings = callable("update_settings");
const getSettings = callable("get_settings");
const setCalibrationOffsets = callable("set_calibration_offsets");
const finishCalibration = callable("finish_calibration");
// Main plugin component
function MotionComfortContent() {
    // States
    const [serviceStatus, setServiceStatus] = SP_REACT.useState({ installed: false, running: false });
    const [installing, setInstalling] = SP_REACT.useState(false);
    const [uninstalling, setUninstalling] = SP_REACT.useState(false);
    const [motionData, setMotionData] = SP_REACT.useState(null);
    const [settings, setSettings] = SP_REACT.useState(null);
    const [dataUpdateInterval, setDataUpdateInterval] = SP_REACT.useState(null);
    const [showOverlay, setShowOverlay] = SP_REACT.useState(false);
    const [showCalibration, setShowCalibration] = SP_REACT.useState(false);
    // Load initial data
    SP_REACT.useEffect(() => {
        const loadInitialData = async () => {
            try {
                const status = await checkDsuInstalled();
                setServiceStatus(status);
                const loadedSettings = await getSettings();
                setSettings(loadedSettings);
                if (status.running && loadedSettings.enabled) {
                    startDataUpdates();
                }
            }
            catch (error) {
                console.error("Error loading initial data:", error);
            }
        };
        loadInitialData();
        // Set up regular service status check
        const statusInterval = setInterval(async () => {
            try {
                const status = await checkDsuInstalled();
                setServiceStatus(status);
            }
            catch (error) {
                console.error("Error checking service status:", error);
            }
        }, 5000);
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
                    const motion = Math.sqrt(Math.pow(data.accel_x, 2) +
                        Math.pow(data.accel_y, 2) +
                        Math.pow(data.accel_z, 2));
                    if (Math.abs(motion - 1.0) > threshold) {
                        setShowOverlay(true);
                    }
                    else {
                        // Only hide if auto-activate is true
                        setShowOverlay(false);
                    }
                }
            }
            catch (error) {
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
    // Handle install button click
    const handleInstall = async () => {
        try {
            setInstalling(true);
            const result = await installDsu();
            if (result.status === "success") {
                setServiceStatus({ installed: true, running: true });
            }
            else {
                console.error("Installation failed:", result.message);
            }
        }
        catch (error) {
            console.error("Error installing DSU:", error);
        }
        finally {
            setInstalling(false);
        }
    };
    // Handle uninstall button click
    const handleUninstall = async () => {
        DFL.showModal(window.SP_REACT.createElement(DFL.ConfirmModal, { strTitle: "Confirm Uninstallation", strDescription: "Are you sure you want to uninstall SteamDeckGyroDSU? This will disable motion comfort features.", strOKButtonText: "Uninstall", strCancelButtonText: "Cancel", onOK: async () => {
                try {
                    setUninstalling(true);
                    stopDataUpdates();
                    const result = await uninstallDsu();
                    if (result.status === "success") {
                        setServiceStatus({ installed: false, running: false });
                    }
                    else {
                        console.error("Uninstallation failed:", result.message);
                    }
                }
                catch (error) {
                    console.error("Error uninstalling DSU:", error);
                }
                finally {
                    setUninstalling(false);
                }
            } }));
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
            }
            else {
                const result = await startDsuService();
                if (result.status === "success") {
                    setServiceStatus({ ...serviceStatus, running: true });
                    if (settings?.enabled) {
                        startDataUpdates();
                    }
                }
            }
        }
        catch (error) {
            console.error("Error toggling service:", error);
        }
    };
    // Handle enable/disable toggle
    const handleEnabledToggle = async (enabled) => {
        try {
            const result = await toggleEnabled(enabled);
            if (result.status === "success") {
                setSettings(prev => prev ? { ...prev, enabled } : null);
                if (enabled && serviceStatus.running) {
                    startDataUpdates();
                }
                else {
                    stopDataUpdates();
                }
            }
        }
        catch (error) {
            console.error("Error toggling enabled state:", error);
        }
    };
    // Handle sensitivity change
    const handleSensitivityChange = async (value) => {
        try {
            const result = await updateSettings({ sensitivity: value });
            if (result.status === "success") {
                setSettings(prev => prev ? { ...prev, sensitivity: value } : null);
            }
        }
        catch (error) {
            console.error("Error updating sensitivity:", error);
        }
    };
    // Handle overlay toggle
    const handleOverlayToggle = async (show) => {
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
    const handleAutoActivateToggle = async (auto_activate) => {
        try {
            const result = await updateSettings({ auto_activate });
            if (result.status === "success") {
                setSettings(prev => prev ? { ...prev, auto_activate } : null);
            }
        }
        catch (error) {
            console.error("Error toggling auto-activate:", error);
        }
    };
    // Handle calibration button click
    const handleCalibrationClick = async () => {
        try {
            // We'll start calibration directly in the backend when opening the panel
            const result = await callable("start_calibration")();
            if (result.status === "success") {
                setShowCalibration(true);
            }
        }
        catch (error) {
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
            const modal = DFL.showModal(window.SP_REACT.createElement("div", { style: { padding: "16px" } },
                window.SP_REACT.createElement("h3", null, "Visual Style Settings"),
                window.SP_REACT.createElement("p", null, "Select the visual style for motion cues:"),
                window.SP_REACT.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } }, visualStyles.map(style => (window.SP_REACT.createElement("button", { key: style.value, onClick: async () => {
                        const result = await updateSettings({ visual_style: style.value });
                        if (result.status === "success") {
                            setSettings(prev => prev ? { ...prev, visual_style: style.value } : null);
                        }
                    }, style: {
                        padding: "8px",
                        backgroundColor: settings.visual_style === style.value ? "#1a9fff" : "#2b2b2b",
                        border: "none",
                        borderRadius: "4px",
                        color: "white",
                        cursor: "pointer"
                    } }, style.label)))),
                window.SP_REACT.createElement("h4", { style: { marginTop: "16px" } }, "Color"),
                window.SP_REACT.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px" } }, colors.map(color => (window.SP_REACT.createElement("div", { key: color.value, onClick: async () => {
                        const result = await updateSettings({ color: color.value });
                        if (result.status === "success") {
                            setSettings(prev => prev ? { ...prev, color: color.value } : null);
                        }
                    }, style: {
                        width: "32px",
                        height: "32px",
                        backgroundColor: color.value,
                        border: settings.color === color.value ? "2px solid white" : "2px solid transparent",
                        borderRadius: "4px",
                        cursor: "pointer"
                    } })))),
                window.SP_REACT.createElement("h4", { style: { marginTop: "16px" } }, "Opacity"),
                window.SP_REACT.createElement("div", { style: { display: "flex", alignItems: "center" } },
                    window.SP_REACT.createElement("input", { type: "range", min: "0.1", max: "1.0", step: "0.05", value: settings.opacity, onChange: async (e) => {
                            const value = parseFloat(e.target.value);
                            const result = await updateSettings({ opacity: value });
                            if (result.status === "success") {
                                setSettings(prev => prev ? { ...prev, opacity: value } : null);
                            }
                        }, style: { width: "100%" } }),
                    window.SP_REACT.createElement("div", { style: { marginLeft: "8px", width: "40px" } }, settings.opacity.toFixed(2))),
                window.SP_REACT.createElement("div", { style: {
                        marginTop: "16px",
                        width: "100%",
                        height: "40px",
                        backgroundColor: settings.color,
                        opacity: settings.opacity,
                        borderRadius: "4px"
                    } }),
                window.SP_REACT.createElement("button", { onClick: () => modal.Close(), style: {
                        marginTop: "16px",
                        padding: "8px 16px",
                        backgroundColor: "#1a9fff",
                        border: "none",
                        borderRadius: "4px",
                        color: "white",
                        cursor: "pointer",
                        width: "100%"
                    } }, "Close")));
        }
    };
    // Render debug values
    const renderDebugValues = () => {
        if (!motionData)
            return null;
        const formatValue = (value) => value.toFixed(3);
        return (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement("div", { style: { fontSize: '0.8em', opacity: 0.7 } },
                window.SP_REACT.createElement("div", null,
                    "Accel X: ",
                    formatValue(motionData.accel_x)),
                window.SP_REACT.createElement("div", null,
                    "Accel Y: ",
                    formatValue(motionData.accel_y)),
                window.SP_REACT.createElement("div", null,
                    "Accel Z: ",
                    formatValue(motionData.accel_z)),
                window.SP_REACT.createElement("div", null,
                    "Gyro Pitch: ",
                    formatValue(motionData.gyro_pitch)),
                window.SP_REACT.createElement("div", null,
                    "Gyro Yaw: ",
                    formatValue(motionData.gyro_yaw)),
                window.SP_REACT.createElement("div", null,
                    "Gyro Roll: ",
                    formatValue(motionData.gyro_roll)),
                window.SP_REACT.createElement("div", null,
                    "Data fresh: ",
                    motionData.fresh ? "Yes" : "No"))));
    };
    return (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
        window.SP_REACT.createElement(DFL.PanelSection, { title: "Motion Comfort" }, !serviceStatus.installed ? (window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: handleInstall, disabled: installing }, installing ? "Installing..." : "🔧 Install SteamDeckGyroDSU"))) : (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement("div", { style: { color: serviceStatus.running ? "green" : "red" } }, serviceStatus.running ? "🟢 Service Running" : "🔴 Service Stopped")),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: handleServiceToggle }, serviceStatus.running ? "⏹️ Stop Service" : "▶️ Start Service")),
            settings && (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
                window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                    window.SP_REACT.createElement(DFL.ToggleField, { label: "Enable Motion Comfort", description: "Display visual cues to reduce motion sickness", checked: settings.enabled, onChange: handleEnabledToggle, disabled: !serviceStatus.running })),
                settings.enabled && (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
                    window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                        window.SP_REACT.createElement(DFL.SliderField, { label: "Sensitivity", value: settings.sensitivity, min: 0.1, max: 1.0, step: 0.05, onChange: handleSensitivityChange })),
                    window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                        window.SP_REACT.createElement(DFL.ToggleField, { label: "Auto-Activate", description: "Automatically show visual cues when motion is detected", checked: settings.auto_activate, onChange: handleAutoActivateToggle })),
                    window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                        window.SP_REACT.createElement(DFL.ToggleField, { label: "Show Visual Cues", description: "Manually toggle visual cues overlay", checked: showOverlay, onChange: handleOverlayToggle })),
                    window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                        window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: handleCalibrationClick }, "\uD83D\uDD04 Calibrate Motion Sensors")),
                    window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                        window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: handleStylesClick }, "\uD83C\uDFA8 Visual Style Settings")),
                    renderDebugValues())))),
            window.SP_REACT.createElement(DFL.PanelSectionRow, null,
                window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: handleUninstall, disabled: uninstalling }, uninstalling ? "Uninstalling..." : "🗑️ Uninstall SteamDeckGyroDSU"))))),
        showOverlay && settings && motionData && (window.SP_REACT.createElement(MotionOverlay, { motionData: motionData, settings: settings })),
        showCalibration && motionData && (window.SP_REACT.createElement(CalibrationPanel, { motionData: motionData, onCancel: () => setShowCalibration(false), onComplete: (scaleX, scaleY, scaleZ) => {
                finishCalibration(scaleX, scaleY, scaleZ);
                setShowCalibration(false);
            }, onSetOffsets: async () => {
                await setCalibrationOffsets();
            } }))));
}
var index = definePlugin(() => ({
    name: "Motion Comfort",
    titleView: window.SP_REACT.createElement("div", null, "Motion Comfort"),
    alwaysRender: true,
    content: window.SP_REACT.createElement(MotionComfortContent, null),
    icon: window.SP_REACT.createElement(FiActivity, null),
    onDismount() {
        console.log("Plugin unmounted");
    },
}));

export { index as default };
//# sourceMappingURL=index.js.map
