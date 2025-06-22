import { FC, useState, useEffect } from "react";
import {
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  TextField,
  showModal,
  ConfirmModal
} from "@decky/ui";
import { callable } from "@decky/api";

// Define interfaces
interface Preset {
  name: string;
  sensitivity: number;
  visual_style: string;
  color: string;
  opacity: number;
  auto_activate: boolean;
}

// Define callable functions
const getPresets = callable<[], any>("get_presets");
const savePreset = callable<[string, Partial<Preset>], any>("save_preset");
const loadPreset = callable<[string], any>("load_preset");
const deletePreset = callable<[string], any>("delete_preset");

interface PresetsPanelProps {
  currentSettings: Partial<Preset>;
  onPresetLoaded: (settings: Partial<Preset>) => void;
}

const PresetsPanel: FC<PresetsPanelProps> = ({ currentSettings, onPresetLoaded }) => {
  const [presets, setPresets] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newPresetName, setNewPresetName] = useState<string>("");
  
  // Load presets
  useEffect(() => {
    const loadPresets = async () => {
      try {
        setLoading(true);
        const result = await getPresets();
        if (result.status === "success") {
          setPresets(result.presets);
        }
      } catch (error) {
        console.error("Error loading presets:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPresets();
  }, []);
  
  // Handle save preset
  const handleSavePreset = async () => {
    if (!newPresetName) {
      return;
    }
    
    try {
      const result = await savePreset(newPresetName, currentSettings);
      if (result.status === "success") {
        // Reload presets
        const presetsResult = await getPresets();
        if (presetsResult.status === "success") {
          setPresets(presetsResult.presets);
        }
        
        // Clear new preset name
        setNewPresetName("");
      }
    } catch (error) {
      console.error("Error saving preset:", error);
    }
  };
  
  // Handle load preset
  const handleLoadPreset = async (name: string) => {
    try {
      const result = await loadPreset(name);
      if (result.status === "success") {
        onPresetLoaded(result.settings);
      }
    } catch (error) {
      console.error("Error loading preset:", error);
    }
  };
  
  // Handle delete preset
  const handleDeletePreset = async (name: string) => {
    showModal(
      <ConfirmModal
        strTitle="Confirm Delete"
        strDescription={`Are you sure you want to delete preset "${name}"?`}
        strOKButtonText="Delete"
        strCancelButtonText="Cancel"
        onOK={async () => {
          try {
            const result = await deletePreset(name);
            if (result.status === "success") {
              // Reload presets
              const presetsResult = await getPresets();
              if (presetsResult.status === "success") {
                setPresets(presetsResult.presets);
              }
            }
          } catch (error) {
            console.error("Error deleting preset:", error);
          }
        }}
      />
    );
  };
  
  return (
    <PanelSection title="Presets">
      <PanelSectionRow>
        <div style={{ display: 'flex', marginBottom: '16px' }}>
          <TextField
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            style={{ flex: 1, marginRight: '8px' }}
          />
          <ButtonItem
            onClick={handleSavePreset}
            disabled={!newPresetName}
          >
            Save
          </ButtonItem>
        </div>
      </PanelSectionRow>
      
      {loading ? (
        <PanelSectionRow>
          <div>Loading presets...</div>
        </PanelSectionRow>
      ) : presets.length === 0 ? (
        <PanelSectionRow>
          <div>No presets saved yet.</div>
        </PanelSectionRow>
      ) : (
        presets.map((preset) => (
          <PanelSectionRow key={preset}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>{preset}</div>
              <ButtonItem
                onClick={() => handleLoadPreset(preset)}
              >
                Load
              </ButtonItem>
              <ButtonItem
                onClick={() => handleDeletePreset(preset)}
              >
                Delete
              </ButtonItem>
            </div>
          </PanelSectionRow>
        ))
      )}
    </PanelSection>
  );
};

export default PresetsPanel;