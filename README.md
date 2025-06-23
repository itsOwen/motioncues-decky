# Steam Deck Motion Service - Decky Plugin

A comprehensive DeckyLoader plugin that provides real-time motion data from your Steam Deck's built-in sensors and intelligent motion cues for motion sickness prevention, similar to Apple's motion cues feature.

## 🌟 Features

### 🔧 **Motion Service Management**
- **One-click installation** from pre-compiled binaries
- **Systemd service integration** for reliable background operation
- **Real-time status monitoring** with service health checks
- **Easy start/stop controls** through the Steam UI

### 🍃 **Intelligent Motion Cues**
- **Motion sickness prevention** using real-time sensor analysis
- **Configurable sensitivity levels** (Low, Medium, High)
- **Multiple cue types**: Visual alerts, haptic feedback, audio notifications
- **Smart pattern detection** for movement that commonly triggers motion sickness
- **Real-time alerts** with motion intensity classification

### 📊 **Live Motion Data Visualization**
- **Real-time accelerometer data** (X, Y, Z axes in g-force)
- **Real-time gyroscope data** (Pitch, Yaw, Roll in degrees/second)
- **Motion intensity indicators** with color-coded status
- **Historical data collection** and analysis
- **Raw JSON data view** for developers and debugging

### 🎮 **Gaming Integration**
- **Background monitoring** doesn't interfere with gameplay
- **60Hz data collection** with intelligent 5Hz display updates
- **UDP-based architecture** for minimal performance impact
- **Seamless integration** with Steam's built-in haptic feedback

## 🚀 Installation

### Prerequisites
- Steam Deck with SteamOS
- DeckyLoader installed and running
- Internet connection for binary download

### Install via Decky Store
1. Open DeckyLoader plugin store
2. Search for "Motion Service"
3. Click Install
4. The plugin will appear in your Quick Access menu

### Manual Installation
1. Clone this repository
2. Build the plugin: `npm run build`
3. Copy to DeckyLoader plugins directory
4. Restart DeckyLoader

## 📖 Usage

### Initial Setup
1. **Open the plugin** from Quick Access menu (Motion Service icon)
2. **Install the service**: Click "📥 Install Motion Service"
3. **Start the service**: Toggle "Motion Service" to ON
4. **Enable monitoring**: Toggle "Motion Data Monitoring" to ON

### Motion Cues Configuration
1. **Enable Motion Cues**: Toggle the main motion cues switch
2. **Set sensitivity level**:
   - **Low**: Only very intense motion (50°/s gyro, 1.5g accel)
   - **Medium**: Balanced for typical gaming (30°/s gyro, 1.3g accel)  
   - **High**: Sensitive to smaller motions (20°/s gyro, 1.1g accel)
3. **Choose cue types**:
   - **Visual**: On-screen notifications
   - **Haptic**: Steam Deck vibration feedback
   - **Audio**: Sound alerts (future feature)

### Motion Data Monitoring
- **Live visualization**: View real-time sensor data with color-coded intensity
- **Motion alerts**: See recent motion events that triggered cues
- **Raw data view**: Access JSON data for development or debugging
- **Auto-refresh**: Toggle automatic data updates

## 🔧 Technical Details

### Architecture
- **Backend**: Python service management via `main.py`
- **Frontend**: React/TypeScript components with DeckyLoader UI
- **Motion Service**: C++ binary with systemd integration
- **Communication**: UDP socket on port 27760
- **Data Format**: JSON with accelerometer/gyroscope readings

### Motion Detection Algorithm
The plugin uses intelligent thresholds based on research into motion sickness triggers:

```python
motion_thresholds = {
    1: {"gyro": 50, "accel": 1.5, "time_window": 3},    # Low sensitivity
    2: {"gyro": 30, "accel": 1.3, "time_window": 2},    # Medium sensitivity  
    3: {"gyro": 20, "accel": 1.1, "time_window": 1.5}   # High sensitivity
}
```

### Data Structure
```json
{
  "timestamp": 1703123456789000,
  "accel": {"x": -0.011, "y": -0.998, "z": 0.096},
  "gyro": {"pitch": 0.0, "yaw": -0.0, "roll": 0.0},
  "magnitude": {"accel": 1.003, "gyro": 0.0},
  "frameId": 12345
}
```

## 🛠️ Development

### Building from Source
```bash
# Install dependencies
pnpm install

# Build for development
pnpm run build

```

### Adding New Features
1. **Backend**: Add new callable functions to `main.py`
2. **Frontend**: Create new React components in `src/`
3. **Types**: Update `types.d.ts` for TypeScript support
4. **Integration**: Update main `index.tsx` to include new sections

## 🐛 Troubleshooting

### Service Won't Start
- Check if installation completed successfully
- Verify systemd service status: `systemctl --user status sdmotion`
- Check logs: `journalctl --user -u sdmotion -f`

### No Motion Data
- Ensure service is running and UDP port 27760 is accessible
- Toggle monitoring off and on again
- Check for conflicting applications using motion sensors

### Motion Cues Not Triggering
- Verify motion monitoring is active
- Adjust sensitivity level - start with High sensitivity
- Check that at least one cue type is enabled
- Move the Steam Deck to test - the sensors detect actual device movement

### Performance Issues
- Motion monitoring uses minimal CPU (~0.1%)
- If needed, disable auto-refresh in Motion Data section
- Service automatically handles frame drops gracefully

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly on Steam Deck
5. Submit a pull request

### Development Guidelines
- Follow the existing code style
- Add TypeScript types for new features  
- Test all React components thoroughly
- Update README for new features
- Ensure Python backend is compatible with SteamOS

## 📄 License

BSD-3-Clause License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Valve** for the Steam Deck and excellent sensor hardware
- **DeckyLoader team** for the plugin framework
- **Motion sickness research community** for threshold data
- **Apple** for pioneering motion cues in accessibility features

**Made with ❤️ for the Steam Deck community**