import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Image, 
  Video, 
  FileImage,
  Save,
  Loader2,
  HardDrive,
  Smartphone,
  Settings,
  Film
} from "lucide-react";
import { toast } from "sonner";
import { Photo } from "@/pages/Index";
import { VideoFile } from "@/components/VideoEditor";
import { DownloadManager, ExportOptions } from "@/lib/export/downloadManager";
import { LocalStorageManager, SavedProject } from "@/lib/storage/localStorage";

interface DownloadCenterProps {
  photos: Photo[];
  videos: VideoFile[];
  mode: 'photo' | 'video';
  projectName?: string;
  reelSettings?: {
    duration: number;
    transition: string;
    photoDuration?: number;
  };
}

export const DownloadCenter = ({ 
  photos, 
  videos, 
  mode, 
  projectName = "My Reel",
  reelSettings 
}: DownloadCenterProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    quality: 'high',
    format: mode === 'photo' ? 'mp4' : 'mp4',
    dimensions: DownloadManager.getOptimalDimensions('portrait'),
    duration: reelSettings?.duration || 15,
    fps: 30
  });

  const contentCount = mode === 'photo' ? photos.length : videos.length;
  const hasContent = contentCount > 0;

  const handleDownloadReel = async () => {
    if (!hasContent) {
      toast.error(`No ${mode}s to download`);
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      if (mode === 'photo') {
        await DownloadManager.downloadReel(
          photos,
          exportOptions,
          setDownloadProgress
        );
        toast.success("Photo reel downloaded successfully!");
      } else {
        await DownloadManager.downloadVideoReel(
          videos,
          exportOptions,
          setDownloadProgress
        );
        toast.success("Video reel downloaded successfully!");
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDownloadIndividual = async (index: number) => {
    try {
      if (mode === 'photo' && photos[index]) {
        await DownloadManager.downloadPhoto(
          photos[index],
          `photo-${index + 1}.png`
        );
        toast.success(`Photo ${index + 1} downloaded!`);
      } else if (mode === 'video' && videos[index]) {
        const response = await fetch(videos[index].url);
        const blob = await response.blob();
        DownloadManager.downloadBlob(blob, `video-${index + 1}.mp4`);
        toast.success(`Video ${index + 1} downloaded!`);
      }
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const handleSaveProject = () => {
    try {
      const project: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'> = {
        name: projectName,
        type: mode,
        photos,
        videos,
        settings: {
          reelDuration: exportOptions.duration || 15,
          transition: 'auto-mix',
          photoDuration: reelSettings?.photoDuration
        }
      };

      const savedProject = LocalStorageManager.saveProject(project);
      toast.success(`Project "${savedProject.name}" saved to local storage!`);
    } catch (error) {
      toast.error("Failed to save project");
    }
  };

  const handleExportProjectData = async () => {
    try {
      const projectData = {
        name: projectName,
        mode,
        photos: photos.map(p => ({ ...p, file: undefined })), // Remove file objects for JSON
        videos: videos.map(v => ({ ...v, file: undefined })),
        settings: reelSettings,
        exportOptions,
        exportedAt: new Date().toISOString()
      };

      await DownloadManager.downloadProjectData(projectData, `${projectName}.json`);
      toast.success("Project data exported!");
    } catch (error) {
      toast.error("Failed to export project data");
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'high': return '1080p (Recommended)';
      case 'medium': return '720p';
      case 'low': return '480p';
      default: return quality;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'mp4': return 'MP4 (Universal)';
      case 'webm': return 'WebM (Web Optimized)';
      case 'gif': return 'GIF (Animation)';
      case 'jpg': return 'JPEG (Image)';
      case 'png': return 'PNG (High Quality)';
      default: return format.toUpperCase();
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          Download Center
          <Badge variant="secondary" className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            {contentCount} {mode}(s)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Settings */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Export Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quality</label>
              <Select 
                value={exportOptions.quality} 
                onValueChange={(value: any) => 
                  setExportOptions(prev => ({ ...prev, quality: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{getQualityLabel('high')}</SelectItem>
                  <SelectItem value="medium">{getQualityLabel('medium')}</SelectItem>
                  <SelectItem value="low">{getQualityLabel('low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select 
                value={exportOptions.format} 
                onValueChange={(value: any) => 
                  setExportOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mode === 'photo' ? (
                    <>
                      <SelectItem value="mp4">{getFormatLabel('mp4')}</SelectItem>
                      <SelectItem value="gif">{getFormatLabel('gif')}</SelectItem>
                      <SelectItem value="png">{getFormatLabel('png')}</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="mp4">{getFormatLabel('mp4')}</SelectItem>
                      <SelectItem value="webm">{getFormatLabel('webm')}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Download Options */}
        <div className="space-y-4">
          <h4 className="font-semibold">Download Options</h4>
          
          {/* Main Reel Download */}
          <div className="space-y-3">
            <Button
              onClick={handleDownloadReel}
              disabled={!hasContent || isDownloading}
              className="w-full hover-lift"
              variant="instagram"
              size="lg"
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Film className="w-5 h-5 mr-2" />
              )}
              Download Complete Reel
            </Button>

            {isDownloading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Creating reel...</span>
                  <span>{Math.round(downloadProgress)}%</span>
                </div>
                <Progress value={downloadProgress} className="w-full" />
              </div>
            )}
          </div>

          {/* Individual Downloads */}
          {hasContent && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium">Download Individual {mode === 'photo' ? 'Photos' : 'Videos'}</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {(mode === 'photo' ? photos : videos).map((item, index) => (
                  <Button
                    key={item.id}
                    onClick={() => handleDownloadIndividual(index)}
                    variant="outline"
                    size="sm"
                    className="hover-lift justify-start"
                  >
                    {mode === 'photo' ? (
                      <FileImage className="w-3 h-3 mr-1" />
                    ) : (
                      <Video className="w-3 h-3 mr-1" />
                    )}
                    {mode === 'photo' ? 'Photo' : 'Video'} {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Storage Options */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-primary" />
            Local Storage
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={handleSaveProject}
              disabled={!hasContent}
              variant="outline"
              className="hover-lift justify-start"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Project
            </Button>
            
            <Button
              onClick={handleExportProjectData}
              disabled={!hasContent}
              variant="outline" 
              className="hover-lift justify-start"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Projects are saved locally in your browser. Export data to backup your work.
          </p>
        </div>

        {!hasContent && (
          <div className="text-center py-8 text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Upload {mode}s to enable download options</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};