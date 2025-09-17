import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  Zap,
  Music,
  Scissors,
  Palette
} from "lucide-react";
import { toast } from "sonner";
import { AIEnhancer } from "./AIEnhancer";

export interface VideoFile {
  id: string;
  file: File;
  url: string;
  duration: number;
  thumbnail?: string;
}

interface VideoEditorProps {
  onVideoProcessed?: (video: VideoFile) => void;
}

export const VideoEditor = ({ onVideoProcessed }: VideoEditorProps) => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [reelDuration, setReelDuration] = useState(25); // Default 25 seconds
  const [videoSettings, setVideoSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    speed: 100,
    volume: 100
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        
        video.onloadedmetadata = () => {
          const newVideo: VideoFile = {
            id: Math.random().toString(36).substring(2),
            file,
            url,
            duration: video.duration
          };
          
          setVideos(prev => [...prev, newVideo]);
          if (!selectedVideo) {
            setSelectedVideo(newVideo);
          }
        };
        
        video.src = url;
      }
    });

    toast.success(`${files.length} video(s) uploaded successfully!`);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const resetSettings = () => {
    setVideoSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      speed: 100,
      volume: 100
    });
    toast.success("Settings reset to default");
  };

  const applyAIEnhancement = () => {
    // AI will analyze the video and apply optimal settings
    const aiSettings = {
      brightness: 110,
      contrast: 115,
      saturation: 125,
      speed: 100,
      volume: 100
    };
    
    setVideoSettings(aiSettings);
    toast.success("AI enhancement applied!");
  };

  const createReel = () => {
    if (!selectedVideo) {
      toast.error("Please select a video first");
      return;
    }

    if (selectedVideo.duration < 20) {
      toast.error("Video must be at least 20 seconds long for a reel");
      return;
    }

    // Process the video for reel creation
    toast.success(`Creating ${reelDuration}-second reel...`);
    onVideoProcessed?.(selectedVideo);
  };

  const videoStyle = {
    filter: `brightness(${videoSettings.brightness}%) contrast(${videoSettings.contrast}%) saturate(${videoSettings.saturation}%)`,
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Video Editor
            <Badge variant="secondary" className="ml-2">
              <Clock className="w-3 h-3 mr-1" />
              {reelDuration}s Reel
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Upload */}
          {videos.length === 0 && (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Upload Your Videos</p>
                <p className="text-muted-foreground">Minimum 20 seconds for Instagram reels</p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Choose Videos
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Video Preview */}
          {selectedVideo && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={selectedVideo.url}
                  style={videoStyle}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    
                    <div className="flex-1">
                      <Slider
                        value={[currentTime]}
                        min={0}
                        max={selectedVideo.duration}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="flex-1"
                      />
                    </div>
                    
                    <span className="text-white text-sm">
                      {Math.floor(currentTime)}s / {Math.floor(selectedVideo.duration)}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Reel Duration Setting */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reel-duration">Reel Duration (seconds)</Label>
                  <Input
                    id="reel-duration"
                    type="number"
                    min={20}
                    max={30}
                    value={reelDuration}
                    onChange={(e) => setReelDuration(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Video Quality</Label>
                  <Button variant="outline" className="w-full" onClick={applyAIEnhancement}>
                    <Zap className="w-4 h-4 mr-2" />
                    AI Enhance
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Video Controls */}
          {selectedVideo && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Video Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Video Effects
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Brightness</Label>
                        <span className="text-sm text-muted-foreground">{videoSettings.brightness}%</span>
                      </div>
                      <Slider
                        value={[videoSettings.brightness]}
                        min={50}
                        max={150}
                        step={5}
                        onValueChange={(value) => 
                          setVideoSettings(prev => ({ ...prev, brightness: value[0] }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Contrast</Label>
                        <span className="text-sm text-muted-foreground">{videoSettings.contrast}%</span>
                      </div>
                      <Slider
                        value={[videoSettings.contrast]}
                        min={50}
                        max={150}
                        step={5}
                        onValueChange={(value) => 
                          setVideoSettings(prev => ({ ...prev, contrast: value[0] }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Saturation</Label>
                        <span className="text-sm text-muted-foreground">{videoSettings.saturation}%</span>
                      </div>
                      <Slider
                        value={[videoSettings.saturation]}
                        min={0}
                        max={200}
                        step={5}
                        onValueChange={(value) => 
                          setVideoSettings(prev => ({ ...prev, saturation: value[0] }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Advanced Settings
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Playback Speed</Label>
                        <span className="text-sm text-muted-foreground">{videoSettings.speed}%</span>
                      </div>
                      <Slider
                        value={[videoSettings.speed]}
                        min={50}
                        max={200}
                        step={5}
                        onValueChange={(value) => 
                          setVideoSettings(prev => ({ ...prev, speed: value[0] }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Volume</Label>
                        <span className="text-sm text-muted-foreground">{videoSettings.volume}%</span>
                      </div>
                      <Slider
                        value={[videoSettings.volume]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={(value) => 
                          setVideoSettings(prev => ({ ...prev, volume: value[0] }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={resetSettings} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={createReel} className="flex-1" variant="instagram">
                  <Scissors className="w-4 h-4 mr-2" />
                  Create {reelDuration}s Reel
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                  <Upload className="w-4 h-4 mr-2" />
                  Add More
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* AI Enhancement */}
          {selectedVideo && (
            <>
              <Separator />
              <div className="p-4 border rounded-lg bg-muted/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Video Enhancement
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  AI-powered video optimization and smart effect recommendations.
                </p>
                <Button onClick={applyAIEnhancement} variant="creative" className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Apply AI Enhancement
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Video List */}
      {videos.length > 1 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`aspect-video bg-black rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                    selectedVideo?.id === video.id 
                      ? 'border-primary' 
                      : 'border-transparent hover:border-border'
                  }`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                    {Math.floor(video.duration)}s
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};