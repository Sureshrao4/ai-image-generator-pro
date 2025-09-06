import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Contrast, 
  Sun, 
  Droplets, 
  Focus,
  RotateCcw,
  Save,
  Sparkles,
  Brain
} from "lucide-react";
import { toast } from "sonner";
import { AIEnhancer } from "@/components/AIEnhancer";
import type { Photo } from "@/pages/Index";
import type { AIFilters } from "@/lib/ai/imageAnalysis";

interface PhotoEditorProps {
  photos: Photo[];
  selectedPhoto: Photo | null;
  onPhotoSelect: (photo: Photo) => void;
  onPhotoEdited: (photo: Photo) => void;
}

const STYLE_PRESETS = [
  { 
    name: "Original", 
    brightness: 100, contrast: 100, saturation: 100, blur: 0,
    description: "No filters applied"
  },
  { 
    name: "Instagram", 
    brightness: 108, contrast: 115, saturation: 125, blur: 0,
    description: "Bright & punchy like social media"
  },
  { 
    name: "Vintage", 
    brightness: 95, contrast: 110, saturation: 75, blur: 0,
    description: "Warm retro film look"
  },
  { 
    name: "Cinematic", 
    brightness: 90, contrast: 140, saturation: 110, blur: 0,
    description: "Movie-style dramatic lighting"
  },
  { 
    name: "Dreamy", 
    brightness: 110, contrast: 85, saturation: 120, blur: 0.8,
    description: "Soft ethereal glow"
  },
  { 
    name: "B&W Classic", 
    brightness: 105, contrast: 130, saturation: 0, blur: 0,
    description: "High contrast monochrome"
  },
  { 
    name: "Sunset", 
    brightness: 115, contrast: 120, saturation: 140, blur: 0,
    description: "Warm golden hour vibes"
  },
  { 
    name: "Arctic", 
    brightness: 120, contrast: 95, saturation: 80, blur: 0,
    description: "Cool blue-tinted aesthetic"
  },
];

export const PhotoEditor = ({ 
  photos, 
  selectedPhoto, 
  onPhotoSelect, 
  onPhotoEdited 
}: PhotoEditorProps) => {
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
  });
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (selectedPhoto?.filters) {
      setFilters(selectedPhoto.filters);
    }
  }, [selectedPhoto]);

  const applyPreset = (preset: typeof STYLE_PRESETS[0]) => {
    const newFilters = {
      brightness: preset.brightness,
      contrast: preset.contrast,
      saturation: preset.saturation,
      blur: preset.blur,
    };
    setFilters(newFilters);
    saveChanges(newFilters);
    toast.success(`${preset.name} style applied!`, {
      description: preset.description
    });
  };

  const resetFilters = () => {
    const originalFilters = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
    };
    setFilters(originalFilters);
    saveChanges(originalFilters);
    toast.success("Filters reset to original!");
  };

  const saveChanges = (updatedFilters = filters) => {
    if (!selectedPhoto) return;
    
    const editedPhoto: Photo = {
      ...selectedPhoto,
      filters: updatedFilters,
      edited: true,
    };
    
    onPhotoEdited(editedPhoto);
  };

  const handleAIFiltersApplied = (aiFilters: AIFilters) => {
    setFilters(aiFilters);
    saveChanges(aiFilters);
  };

  const getFilterStyle = (photo: Photo) => {
    const f = photo.filters || filters;
    return {
      filter: `
        brightness(${f.brightness}%)
        contrast(${f.contrast}%)
        saturate(${f.saturation}%)
        blur(${f.blur}px)
      `,
    };
  };

  if (photos.length === 0) {
    return (
      <Card className="p-8 text-center glass-card">
        <div className="space-y-4">
          <Palette className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            No Photos to Edit
          </h3>
          <p className="text-muted-foreground">
            Upload some photos to start editing
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Selection */}
      <Card className="p-6 glass-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Photo Editor
          </h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAI(!showAI)}
              variant={showAI ? "creative" : "outline"}
              size="sm"
              className="hover-lift"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Enhance
            </Button>
            <Badge variant="secondary" className="animate-glow">
              {photos.length} Photos
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => onPhotoSelect(photo)}
              className={`
                relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300
                ${selectedPhoto?.id === photo.id 
                  ? 'ring-2 ring-primary shadow-glow scale-105' 
                  : 'hover:scale-105 hover:shadow-creative'
                }
              `}
            >
              <img
                src={photo.url}
                alt="Photo"
                style={getFilterStyle(photo)}
                className="w-full h-full object-cover"
              />
              {photo.edited && (
                <div className="absolute top-1 right-1">
                  <Sparkles className="w-4 h-4 text-primary-glow" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* AI Enhancement Panel */}
      {showAI && (
        <AIEnhancer
          photos={photos}
          selectedPhoto={selectedPhoto}
          onPhotoEnhanced={onPhotoEdited}
          onStyleApplied={handleAIFiltersApplied}
        />
      )}

      {/* Editor Panel */}
      {selectedPhoto && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Preview */}
          <Card className="p-6 glass-card">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted border-gradient">
              <img
                src={selectedPhoto.url}
                alt="Selected photo"
                style={getFilterStyle({ ...selectedPhoto, filters })}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>

          {/* Controls */}
          <div className="space-y-6">
            {/* Style Presets */}
            <Card className="p-4 glass-card">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Auto Style Presets
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {STYLE_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    variant="outline"
                    size="sm"
                    className="hover-lift text-left justify-start h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">{preset.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Manual Controls */}
            <Card className="p-4 glass-card space-y-4">
              <h4 className="font-semibold">Manual Adjustments</h4>
              
              {/* Brightness */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Brightness</span>
                  <span className="text-xs text-muted-foreground ml-auto">{filters.brightness}%</span>
                </div>
                <Slider
                  value={[filters.brightness]}
                  onValueChange={([value]) => {
                    const newFilters = { ...filters, brightness: value };
                    setFilters(newFilters);
                    saveChanges(newFilters);
                  }}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Contrast className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Contrast</span>
                  <span className="text-xs text-muted-foreground ml-auto">{filters.contrast}%</span>
                </div>
                <Slider
                  value={[filters.contrast]}
                  onValueChange={([value]) => {
                    const newFilters = { ...filters, contrast: value };
                    setFilters(newFilters);
                    saveChanges(newFilters);
                  }}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Saturation</span>
                  <span className="text-xs text-muted-foreground ml-auto">{filters.saturation}%</span>
                </div>
                <Slider
                  value={[filters.saturation]}
                  onValueChange={([value]) => {
                    const newFilters = { ...filters, saturation: value };
                    setFilters(newFilters);
                    saveChanges(newFilters);
                  }}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Blur */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Focus className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Blur</span>
                  <span className="text-xs text-muted-foreground ml-auto">{filters.blur}px</span>
                </div>
                <Slider
                  value={[filters.blur]}
                  onValueChange={([value]) => {
                    const newFilters = { ...filters, blur: value };
                    setFilters(newFilters);
                    saveChanges(newFilters);
                  }}
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={resetFilters} variant="outline" className="flex-1 hover-lift">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={() => saveChanges()} variant="creative" className="flex-1 hover-lift">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};