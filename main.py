import decky
import os
import subprocess
import shutil
import zipfile
import threading
import socket
import json
import time
import math
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import signal
from datetime import datetime, timedelta

class MotionServicePlugin:
    def __init__(self):
        self.service_path = os.path.expanduser("~/sdmotion")
        self.binary_path = os.path.join(self.service_path, "sdmotion")
        self.motion_data_thread = None
        self.motion_data_running = False
        self.latest_motion_data = {}
        self.motion_history = []
        self.motion_alerts = []
        self.cues_enabled = False
        self.sensitivity_level = 2  # 1=Low, 2=Medium, 3=High
        self.cue_types = ["visual", "haptic"]  # visual, haptic, audio
        
        # Motion sickness detection parameters
        self.motion_thresholds = {
            1: {"gyro": 50, "accel": 1.5, "time_window": 3},    # Low sensitivity
            2: {"gyro": 30, "accel": 1.3, "time_window": 2},    # Medium sensitivity  
            3: {"gyro": 20, "accel": 1.1, "time_window": 1.5}   # High sensitivity
        }
        
        # Create service directory
        os.makedirs(self.service_path, exist_ok=True)

    def _get_bin_dir(self) -> Path:
        """Get the bin directory path with detailed logging"""
        plugin_dir = Path(decky.DECKY_PLUGIN_DIR)
        decky.logger.info(f"Plugin directory: {plugin_dir}")
        
        # Check for bin directory (decky store installation)
        bin_dir = plugin_dir / "bin"
        decky.logger.info(f"Checking bin directory: {bin_dir}")
        decky.logger.info(f"Bin directory exists: {bin_dir.exists()}")
        
        if bin_dir.exists():
            # List contents for debugging
            try:
                contents = list(bin_dir.iterdir())
                decky.logger.info(f"Bin directory contents: {[str(f.name) for f in contents]}")
            except Exception as e:
                decky.logger.error(f"Error listing bin contents: {e}")
            return bin_dir
            
        # Check defaults/bin (development)
        defaults_bin = plugin_dir / "defaults" / "bin"
        decky.logger.info(f"Checking defaults/bin directory: {defaults_bin}")
        decky.logger.info(f"Defaults/bin directory exists: {defaults_bin.exists()}")
        
        if defaults_bin.exists():
            try:
                contents = list(defaults_bin.iterdir())
                decky.logger.info(f"Defaults/bin directory contents: {[str(f.name) for f in contents]}")
            except Exception as e:
                decky.logger.error(f"Error listing defaults/bin contents: {e}")
            return defaults_bin
        
        # Fallback to bin (even if it doesn't exist, for error reporting)
        decky.logger.warning(f"Neither {bin_dir} nor {defaults_bin} exists, defaulting to {bin_dir}")
        return bin_dir

    async def _main(self):
        """Plugin initialization"""
        bin_dir = self._get_bin_dir()
        decky.logger.info(f"Motion Service plugin loaded. Bin directory: {bin_dir}")

    async def _unload(self):
        """Plugin cleanup"""
        await self.stop_motion_service()
        decky.logger.info("Motion Service plugin unloaded")

    async def install_motion_service(self) -> Dict[str, Any]:
        """Install the motion service from downloaded binary"""
        try:
            bin_dir = self._get_bin_dir()
            decky.logger.info(f"Starting installation from bin directory: {bin_dir}")
            
            # Try different possible zip file names
            possible_zip_names = [
                "steamdeck_motion_service.zip",
                "SteamDeckMotionSetup.zip",
                "steamdeck-motion-service.zip"
            ]
            
            zip_path = None
            for zip_name in possible_zip_names:
                test_path = bin_dir / zip_name
                decky.logger.info(f"Checking for zip file: {test_path}")
                if test_path.exists():
                    zip_path = test_path
                    decky.logger.info(f"Found zip file: {zip_path}")
                    break
            
            # If no specific zip found, try to find any zip file in the directory
            if not zip_path and bin_dir.exists():
                decky.logger.info("No specific zip found, searching for any .zip files...")
                try:
                    zip_files = list(bin_dir.glob("*.zip"))
                    decky.logger.info(f"Found zip files: {[str(f.name) for f in zip_files]}")
                    if zip_files:
                        zip_path = zip_files[0]  # Use the first zip file found
                        decky.logger.info(f"Using first zip file: {zip_path}")
                except Exception as e:
                    decky.logger.error(f"Error searching for zip files: {e}")
            
            if not zip_path or not zip_path.exists():
                error_msg = f"Motion service binary not found in {bin_dir}. Checked: {possible_zip_names}"
                decky.logger.error(error_msg)
                return {"status": "error", "message": error_msg}
            
            decky.logger.info(f"Installing motion service from {zip_path}")
            decky.logger.info(f"Zip file size: {zip_path.stat().st_size} bytes")
            
            # Create service directory
            decky.logger.info(f"Creating service directory: {self.service_path}")
            os.makedirs(self.service_path, exist_ok=True)
            
            # Extract the zip file
            decky.logger.info("Extracting zip file...")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(self.service_path)
            
            decky.logger.info("Zip extraction completed")
            
            # Find the install script
            install_script = None
            decky.logger.info(f"Searching for install script in {self.service_path}")
            
            for root, dirs, files in os.walk(self.service_path):
                decky.logger.info(f"Checking directory: {root}, files: {files}")
                if "install.sh" in files:
                    install_script = os.path.join(root, "install.sh")
                    decky.logger.info(f"Found install script: {install_script}")
                    break
            
            if not install_script:
                error_msg = f"Install script not found in extracted files. Service path: {self.service_path}"
                decky.logger.error(error_msg)
                # List all extracted files for debugging
                try:
                    all_files = []
                    for root, dirs, files in os.walk(self.service_path):
                        for file in files:
                            all_files.append(os.path.join(root, file))
                    decky.logger.info(f"All extracted files: {all_files}")
                except Exception as e:
                    decky.logger.error(f"Error listing extracted files: {e}")
                return {"status": "error", "message": error_msg}
            
            # Make install script executable
            decky.logger.info(f"Making install script executable: {install_script}")
            os.chmod(install_script, 0o755)
            
            # Run the install script
            decky.logger.info("Running install script...")
            result = subprocess.run(
                ["/bin/bash", install_script],
                cwd=os.path.dirname(install_script),
                capture_output=True,
                text=True,
                timeout=120  # Increased timeout to 2 minutes
            )
            
            decky.logger.info(f"Install script exit code: {result.returncode}")
            decky.logger.info(f"Install script stdout: {result.stdout}")
            decky.logger.info(f"Install script stderr: {result.stderr}")
            
            if result.returncode == 0:
                decky.logger.info("Motion service installed successfully")
                return {
                    "status": "success", 
                    "message": "Motion service installed successfully",
                    "output": result.stdout
                }
            else:
                error_msg = f"Installation failed with exit code {result.returncode}: {result.stderr}"
                decky.logger.error(error_msg)
                return {
                    "status": "error", 
                    "message": error_msg
                }
                
        except Exception as e:
            error_msg = f"Installation error: {str(e)}"
            decky.logger.error(error_msg)
            import traceback
            decky.logger.error(f"Full traceback: {traceback.format_exc()}")
            return {"status": "error", "message": error_msg}

    async def check_service_status(self) -> Dict[str, Any]:
        """Check if the motion service is installed and running"""
        try:
            # Check if binary exists
            if not os.path.exists(self.binary_path):
                return {
                    "status": "not_installed",
                    "installed": False,
                    "running": False,
                    "message": "Motion service not installed"
                }
            
            # Check if service is running via systemd
            try:
                result = subprocess.run(
                    ["systemctl", "--user", "is-active", "sdmotion"],
                    capture_output=True,
                    text=True
                )
                
                is_running = result.returncode == 0 and result.stdout.strip() == "active"
                
                # Check if UDP port is open
                udp_open = False
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                    sock.settimeout(1)
                    sock.sendto(b"test", ("127.0.0.1", 27760))
                    sock.close()
                    udp_open = True
                except:
                    pass
                
                return {
                    "status": "success",
                    "installed": True,
                    "running": is_running,
                    "udp_available": udp_open,
                    "message": "Service running" if is_running else "Service stopped"
                }
                
            except Exception as e:
                return {
                    "status": "success",
                    "installed": True,
                    "running": False,
                    "message": f"Cannot check service status: {str(e)}"
                }
                
        except Exception as e:
            decky.logger.error(f"Status check error: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def start_motion_service(self) -> Dict[str, Any]:
        """Start the motion service"""
        try:
            if not os.path.exists(self.binary_path):
                return {"status": "error", "message": "Motion service not installed"}
            
            # Start via systemd
            result = subprocess.run(
                ["systemctl", "--user", "start", "sdmotion"],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                # Wait a moment for service to fully start
                time.sleep(2)
                decky.logger.info("Motion service started")
                return {"status": "success", "message": "Motion service started"}
            else:
                decky.logger.error(f"Failed to start service: {result.stderr}")
                return {"status": "error", "message": f"Failed to start: {result.stderr}"}
                
        except Exception as e:
            decky.logger.error(f"Start service error: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def stop_motion_service(self) -> Dict[str, Any]:
        """Stop the motion service"""
        try:
            # Stop motion data monitoring
            self.motion_data_running = False
            if self.motion_data_thread and self.motion_data_thread.is_alive():
                self.motion_data_thread.join(timeout=2)
            
            # Stop via systemd
            result = subprocess.run(
                ["systemctl", "--user", "stop", "sdmotion"],
                capture_output=True,
                text=True
            )
            
            decky.logger.info("Motion service stopped")
            return {"status": "success", "message": "Motion service stopped"}
                
        except Exception as e:
            decky.logger.error(f"Stop service error: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def uninstall_motion_service(self) -> Dict[str, Any]:
        """Uninstall the motion service"""
        try:
            # Stop the service first
            await self.stop_motion_service()
            
            # Remove systemd service
            try:
                subprocess.run(
                    ["systemctl", "--user", "disable", "sdmotion"],
                    capture_output=True
                )
            except:
                pass
            
            # Remove service files
            if os.path.exists(self.service_path):
                shutil.rmtree(self.service_path)
            
            # Remove systemd service file
            service_file = os.path.expanduser("~/.config/systemd/user/sdmotion.service")
            if os.path.exists(service_file):
                os.remove(service_file)
            
            decky.logger.info("Motion service uninstalled")
            return {"status": "success", "message": "Motion service uninstalled"}
            
        except Exception as e:
            decky.logger.error(f"Uninstall error: {str(e)}")
            return {"status": "error", "message": str(e)}

    def _monitor_motion_data(self):
        """Background thread to monitor motion data and detect motion sickness patterns"""
        sock = None
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.bind(('', 0))  # Bind to any available port
            sock.settimeout(2.0)
            
            # Register with motion service
            sock.sendto(b"register", ('127.0.0.1', 27760))
            
            decky.logger.info(f"Motion monitoring started on port {sock.getsockname()[1]}")
            
            while self.motion_data_running:
                try:
                    data, addr = sock.recvfrom(1024)
                    motion_data = json.loads(data.decode('utf-8'))
                    
                    # Update latest data
                    self.latest_motion_data = motion_data
                    
                    # Add to history (keep last 100 samples)
                    self.motion_history.append(motion_data)
                    if len(self.motion_history) > 100:
                        self.motion_history.pop(0)
                    
                    # Analyze for motion sickness if cues are enabled
                    if self.cues_enabled:
                        self._analyze_motion_for_sickness(motion_data)
                        
                except socket.timeout:
                    # Re-register periodically
                    sock.sendto(b"register", ('127.0.0.1', 27760))
                    continue
                except json.JSONDecodeError:
                    continue
                except Exception as e:
                    decky.logger.error(f"Motion data error: {str(e)}")
                    break
                    
        except Exception as e:
            decky.logger.error(f"Motion monitoring error: {str(e)}")
        finally:
            if sock:
                sock.close()
            decky.logger.info("Motion monitoring stopped")

    def _analyze_motion_for_sickness(self, motion_data: Dict[str, Any]):
        """Analyze motion data for patterns that may cause motion sickness"""
        try:
            threshold = self.motion_thresholds[self.sensitivity_level]
            
            # Extract motion values
            gyro_magnitude = motion_data.get('magnitude', {}).get('gyro', 0)
            accel_magnitude = motion_data.get('magnitude', {}).get('accel', 0)
            timestamp = motion_data.get('timestamp', 0) / 1_000_000  # Convert to seconds
            
            # Check for sudden motion changes
            motion_event = {
                'timestamp': timestamp,
                'gyro': gyro_magnitude,
                'accel': accel_magnitude,
                'level': 'none'
            }
            
            # Determine motion intensity
            if gyro_magnitude > threshold['gyro'] * 2 or accel_magnitude > threshold['accel'] * 1.5:
                motion_event['level'] = 'severe'
            elif gyro_magnitude > threshold['gyro'] or accel_magnitude > threshold['accel']:
                motion_event['level'] = 'moderate'
            elif gyro_magnitude > threshold['gyro'] * 0.5 or accel_magnitude > threshold['accel'] * 0.7:
                motion_event['level'] = 'mild'
            
            # Only process significant motion events
            if motion_event['level'] != 'none':
                self._trigger_motion_cue(motion_event)
                
        except Exception as e:
            decky.logger.error(f"Motion analysis error: {str(e)}")

    def _trigger_motion_cue(self, motion_event: Dict[str, Any]):
        """Trigger motion cues based on detected motion patterns"""
        try:
            current_time = time.time()
            
            # Avoid spamming cues (minimum 1 second between cues)
            if hasattr(self, '_last_cue_time') and current_time - self._last_cue_time < 1.0:
                return
            
            self._last_cue_time = current_time
            
            # Create cue alert
            alert = {
                'timestamp': current_time,
                'level': motion_event['level'],
                'gyro': motion_event['gyro'],
                'accel': motion_event['accel'],
                'cue_types': self.cue_types.copy()
            }
            
            # Add to alerts list (keep last 10)
            self.motion_alerts.append(alert)
            if len(self.motion_alerts) > 10:
                self.motion_alerts.pop(0)
            
            decky.logger.info(f"Motion cue triggered: {motion_event['level']} intensity")
            
            # Trigger haptic feedback if enabled
            if "haptic" in self.cue_types:
                self._trigger_haptic_feedback(motion_event['level'])
                
        except Exception as e:
            decky.logger.error(f"Motion cue error: {str(e)}")

    def _trigger_haptic_feedback(self, level: str):
        """Trigger Steam Deck haptic feedback"""
        try:
            # Use Steam Controller haptic feedback
            # Intensity based on motion level
            intensity_map = {
                'mild': 1000,
                'moderate': 2000,
                'severe': 3000
            }
            
            intensity = intensity_map.get(level, 1000)
            
            # Trigger haptic feedback via Steam API if available
            # This is a placeholder - actual implementation would use Steam API
            decky.logger.info(f"Haptic feedback triggered with intensity {intensity}")
            
        except Exception as e:
            decky.logger.error(f"Haptic feedback error: {str(e)}")

    async def start_motion_monitoring(self) -> Dict[str, Any]:
        """Start monitoring motion data for cues"""
        try:
            if self.motion_data_running:
                return {"status": "success", "message": "Motion monitoring already running"}
            
            self.motion_data_running = True
            self.motion_data_thread = threading.Thread(target=self._monitor_motion_data, daemon=True)
            self.motion_data_thread.start()
            
            decky.logger.info("Motion monitoring started")
            return {"status": "success", "message": "Motion monitoring started"}
            
        except Exception as e:
            decky.logger.error(f"Start monitoring error: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def stop_motion_monitoring(self) -> Dict[str, Any]:
        """Stop monitoring motion data"""
        try:
            self.motion_data_running = False
            if self.motion_data_thread and self.motion_data_thread.is_alive():
                self.motion_data_thread.join(timeout=3)
            
            decky.logger.info("Motion monitoring stopped")
            return {"status": "success", "message": "Motion monitoring stopped"}
            
        except Exception as e:
            decky.logger.error(f"Stop monitoring error: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def get_motion_data(self) -> Dict[str, Any]:
        """Get latest motion data and alerts"""
        try:
            return {
                "status": "success",
                "latest_data": self.latest_motion_data,
                "monitoring": self.motion_data_running,
                "alerts": self.motion_alerts[-5:],  # Last 5 alerts
                "history_count": len(self.motion_history)
            }
        except Exception as e:
            decky.logger.error(f"Get motion data error: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def set_motion_cues_enabled(self, enabled: bool) -> Dict[str, Any]:
        """Enable or disable motion cues"""
        try:
            self.cues_enabled = enabled
            decky.logger.info(f"Motion cues {'enabled' if enabled else 'disabled'}")
            return {"status": "success", "enabled": enabled}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def set_motion_sensitivity(self, level: int) -> Dict[str, Any]:
        """Set motion sensitivity level (1=Low, 2=Medium, 3=High)"""
        try:
            if level not in [1, 2, 3]:
                return {"status": "error", "message": "Invalid sensitivity level"}
            
            self.sensitivity_level = level
            sensitivity_names = {1: "Low", 2: "Medium", 3: "High"}
            decky.logger.info(f"Motion sensitivity set to {sensitivity_names[level]}")
            return {"status": "success", "level": level, "name": sensitivity_names[level]}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def set_cue_types(self, cue_types: list) -> Dict[str, Any]:
        """Set enabled cue types"""
        try:
            valid_types = ["visual", "haptic", "audio"]
            filtered_types = [t for t in cue_types if t in valid_types]
            
            self.cue_types = filtered_types
            decky.logger.info(f"Cue types set to: {filtered_types}")
            return {"status": "success", "cue_types": filtered_types}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def get_motion_settings(self) -> Dict[str, Any]:
        """Get current motion cue settings"""
        try:
            sensitivity_names = {1: "Low", 2: "Medium", 3: "High"}
            return {
                "status": "success",
                "cues_enabled": self.cues_enabled,
                "sensitivity_level": self.sensitivity_level,
                "sensitivity_name": sensitivity_names[self.sensitivity_level],
                "cue_types": self.cue_types,
                "thresholds": self.motion_thresholds[self.sensitivity_level]
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def get_debug_info(self) -> Dict[str, Any]:
        """Get debug information about plugin directories and files"""
        try:
            plugin_dir = Path(decky.DECKY_PLUGIN_DIR)
            bin_dir = self._get_bin_dir()
            
            debug_info = {
                "status": "success",
                "plugin_dir": str(plugin_dir),
                "plugin_dir_exists": plugin_dir.exists(),
                "bin_dir": str(bin_dir),
                "bin_dir_exists": bin_dir.exists(),
                "service_path": self.service_path,
                "service_path_exists": os.path.exists(self.service_path),
                "binary_path": self.binary_path,
                "binary_path_exists": os.path.exists(self.binary_path)
            }
            
            # List plugin directory contents
            if plugin_dir.exists():
                try:
                    debug_info["plugin_dir_contents"] = [str(f.name) for f in plugin_dir.iterdir()]
                except Exception as e:
                    debug_info["plugin_dir_contents"] = f"Error: {e}"
            
            # List bin directory contents
            if bin_dir.exists():
                try:
                    debug_info["bin_dir_contents"] = [str(f.name) for f in bin_dir.iterdir()]
                except Exception as e:
                    debug_info["bin_dir_contents"] = f"Error: {e}"
            
            # List service directory contents
            if os.path.exists(self.service_path):
                try:
                    debug_info["service_dir_contents"] = os.listdir(self.service_path)
                except Exception as e:
                    debug_info["service_dir_contents"] = f"Error: {e}"
            
            return debug_info
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def toggle_motion_cues(self) -> Dict[str, Any]:
        """Toggle motion cues on/off quickly"""
        try:
            self.cues_enabled = not self.cues_enabled
            status = "enabled" if self.cues_enabled else "disabled"
            decky.logger.info(f"Motion cues {status}")
            return {
                "status": "success", 
                "enabled": self.cues_enabled,
                "message": f"Motion cues {status}"
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def clear_motion_alerts(self) -> Dict[str, Any]:
        """Clear motion alerts history"""
        try:
            self.motion_alerts.clear()
            return {"status": "success", "message": "Motion alerts cleared"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def log_error(self, error: str) -> None:
        """Log frontend errors"""
        decky.logger.error(f"FRONTEND: {error}")

# Plugin instance
Plugin = MotionServicePlugin
