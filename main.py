import decky
import os
import subprocess
import json
import threading
import socket
import struct
import time
import urllib.request
import ssl
from pathlib import Path

# Constants
DSU_PORT = 26760
BUFFER_SIZE = 4096
DEFAULT_SETTINGS = {
    "enabled": False,
    "sensitivity": 0.5,
    "visual_style": "edge_lines",
    "color": "#00FF00",
    "opacity": 0.7,
    "auto_activate": True,
    "calibration": {
        "offset_x": 0.0,
        "offset_y": 0.0, 
        "offset_z": 0.0,
        "scale_x": 1.0,
        "scale_y": 1.0,
        "scale_z": 1.0
    }
}

class MotionData:
    def __init__(self):
        self.accel_x = 0.0
        self.accel_y = 0.0
        self.accel_z = 0.0
        self.gyro_pitch = 0.0
        self.gyro_yaw = 0.0
        self.gyro_roll = 0.0
        self.timestamp = 0

class Plugin:
    motion_data = MotionData()
    settings = DEFAULT_SETTINGS.copy()
    dsu_running = False
    dsu_installed = False
    motion_client_running = False
    motion_client_thread = None
    
    def __init__(self):
        # Create necessary directories
        self.settings_dir = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR)
        self.settings_file = os.path.join(self.settings_dir, "settings.json")
        self.presets_dir = os.path.join(self.settings_dir, "presets")
        
        os.makedirs(self.settings_dir, exist_ok=True)
        os.makedirs(self.presets_dir, exist_ok=True)
        
        # Load settings
        self.load_settings()
    
    async def _main(self):
        # Check if SteamDeckGyroDSU is installed
        self.check_dsu_installed()
        
        # Start the motion client if enabled
        if self.settings["enabled"]:
            self.start_motion_client()
        
        decky.logger.info("Motion Comfort plugin loaded")
    
    async def _unload(self):
        # Stop the motion client
        self.stop_motion_client()
        decky.logger.info("Motion Comfort plugin unloaded")
    
    def load_settings(self):
        try:
            if os.path.exists(self.settings_file):
                with open(self.settings_file, 'r') as f:
                    loaded_settings = json.load(f)
                    # Ensure all default settings exist by merging
                    self.settings = {**DEFAULT_SETTINGS, **loaded_settings}
            else:
                # Create default settings file
                self.save_settings()
        except Exception as e:
            decky.logger.error(f"Error loading settings: {str(e)}")
    
    def save_settings(self):
        try:
            with open(self.settings_file, 'w') as f:
                json.dump(self.settings, f, indent=2)
            return {"status": "success"}
        except Exception as e:
            decky.logger.error(f"Error saving settings: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def check_dsu_installed(self):
        # Check if binary exists
        service_path = os.path.expanduser("~/sdgyrodsu/sdgyrodsu")
        self.dsu_installed = os.path.exists(service_path)
        
        # Check if service is running with clean environment
        try:
            # Create clean environment to avoid SSL issues
            clean_env = {}
            for key, value in os.environ.items():
                if key not in ['LD_LIBRARY_PATH', 'LD_PRELOAD']:
                    clean_env[key] = value
            clean_env['PATH'] = '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
            
            result = subprocess.run(
                ["systemctl", "--user", "is-active", "sdgyrodsu.service"],
                capture_output=True,
                text=True,
                timeout=5,
                env=clean_env
            )
            self.dsu_running = result.stdout.strip() == "active"
            
            # If systemctl fails but binary exists, check if process is running
            if not self.dsu_running and self.dsu_installed:
                try:
                    pgrep_result = subprocess.run(
                        ["pgrep", "-f", "sdgyrodsu"],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    self.dsu_running = pgrep_result.returncode == 0
                    if self.dsu_running:
                        decky.logger.info("Service detected via pgrep instead of systemctl")
                except Exception:
                    pass
                    
            decky.logger.info(f"Service status check: installed={self.dsu_installed}, running={self.dsu_running}")
        except Exception as e:
            decky.logger.error(f"Error checking DSU service: {str(e)}")
            self.dsu_running = False
        
        return {
            "installed": self.dsu_installed,
            "running": self.dsu_running
        }
    
    def parse_dsu_packet(self, data):
        # Ensure packet is long enough
        if len(data) < 100:  # Minimum expected length for a data packet
            return None
        
        # Check if it's a data packet (event type 0x100002)
        event_type = struct.unpack("<I", data[12:16])[0]
        if event_type != 0x100002:
            return None
        
        try:
            # Extract motion data
            # Position of motion data is after header (16 bytes) + shared response (16 bytes) + packetNumber (4) + buttons/controls
            motion_offset = 84  # Approximate offset to motion data
            
            # Extract accelerometer data (3 floats)
            accel_x = struct.unpack("<f", data[motion_offset:motion_offset+4])[0]
            accel_y = struct.unpack("<f", data[motion_offset+4:motion_offset+8])[0]
            accel_z = struct.unpack("<f", data[motion_offset+8:motion_offset+12])[0]
            
            # Extract gyroscope data (3 floats)
            gyro_pitch = struct.unpack("<f", data[motion_offset+12:motion_offset+16])[0]
            gyro_yaw = struct.unpack("<f", data[motion_offset+16:motion_offset+20])[0]
            gyro_roll = struct.unpack("<f", data[motion_offset+20:motion_offset+24])[0]
            
            # Update motion data
            self.motion_data.accel_x = accel_x
            self.motion_data.accel_y = accel_y
            self.motion_data.accel_z = accel_z
            self.motion_data.gyro_pitch = gyro_pitch
            self.motion_data.gyro_yaw = gyro_yaw
            self.motion_data.gyro_roll = gyro_roll
            self.motion_data.timestamp = time.time()
            
            return self.motion_data
        except Exception as e:
            decky.logger.error(f"Error parsing DSU packet: {str(e)}")
            return None
    
    def motion_client_loop(self):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.bind(("127.0.0.1", 0))  # Bind to any available port
            sock.settimeout(1.0)  # 1 second timeout
            
            # Subscribe to controller data (simple)
            packet = bytearray([
                0x44, 0x53, 0x55, 0x43,  # DSUC
                0xE9, 0x03,              # Version 1001
                0x0C, 0x00,              # Packet size (12 bytes)
                0x00, 0x00, 0x00, 0x00,  # CRC (not calculated)
                0x01, 0x00, 0x00, 0x00,  # Client ID
                0x02, 0x00, 0x01, 0x00,  # Protocol, type: 0x100002 (data event)
                0x01,                    # Subscription by slot
                0x00,                    # Slot 0 (Steam Deck)
                0x00, 0x00, 0x00, 0x00,  # MAC
                0x00, 0x00               # MAC
            ])
            
            # Send subscription packet
            sock.sendto(packet, ("127.0.0.1", DSU_PORT))
            
            self.motion_client_running = True
            decky.logger.info("Motion client started")
            
            while self.motion_client_running:
                try:
                    data, addr = sock.recvfrom(BUFFER_SIZE)
                    motion_data = self.parse_dsu_packet(data)
                    # Data is now available in self.motion_data
                except socket.timeout:
                    # This is normal, just retry
                    pass
                except Exception as e:
                    decky.logger.error(f"Error in motion client: {str(e)}")
                    time.sleep(1)  # Don't flood logs if there's a persistent error
        
        except Exception as e:
            decky.logger.error(f"Motion client error: {str(e)}")
        finally:
            sock.close()
            self.motion_client_running = False
            decky.logger.info("Motion client stopped")
    
    def start_motion_client(self):
        if not self.motion_client_running and self.dsu_running:
            self.motion_client_thread = threading.Thread(target=self.motion_client_loop)
            self.motion_client_thread.daemon = True
            self.motion_client_thread.start()
            return {"status": "success"}
        elif not self.dsu_running:
            return {"status": "error", "message": "SteamDeckGyroDSU service is not running"}
        else:
            return {"status": "success", "message": "Motion client already running"}
    
    def stop_motion_client(self):
        if self.motion_client_running:
            self.motion_client_running = False
            if self.motion_client_thread:
                self.motion_client_thread.join(timeout=2.0)
            return {"status": "success"}
        else:
            return {"status": "success", "message": "Motion client not running"}
    
    async def get_motion_data(self):
        # Apply calibration
        cal = self.settings["calibration"]
        adjusted_data = {
            "accel_x": (self.motion_data.accel_x - cal["offset_x"]) * cal["scale_x"],
            "accel_y": (self.motion_data.accel_y - cal["offset_y"]) * cal["scale_y"],
            "accel_z": (self.motion_data.accel_z - cal["offset_z"]) * cal["scale_z"],
            "gyro_pitch": self.motion_data.gyro_pitch,
            "gyro_yaw": self.motion_data.gyro_yaw,
            "gyro_roll": self.motion_data.gyro_roll,
            "timestamp": self.motion_data.timestamp,
            "fresh": (time.time() - self.motion_data.timestamp) < 1.0
        }
        return adjusted_data
    
    async def install_dsu(self):
        try:
            decky.logger.info("Starting SteamDeckGyroDSU installation...")
            
            # The zip file is already downloaded by decky loader to the bin directory
            bin_dir = os.path.join(decky.DECKY_PLUGIN_DIR, "bin")
            zip_path = os.path.join(bin_dir, "SteamDeckGyroDSUSetup.zip")
            
            decky.logger.info(f"Looking for zip file at: {zip_path}")
            
            if not os.path.exists(zip_path):
                decky.logger.error(f"Zip file not found at {zip_path}")
                return {"status": "error", "message": "SteamDeckGyroDSU installation files not found. Please restart Steam to download required files."}
            
            # Check file size
            file_size = os.path.getsize(zip_path)
            decky.logger.info(f"Zip file size: {file_size} bytes")
            
            if file_size < 1000:
                return {"status": "error", "message": "Installation file appears to be corrupted"}
            
            decky.logger.info("Extracting SteamDeckGyroDSU...")
            
            # Extract the zip file to a temp directory first
            temp_extract_dir = os.path.expanduser("~/temp_sdgyrodsu_install")
            extract_cmd = ["unzip", "-o", zip_path, "-d", temp_extract_dir]
            extract_result = subprocess.run(extract_cmd, capture_output=True, text=True, timeout=30)
            
            if extract_result.returncode != 0:
                decky.logger.error(f"Extraction failed: {extract_result.stderr}")
                return {"status": "error", "message": f"Extraction failed: {extract_result.stderr}"}
            
            decky.logger.info("Extraction completed")
            
            # Now manually do what install.sh does, but in Python
            setup_dir = os.path.join(temp_extract_dir, "SteamDeckGyroDSUSetup")
            
            if not os.path.exists(setup_dir):
                return {"status": "error", "message": "Setup directory not found after extraction"}
            
            # Step 1: Create ~/sdgyrodsu directory
            decky.logger.info("Creating sdgyrodsu directory...")
            sdgyrodsu_dir = os.path.expanduser("~/sdgyrodsu")
            os.makedirs(sdgyrodsu_dir, exist_ok=True)
            
            # Step 2: Copy binary files
            decky.logger.info("Copying binary files...")
            import shutil
            
            files_to_copy = [
                "sdgyrodsu",
                "update.sh", 
                "uninstall.sh",
                "v1cleanup.sh",
                "logcurrentrun.sh"
            ]
            
            for file_name in files_to_copy:
                src = os.path.join(setup_dir, file_name)
                dst = os.path.join(sdgyrodsu_dir, file_name)
                
                if os.path.exists(src):
                    shutil.copy2(src, dst)
                    # Make executable
                    os.chmod(dst, 0o755)
                    decky.logger.info(f"Copied and made executable: {file_name}")
                else:
                    decky.logger.warning(f"File not found: {src}")
            
            # Step 3: Copy service file
            decky.logger.info("Installing systemd service...")
            systemd_user_dir = os.path.expanduser("~/.config/systemd/user")
            os.makedirs(systemd_user_dir, exist_ok=True)
            
            service_src = os.path.join(setup_dir, "sdgyrodsu.service")
            service_dst = os.path.join(systemd_user_dir, "sdgyrodsu.service")
            
            if os.path.exists(service_src):
                shutil.copy2(service_src, service_dst)
                decky.logger.info("Service file copied")
            else:
                return {"status": "error", "message": "Service file not found"}
            
            # Step 4: Try to enable and start service with clean environment
            decky.logger.info("Attempting to start service...")
            
            # First, try to reload systemd daemon with clean environment
            try:
                # Create a clean environment without Python's temp paths
                clean_env = {}
                for key, value in os.environ.items():
                    if key not in ['LD_LIBRARY_PATH', 'LD_PRELOAD']:
                        clean_env[key] = value
                
                # Set clean PATH
                clean_env['PATH'] = '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
                
                subprocess.run(["systemctl", "--user", "daemon-reload"], 
                             capture_output=True, text=True, timeout=10, env=clean_env)
                decky.logger.info("Systemd daemon reloaded with clean environment")
            except Exception as e:
                decky.logger.warning(f"Failed to reload daemon: {e}")
            
            # Try to enable and start service with clean environment
            service_started = False
            try:
                enable_result = subprocess.run(
                    ["systemctl", "--user", "enable", "sdgyrodsu.service"],
                    capture_output=True, text=True, timeout=10, env=clean_env
                )
                if enable_result.returncode == 0:
                    decky.logger.info("Service enabled successfully")
                else:
                    decky.logger.warning(f"Service enable failed: {enable_result.stderr}")
                
                start_result = subprocess.run(
                    ["systemctl", "--user", "start", "sdgyrodsu.service"],
                    capture_output=True, text=True, timeout=10, env=clean_env
                )
                if start_result.returncode == 0:
                    decky.logger.info("Service started successfully")
                    service_started = True
                else:
                    decky.logger.warning(f"Service start failed: {start_result.stderr}")
                    
            except Exception as e:
                decky.logger.warning(f"systemctl commands failed even with clean environment: {e}")
            
            # If systemctl still fails, try starting binary directly
            if not service_started:
                decky.logger.info("systemctl failed, trying to start binary directly...")
                try:
                    binary_path = os.path.join(sdgyrodsu_dir, "sdgyrodsu")
                    if os.path.exists(binary_path):
                        # Start in background with clean environment
                        process = subprocess.Popen([binary_path], 
                                       cwd=sdgyrodsu_dir,
                                       stdout=subprocess.DEVNULL,
                                       stderr=subprocess.DEVNULL,
                                       env=clean_env)
                        decky.logger.info(f"Started binary directly with PID: {process.pid}")
                        time.sleep(2)  # Give it time to start
                        
                        # Check if process is still running
                        if process.poll() is None:
                            decky.logger.info("Binary is running successfully")
                            service_started = True
                        else:
                            decky.logger.warning("Binary exited immediately")
                            
                except Exception as binary_error:
                    decky.logger.warning(f"Direct binary start failed: {binary_error}")
            
            # Clean up extraction directory
            try:
                shutil.rmtree(temp_extract_dir, ignore_errors=True)
            except:
                pass
            
            decky.logger.info("Installation completed, checking status...")
            
            # Give it a moment for everything to settle
            time.sleep(3)
            
            # Check if installation succeeded
            service_check = self.check_dsu_installed()
            decky.logger.info(f"Post-install check: {service_check}")
            
            # Update our internal state
            self.dsu_installed = service_check["installed"]
            self.dsu_running = service_check["running"]
            
            if service_check["installed"]:
                if service_check["running"]:
                    return {"status": "success", "message": "SteamDeckGyroDSU installed and started successfully"}
                else:
                    return {"status": "success", "message": "SteamDeckGyroDSU installed successfully. You may need to manually start it from Steam Deck settings."}
            else:
                return {"status": "error", "message": "Installation files copied but service not detected"}
        
        except subprocess.TimeoutExpired:
            decky.logger.error("Installation timed out")
            return {"status": "error", "message": "Installation timed out"}
        except Exception as e:
            decky.logger.error(f"Error installing DSU: {str(e)}")
            return {"status": "error", "message": str(e)}
            
            decky.logger.info("Download completed, extracting...")
            
            # Extract the zip file to home directory
            extract_cmd = ["unzip", "-o", zip_path, "-d", os.path.expanduser("~")]
            extract_result = subprocess.run(extract_cmd, capture_output=True, text=True, timeout=30)
            
            if extract_result.returncode != 0:
                decky.logger.error(f"Extraction failed: {extract_result.stderr}")
                return {"status": "error", "message": f"Extraction failed: {extract_result.stderr}"}
            
            decky.logger.info("Extraction completed")
            
            # Clean up the zip file
            try:
                os.remove(zip_path)
            except:
                pass
            
            # Check if install script exists
            install_script_path = os.path.expanduser("~/SteamDeckGyroDSUSetup/install.sh")
            
            if not os.path.exists(install_script_path):
                return {"status": "error", "message": "Install script not found after extraction"}
            
            # Make the install script executable
            subprocess.run(["chmod", "+x", install_script_path], capture_output=True, timeout=10)
            
            decky.logger.info("Running installer...")
            
            # Run the installer with proper environment
            install_result = subprocess.run(
                ["bash", "./install.sh"],
                cwd=os.path.expanduser("~/SteamDeckGyroDSUSetup"),
                capture_output=True,
                text=True,
                timeout=120,
                env=os.environ.copy()
            )
            
            decky.logger.info(f"Installer stdout: {install_result.stdout}")
            if install_result.stderr:
                decky.logger.warning(f"Installer stderr: {install_result.stderr}")
            
            if install_result.returncode != 0:
                decky.logger.error(f"Installation failed with return code {install_result.returncode}")
                return {"status": "error", "message": f"Installation failed: {install_result.stderr or 'Unknown error'}"}
            
            # Clean up the extracted directory
            import shutil
            try:
                shutil.rmtree(os.path.expanduser("~/SteamDeckGyroDSUSetup"), ignore_errors=True)
            except:
                pass
            
            decky.logger.info("Installation completed, checking status...")
            
            # Give it a moment for the service to start
            time.sleep(2)
            
            # Check if installation succeeded
            service_check = self.check_dsu_installed()
            
            decky.logger.info(f"Post-install check: {service_check}")
            
            if service_check["installed"]:
                # If installed but not running, try to start it
                if not service_check["running"]:
                    decky.logger.info("Service installed but not running, attempting to start...")
                    try:
                        start_result = subprocess.run(
                            ["systemctl", "--user", "start", "sdgyrodsu.service"],
                            capture_output=True,
                            text=True,
                            timeout=10
                        )
                        if start_result.returncode == 0:
                            time.sleep(1)
                            service_check = self.check_dsu_installed()
                        else:
                            decky.logger.warning(f"Failed to start service: {start_result.stderr}")
                    except Exception as e:
                        decky.logger.warning(f"Error starting service: {e}")
                
                # Update our internal state
                self.dsu_installed = service_check["installed"]
                self.dsu_running = service_check["running"]
                
                if service_check["running"]:
                    return {"status": "success", "message": "SteamDeckGyroDSU installed and started successfully"}
                else:
                    return {"status": "success", "message": "SteamDeckGyroDSU installed successfully (service may need manual start)"}
            else:
                return {"status": "error", "message": "Installation completed but service not found"}
        
        except subprocess.TimeoutExpired:
            decky.logger.error("Installation timed out")
            return {"status": "error", "message": "Installation timed out"}
        except Exception as e:
            decky.logger.error(f"Error installing DSU: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def uninstall_dsu(self):
        try:
            # Stop motion client first
            self.stop_motion_client()
            
            # Check if uninstall script exists
            uninstall_script = os.path.expanduser("~/sdgyrodsu/uninstall.sh")
            
            if os.path.exists(uninstall_script):
                # Run uninstall script
                uninstall_cmd = ["bash", uninstall_script]
                result = subprocess.run(uninstall_cmd, capture_output=True, text=True, timeout=30)
                
                if result.returncode != 0:
                    decky.logger.warning(f"Uninstall script failed: {result.stderr}")
            
            # Force cleanup if script fails or doesn't exist
            try:
                # Stop and disable service
                subprocess.run(["systemctl", "--user", "stop", "sdgyrodsu.service"], 
                             capture_output=True, timeout=10)
                subprocess.run(["systemctl", "--user", "disable", "sdgyrodsu.service"], 
                             capture_output=True, timeout=10)
                
                # Remove service file
                service_file = os.path.expanduser("~/.config/systemd/user/sdgyrodsu.service")
                if os.path.exists(service_file):
                    os.remove(service_file)
                
                # Remove directory
                import shutil
                sdgyrodsu_dir = os.path.expanduser("~/sdgyrodsu")
                if os.path.exists(sdgyrodsu_dir):
                    shutil.rmtree(sdgyrodsu_dir, ignore_errors=True)
                
            except Exception as e:
                decky.logger.warning(f"Error during force cleanup: {e}")
            
            # Update status
            self.dsu_installed = False
            self.dsu_running = False
            
            return {"status": "success", "message": "SteamDeckGyroDSU uninstalled successfully"}
            
        except Exception as e:
            decky.logger.error(f"Error uninstalling DSU: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def start_dsu_service(self):
        try:
            # Create clean environment to avoid SSL issues
            clean_env = {}
            for key, value in os.environ.items():
                if key not in ['LD_LIBRARY_PATH', 'LD_PRELOAD']:
                    clean_env[key] = value
            clean_env['PATH'] = '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
            
            result = subprocess.run(
                ["systemctl", "--user", "start", "sdgyrodsu.service"],
                capture_output=True,
                text=True,
                timeout=10,
                env=clean_env
            )
            
            if result.returncode != 0:
                decky.logger.warning(f"systemctl start failed: {result.stderr}")
                # Try starting binary directly as fallback
                try:
                    binary_path = os.path.expanduser("~/sdgyrodsu/sdgyrodsu")
                    if os.path.exists(binary_path):
                        process = subprocess.Popen([binary_path], 
                                   cwd=os.path.expanduser("~/sdgyrodsu"),
                                   stdout=subprocess.DEVNULL,
                                   stderr=subprocess.DEVNULL,
                                   env=clean_env)
                        decky.logger.info(f"Started binary directly with PID: {process.pid}")
                        time.sleep(2)
                        if process.poll() is None:
                            # Give it a moment and check status
                            time.sleep(1)
                            status_check = self.check_dsu_installed()
                            self.dsu_running = status_check["running"]
                            return {"status": "success", "message": "Service started directly"}
                except Exception as binary_error:
                    return {"status": "error", "message": f"Failed to start service or binary: {binary_error}"}
                
                return {"status": "error", "message": f"Failed to start service: {result.stderr}"}
            
            # Give it a moment and check status
            time.sleep(1)
            status_check = self.check_dsu_installed()
            self.dsu_running = status_check["running"]
            
            return {"status": "success", "message": "Service started successfully"}
            
        except Exception as e:
            decky.logger.error(f"Error starting DSU service: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def stop_dsu_service(self):
        try:
            # Stop motion client first
            self.stop_motion_client()
            
            # Create clean environment to avoid SSL issues
            clean_env = {}
            for key, value in os.environ.items():
                if key not in ['LD_LIBRARY_PATH', 'LD_PRELOAD']:
                    clean_env[key] = value
            clean_env['PATH'] = '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
            
            result = subprocess.run(
                ["systemctl", "--user", "stop", "sdgyrodsu.service"],
                capture_output=True,
                text=True,
                timeout=10,
                env=clean_env
            )
            
            if result.returncode != 0:
                decky.logger.warning(f"systemctl stop failed: {result.stderr}")
                # Try to kill process directly as fallback
                try:
                    subprocess.run(["pkill", "-f", "sdgyrodsu"], capture_output=True, timeout=5)
                    decky.logger.info("Killed sdgyrodsu process directly")
                except Exception as kill_error:
                    decky.logger.warning(f"Failed to kill process: {kill_error}")
            
            self.dsu_running = False
            return {"status": "success", "message": "Service stopped successfully"}
            
        except Exception as e:
            decky.logger.error(f"Error stopping DSU service: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def toggle_enabled(self, enabled):
        try:
            self.settings["enabled"] = enabled
            self.save_settings()
            
            if enabled:
                # Start the motion client if DSU is running
                if self.dsu_running:
                    self.start_motion_client()
                else:
                    # Try to start DSU service
                    await self.start_dsu_service()
                    if self.dsu_running:
                        self.start_motion_client()
            else:
                # Stop the motion client
                self.stop_motion_client()
            
            return {"status": "success", "enabled": enabled}
            
        except Exception as e:
            decky.logger.error(f"Error toggling enabled state: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def update_settings(self, settings):
        try:
            # Update only provided settings
            for key, value in settings.items():
                if key in self.settings:
                    self.settings[key] = value
            
            self.save_settings()
            return {"status": "success", "settings": self.settings}
            
        except Exception as e:
            decky.logger.error(f"Error updating settings: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def get_settings(self):
        return self.settings
    
    async def save_preset(self, name, preset_data):
        try:
            preset_file = os.path.join(self.presets_dir, f"{name}.json")
            with open(preset_file, 'w') as f:
                json.dump(preset_data, f, indent=2)
            return {"status": "success", "message": f"Preset '{name}' saved successfully"}
            
        except Exception as e:
            decky.logger.error(f"Error saving preset: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def load_preset(self, name):
        try:
            preset_file = os.path.join(self.presets_dir, f"{name}.json")
            
            if not os.path.exists(preset_file):
                return {"status": "error", "message": f"Preset '{name}' does not exist"}
            
            with open(preset_file, 'r') as f:
                preset_data = json.load(f)
            
            # Update settings with preset data
            for key, value in preset_data.items():
                if key in self.settings:
                    self.settings[key] = value
            
            self.save_settings()
            return {"status": "success", "settings": self.settings}
            
        except Exception as e:
            decky.logger.error(f"Error loading preset: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def get_presets(self):
        try:
            presets = []
            for file in os.listdir(self.presets_dir):
                if file.endswith(".json"):
                    preset_name = os.path.splitext(file)[0]
                    presets.append(preset_name)
            
            return {"status": "success", "presets": presets}
            
        except Exception as e:
            decky.logger.error(f"Error getting presets: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def delete_preset(self, name):
        try:
            preset_file = os.path.join(self.presets_dir, f"{name}.json")
            
            if not os.path.exists(preset_file):
                return {"status": "error", "message": f"Preset '{name}' does not exist"}
            
            os.remove(preset_file)
            return {"status": "success", "message": f"Preset '{name}' deleted successfully"}
            
        except Exception as e:
            decky.logger.error(f"Error deleting preset: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def start_calibration(self):
        # Reset calibration values
        self.settings["calibration"] = {
            "offset_x": 0.0,
            "offset_y": 0.0,
            "offset_z": 0.0,
            "scale_x": 1.0,
            "scale_y": 1.0,
            "scale_z": 1.0
        }
        
        # Start motion client if not running
        if not self.motion_client_running:
            self.start_motion_client()
        
        return {"status": "success", "message": "Calibration started"}
    
    async def set_calibration_offsets(self):
        # Set current accelerometer values as offsets
        if self.motion_data.timestamp > 0:
            # For offset, we use the current values
            self.settings["calibration"]["offset_x"] = self.motion_data.accel_x
            self.settings["calibration"]["offset_y"] = self.motion_data.accel_y
            self.settings["calibration"]["offset_z"] = self.motion_data.accel_z
            
            self.save_settings()
            return {"status": "success", "calibration": self.settings["calibration"]}
        else:
            return {"status": "error", "message": "No motion data available"}
    
    async def finish_calibration(self, scale_x, scale_y, scale_z):
        # Set scale values
        self.settings["calibration"]["scale_x"] = scale_x
        self.settings["calibration"]["scale_y"] = scale_y
        self.settings["calibration"]["scale_z"] = scale_z
        
        self.save_settings()
        return {"status": "success", "calibration": self.settings["calibration"]}