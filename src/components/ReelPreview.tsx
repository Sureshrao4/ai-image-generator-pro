import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Settings,
  Smartphone,
  Clock,
  Zap
} from "lucide-react";
import type { Photo } from "@/pages/Index";

interface ReelPreviewProps {
  photos: Photo[];
  isVisible: boolean;
}

const TRANSITIONS = [
  { id: 'fade', name: 'Fade', icon: '✨', description: 'Smooth opacity transition' },
  { id: 'slide-left', name: 'Slide Left', icon: '⬅️', description: 'Slides from right to left' },
  { id: 'slide-right', name: 'Slide Right', icon: '➡️', description: 'Slides from left to right' },
  { id: 'slide-up', name: 'Slide Up', icon: '⬆️', description: 'Slides from bottom to top' },
  { id: 'slide-down', name: 'Slide Down', icon: '⬇️', description: 'Slides from top to bottom' },
  { id: 'zoom-in', name: 'Zoom In', icon: '🔍', description: 'Scales in from small to large' },
  { id: 'zoom-out', name: 'Zoom Out', icon: '🔎', description: 'Scales out from large to small' },
  { id: 'flip-horizontal', name: 'Flip H', icon: '🔄', description: 'Horizontal flip transition' },
  { id: 'flip-vertical', name: 'Flip V', icon: '🔃', description: 'Vertical flip transition' },
  { id: 'ken-burns', name: 'Ken Burns', icon: '📸', description: 'Slow zoom with pan effect' },
  { id: 'swirl', name: 'Swirl', icon: '🌀', description: 'Rotating spiral transition' },
  { id: 'cross-dissolve', name: 'Cross Dissolve', icon: '💫', description: 'Blended fade transition' },
  { id: 'auto-mix', name: 'Auto Mix', icon: '🎯', description: 'Different transition each time' },
];

const DURATIONS = [
  { value: '0.5', label: '0.5s - Quick' },
  { value: '1', label: '1s - Normal' },
  { value: '1.5', label: '1.5s - Slow' },
  { value: '2', label: '2s - Cinematic' },
];

export const ReelPreview = ({ photos, isVisible }: ReelPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTransition, setSelectedTransition] = useState('auto-mix');
  const [photoDuration, setPhotoDuration] = useState('1');
  const [progress, setProgress] = useState(0);
  const [currentTransitionType, setCurrentTransitionType] = useState('fade');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && photos.length > 0) {
      const duration = parseFloat(photoDuration) * 1000;
      
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            // Change transition type for auto-mix mode
            if (selectedTransition === 'auto-mix') {
              const availableTransitions = TRANSITIONS.filter(t => t.id !== 'auto-mix');
              const randomTransition = availableTransitions[Math.floor(Math.random() * availableTransitions.length)];
              setCurrentTransitionType(randomTransition.id);
            } else {
              setCurrentTransitionType(selectedTransition);
            }
            
            setCurrentIndex(current => 
              current >= photos.length - 1 ? 0 : current + 1
            );
            return 0;
          }
          return prev + (100 / (duration / 100));
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, photos.length, photoDuration]);

  const getFilterStyle = (photo: Photo) => {
    const f = photo.filters || { brightness: 100, contrast: 100, saturation: 100, blur: 0 };
    return {
      filter: `
        brightness(${f.brightness}%)
        contrast(${f.contrast}%)
        saturate(${f.saturation}%)
        blur(${f.blur}px)
      `,
    };
  };

  const getTransitionClass = () => {
    const transitionType = selectedTransition === 'auto-mix' ? currentTransitionType : selectedTransition;
    
    switch (transitionType) {
      case 'slide-left':
        return 'transition-all duration-500 ease-in-out transform-gpu';
      case 'slide-right':
        return 'transition-all duration-500 ease-in-out transform-gpu';
      case 'slide-up':
        return 'transition-all duration-500 ease-in-out transform-gpu';
      case 'slide-down':
        return 'transition-all duration-500 ease-in-out transform-gpu';
      case 'zoom-in':
        return 'transition-all duration-700 ease-out transform-gpu';
      case 'zoom-out':
        return 'transition-all duration-700 ease-out transform-gpu';
      case 'flip-horizontal':
        return 'transition-transform duration-600 ease-in-out transform-gpu';
      case 'flip-vertical':
        return 'transition-transform duration-600 ease-in-out transform-gpu';
      case 'ken-burns':
        return 'transition-all duration-1000 ease-in-out transform-gpu animate-pulse';
      case 'swirl':
        return 'transition-all duration-800 ease-in-out transform-gpu';
      case 'cross-dissolve':
        return 'transition-all duration-600 ease-in-out';
      default: // fade
        return 'transition-opacity duration-500 ease-in-out';
    }
  };

  const getTransitionStyle = () => {
    const transitionType = selectedTransition === 'auto-mix' ? currentTransitionType : selectedTransition;
    
    switch (transitionType) {
      case 'zoom-in':
        return { transform: 'scale(1.05)' };
      case 'zoom-out':
        return { transform: 'scale(0.95)' };
      case 'ken-burns':
        return { 
          transform: `scale(1.1) translate(${Math.sin(Date.now() / 3000) * 2}px, ${Math.cos(Date.now() / 3000) * 2}px)` 
        };
      default:
        return {};
    }
  };

  if (!isVisible || photos.length === 0) {
    return (
      <Card className="p-8 glass-card">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full gradient-creative flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Reel Preview</h3>
          <p className="text-muted-foreground">
            Upload and edit photos to see your reel preview
          </p>
        </div>
      </Card>
    );
  }

  const currentPhoto = photos[currentIndex];
  const totalDuration = photos.length * parseFloat(photoDuration);

  return (
    <div className="space-y-6">
      {/* Mobile Preview Frame */}
      <Card className="p-6 glass-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Reel Preview
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="animate-glow">
              <Clock className="w-3 h-3 mr-1" />
              {totalDuration}s
            </Badge>
            <Badge variant="outline">
              {currentIndex + 1}/{photos.length}
            </Badge>
          </div>
        </div>

        {/* Phone Frame */}
        <div className="mx-auto max-w-xs">
          <div className="relative bg-black rounded-[2.5rem] p-2 shadow-creative">
            {/* Screen */}
            <div className="aspect-[9/16] rounded-[2rem] overflow-hidden bg-background relative border-gradient">
              {currentPhoto && (
                <img
                  key={`${currentPhoto.id}-${currentTransitionType}`}
                  src={currentPhoto.url}
                  alt={`Photo ${currentIndex + 1}`}
                  style={{ ...getFilterStyle(currentPhoto), ...getTransitionStyle() }}
                  className={`w-full h-full object-cover ${getTransitionClass()}`}
                />
              )}
              
              {/* Progress Bar */}
              <div className="absolute top-4 left-4 right-4">
                <div className="flex gap-1">
                  {photos.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-100"
                        style={{
                          width: index === currentIndex 
                            ? `${progress}%` 
                            : index < currentIndex 
                              ? '100%' 
                              : '0%'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Instagram-style UI */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full gradient-instagram flex items-center justify-center">
                    <span className="text-xs font-bold">RC</span>
                  </div>
                  <span className="text-sm font-semibold">reelcreator</span>
                </div>
                <p className="text-xs opacity-90">Created with Reel Creator ✨</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            variant="outline"
            size="sm"
            disabled={currentIndex === 0}
            className="hover-lift"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant="instagram"
            size="lg"
            className="hover-lift"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          
          <Button
            onClick={() => setCurrentIndex(Math.min(photos.length - 1, currentIndex + 1))}
            variant="outline"
            size="sm"
            disabled={currentIndex === photos.length - 1}
            className="hover-lift"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Settings */}
      <Card className="p-4 glass-card space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          Reel Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Transition Mode</label>
            <Select value={selectedTransition} onValueChange={setSelectedTransition}>
              <SelectTrigger className="glass-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {TRANSITIONS.map((transition) => (
                  <SelectItem key={transition.id} value={transition.id}>
                    <div className="flex items-start gap-2">
                      <span className="text-base">{transition.icon}</span>
                      <div>
                        <div className="font-medium">{transition.name}</div>
                        <div className="text-xs text-muted-foreground">{transition.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTransition === 'auto-mix' && (
              <p className="text-xs text-muted-foreground">
                Currently using: <span className="font-medium text-primary">{TRANSITIONS.find(t => t.id === currentTransitionType)?.name}</span>
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Photo Duration</label>
            <Select value={photoDuration} onValueChange={setPhotoDuration}>
              <SelectTrigger className="glass-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Volume2 className="w-4 h-4" />
            Music: Trending Pop
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            AI Effects: Enabled
          </div>
        </div>
      </Card>
    </div>
  );
};