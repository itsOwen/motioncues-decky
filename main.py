import decky
import os
import subprocess
import json
import threading
import socket
import struct
import time
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
        service_path = os.path.expanduser("~/sdgyrodsu/sdgyrodsu")
        self.dsu_installed = os.path.exists(service_path)
        
        # Check if service is running
        try:
            result = subprocess.run(
                ["systemctl", "--user", "is-active", "sdgyrodsu.service"],
                capture_output=True,
                text=True
            )
            self.dsu_running = result.stdout.strip() == "active"
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
            # Create temp directory
            temp_dir = os.path.join(decky.DECKY_PLUGIN_RUNTIME_DIR, "temp")
            os.makedirs(temp_dir, exist_ok=True)
            
            # Download installation file
            download_cmd = [
                "curl", "-L", "-o", 
                f"{temp_dir}/update-sdgyrodsu.desktop",
                "https://github.com/kmicki/SteamDeckGyroDSU/releases/latest/download/update-sdgyrodsu.desktop"
            ]
            
            result = subprocess.run(download_cmd, capture_output=True, text=True)
            if result.returncode != 0:
                return {"status": "error", "message": f"Download failed: {result.stderr}"}
            
            # Make executable
            subprocess.run(["chmod", "+x", f"{temp_dir}/update-sdgyrodsu.desktop"])
            
            # Run the installer
            install_result = subprocess.run(
                [f"{temp_dir}/update-sdgyrodsu.desktop"],
                capture_output=True,
                text=True
            )
            
            if install_result.returncode != 0:
                return {"status": "error", "message": f"Installation failed: {install_result.stderr}"}
            
            # Check if installation succeeded
            service_check = self.check_dsu_installed()
            
            if service_check["installed"] and service_check["running"]:
                return {"status": "success", "message": "SteamDeckGyroDSU installed successfully"}
            else:
                return {"status": "error", "message": "Installation completed but service not running"}
            
        except Exception as e:
            decky.logger.error(f"Error installing DSU: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def uninstall_dsu(self):
        try:
            # Stop motion client first
            self.stop_motion_client()
            
            # Run uninstall script
            uninstall_cmd = ["bash", os.path.expanduser("~/sdgyrodsu/uninstall.sh")]
            result = subprocess.run(uninstall_cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                return {"status": "error", "message": f"Uninstallation failed: {result.stderr}"}
            
            # Update status
            self.dsu_installed = False
            self.dsu_running = False
            
            return {"status": "success", "message": "SteamDeckGyroDSU uninstalled successfully"}
            
        except Exception as e:
            decky.logger.error(f"Error uninstalling DSU: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def start_dsu_service(self):
        try:
            result = subprocess.run(
                ["systemctl", "--user", "start", "sdgyrodsu.service"],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                return {"status": "error", "message": f"Failed to start service: {result.stderr}"}
            
            self.dsu_running = True
            return {"status": "success", "message": "Service started successfully"}
            
        except Exception as e:
            decky.logger.error(f"Error starting DSU service: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def stop_dsu_service(self):
        try:
            # Stop motion client first
            self.stop_motion_client()
            
            result = subprocess.run(
                ["systemctl", "--user", "stop", "sdgyrodsu.service"],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                return {"status": "error", "message": f"Failed to stop service: {result.stderr}"}
            
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