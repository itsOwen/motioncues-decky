import { FC } from "react";
import {
  PanelSection,
  PanelSectionRow,
  DropdownItem,
  SliderField
} from "@decky/ui";
import { callable } from "@decky/api";

// Define interfaces
interface StyleSettings {
  visual_style: string;
  color: string;
  opacity: number;
}

// Define callable functions
const updateSettings = callable<[Partial<StyleSettings>], any>("update_settings");

interface StylesPanelProps {
  settings: StyleSettings;
  onUpdate: (settings: Partial<StyleSettings>) => void;
}

const StylesPanel: FC<StylesPanelProps> = ({ settings, onUpdate }) => {
  const visualStyles = [
    { label: "Edge Lines", value: "edge_lines" },
    { label: "Corner Dots", value: "corner_dots" },
    { label: "Center Circle", value: "center_circle" }
  ];
  
  const colorOptions = [
    { label: "Green", value: "#00FF00" },
    { label: "Blue", value: "#00AAFF" },
    { label: "Red", value: "#FF0000" },
    { label: "Yellow", value: "#FFFF00" },
    { label: "White", value: "#FFFFFF" }
  ];
  
  // Handle visual style change
  const handleVisualStyleChange = async (value: string) => {
    try {
      const result = await updateSettings({ visual_style: value });
      if (result.status === "success") {
        onUpdate({ visual_style: value });
      }
    } catch (error) {
      console.error("Error updating visual style:", error);
    }
  };
  
  // Handle color change
  const handleColorChange = async (value: string) => {
    try {
      const result = await updateSettings({ color: value });
      if (result.status === "success") {
        onUpdate({ color: value });
      }
    } catch (error) {
      console.error("Error updating color:", error);
    }
  };
  
  // Handle opacity change
  const handleOpacityChange = async (value: number) => {
    try {
      const result = await updateSettings({ opacity: value });
      if (result.status === "success") {
        onUpdate({ opacity: value });
      }
    } catch (error) {
      console.error("Error updating opacity:", error);
    }
  };
  
  return (
    <PanelSection title="Visual Style">
      <PanelSectionRow>
        <DropdownItem
          label="Style Type"
          rgOptions={visualStyles.map(style => ({
            data: style.value,
            label: style.label
          }))}
          selectedOption={settings.visual_style}
          onChange={(option) => handleVisualStyleChange(option.data)}
        />
      </PanelSectionRow>
      
      <PanelSectionRow>
        <DropdownItem
          label="Color"
          rgOptions={colorOptions.map(color => ({
            data: color.value,
            label: color.label
          }))}
          selectedOption={settings.color}
          onChange={(option) => handleColorChange(option.data)}
        />
      </PanelSectionRow>
      
      <PanelSectionRow>
        <SliderField
          label="Opacity"
          value={settings.opacity}
          min={0.1}
          max={1.0}
          step={0.05}
          onChange={handleOpacityChange}
        />
      </PanelSectionRow>
      
      <PanelSectionRow>
        <div style={{ 
          width: '100%', 
          height: '40px',
          backgroundColor: settings.color,
          opacity: settings.opacity,
          borderRadius: '4px',
          marginTop: '8px'
        }} />
      </PanelSectionRow>
    </PanelSection>
  );
};

export default StylesPanel;