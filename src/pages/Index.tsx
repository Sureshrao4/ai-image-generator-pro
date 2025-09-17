import { useState } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PhotoEditor } from "@/components/PhotoEditor";
import { VideoEditor, VideoFile } from "@/components/VideoEditor";
import { ReelPreview } from "@/components/ReelPreview";
import { DownloadCenter } from "@/components/DownloadCenter";
import { ProjectManager } from "@/components/ProjectManager";
import { Header } from "@/components/Header";
import { ModeSelector } from "@/components/ModeSelector";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Download, Share, ArrowLeft, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { SavedProject } from "@/lib/storage/localStorage";
import heroImage from "@/assets/hero-reel-creator.jpg";

export interface Photo {
  id: string;
  file: File;
  url: string;
  edited?: boolean;
  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
  };
}

const Index = () => {
  const [editingMode, setEditingMode] = useState<'selection' | 'photo' | 'video'>('selection');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit' | 'preview'>('upload');
  const [projectName, setProjectName] = useState('My Reel Project');
  const [reelSettings, setReelSettings] = useState({
    duration: 15,
    transition: 'auto-mix',
    photoDuration: 2
  });

  const handleProjectLoad = (project: SavedProject) => {
    setEditingMode(project.type);
    setPhotos(project.photos);
    setVideos(project.videos);
    setProjectName(project.name);
    setReelSettings({
      duration: project.settings.reelDuration,
      transition: project.settings.transition,
      photoDuration: project.settings.photoDuration || 2
    });
    setCurrentStep('edit');
    toast.success(`Project "${project.name}" loaded successfully!`);
  };

  const handleCreateNew = () => {
    setEditingMode('selection');
    setPhotos([]);
    setVideos([]);
    setSelectedPhoto(null);
    setCurrentStep('upload');
    setProjectName('My Reel Project');
    setReelSettings({
      duration: 15,
      transition: 'auto-mix',
      photoDuration: 2
    });
  };

  const handleModeSelect = (mode: 'photo' | 'video') => {
    setEditingMode(mode);
    setCurrentStep('upload');
  };
  const handlePhotosUploaded = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    if (newPhotos.length > 0) {
      setCurrentStep('edit');
      setSelectedPhoto(newPhotos[0]);
      toast.success(`${newPhotos.length} photos uploaded successfully!`);
    }
  };

  const handleVideoProcessed = (video: VideoFile) => {
    setVideos([video]);
    setCurrentStep('preview');
  };

  const handlePhotoEdited = (editedPhoto: Photo) => {
    setPhotos(prev => 
      prev.map(photo => 
        photo.id === editedPhoto.id ? editedPhoto : photo
      )
    );
    setSelectedPhoto(editedPhoto);
  };

  const handleCreateReel = () => {
    if (editingMode === 'photo' && photos.length === 0) {
      toast.error("Please upload photos first!");
      return;
    }
    if (editingMode === 'video' && videos.length === 0) {
      toast.error("Please process a video first!");
      return;
    }
    setCurrentStep('preview');
    toast.success("Creating your Instagram reel...");
  };

  const handleExportReel = () => {
    toast.success("Reel exported successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Mode Selection */}
        {editingMode === 'selection' && (
          <div className="text-center mb-12 animate-slide-up">
            {/* Hero Image */}
            <div className="mb-8 relative">
              <img 
                src={heroImage} 
                alt="Instagram Reel Creator Hero" 
                className="mx-auto rounded-2xl shadow-creative max-w-2xl w-full hover-lift"
              />
              <div className="absolute inset-0 gradient-instagram opacity-10 rounded-2xl"></div>
            </div>
            
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary animate-glow" />
              <h1 className="text-4xl md:text-6xl font-bold gradient-instagram bg-clip-text text-transparent">
                AI Reel Creator
              </h1>
              <Sparkles className="w-8 h-8 text-creative-accent animate-float" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Create stunning Instagram reels with AI-powered photo and video editing, 
              smart transitions, and trending effects.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <ModeSelector onModeSelect={handleModeSelect} />
              <ProjectManager 
                onProjectLoad={handleProjectLoad}
                onCreateNew={handleCreateNew}
              />
            </div>
          </div>
        )}

        {/* Photo Editing Mode */}
        {editingMode === 'photo' && (
          <>
            {/* Back Button and Title */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setEditingMode('selection')}
                  className="hover-scale"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Selection
                </Button>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Photo Editing Mode</h2>
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setEditingMode('selection')}
                className="hover-scale"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Projects
              </Button>
            </div>

            {/* Action Buttons */}
            {(photos.length > 0 || currentStep === 'preview') && (
              <div className="flex gap-4 justify-center mb-8">
                <Button 
                  onClick={handleCreateReel}
                  variant="instagram"
                  size="lg"
                  className="hover-lift"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Reel
                </Button>
                
                {currentStep === 'preview' && (
                  <>
                    <Button 
                      onClick={handleExportReel}
                      variant="secondary"
                      size="lg"
                      className="hover-lift"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Export
                    </Button>
                    <Button 
                      variant="outline"
                      size="lg"
                      className="hover-lift"
                    >
                      <Share className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Photo Editing Content */}
            <Tabs defaultValue="editor" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="download">Download</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-0">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    {currentStep === 'upload' && (
                      <PhotoUpload onPhotosUploaded={handlePhotosUploaded} />
                    )}
                    
                    {(currentStep === 'edit' || currentStep === 'preview') && (
                      <PhotoEditor
                        photos={photos}
                        selectedPhoto={selectedPhoto}
                        onPhotoSelect={setSelectedPhoto}
                        onPhotoEdited={handlePhotoEdited}
                      />
                    )}
                  </div>

                  <div className="lg:sticky lg:top-8">
                    <ReelPreview
                      photos={photos}
                      videos={[]}
                      isVisible={true}
                      mode="photo"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="grid lg:grid-cols-1 gap-8 justify-center">
                  <div className="max-w-lg mx-auto">
                    <ReelPreview
                      photos={photos}
                      videos={[]}
                      isVisible={true}
                      mode="photo"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="download">
                <div className="max-w-2xl mx-auto">
                  <DownloadCenter
                    photos={photos}
                    videos={[]}
                    mode="photo"
                    projectName={projectName}
                    reelSettings={reelSettings}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Video Editing Mode */}
        {editingMode === 'video' && (
          <>
            {/* Back Button and Title */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setEditingMode('selection')}
                  className="hover-scale"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Selection
                </Button>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Video Editing Mode</h2>
                  <Sparkles className="w-6 h-6 text-creative-accent" />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setEditingMode('selection')}
                className="hover-scale"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Projects
              </Button>
            </div>

            {/* Action Buttons */}
            {(videos.length > 0 || currentStep === 'preview') && (
              <div className="flex gap-4 justify-center mb-8">
                <Button 
                  onClick={handleCreateReel}
                  variant="instagram"
                  size="lg"
                  className="hover-lift"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Reel
                </Button>
                
                {currentStep === 'preview' && (
                  <>
                    <Button 
                      onClick={handleExportReel}
                      variant="secondary"
                      size="lg"
                      className="hover-lift"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Export
                    </Button>
                    <Button 
                      variant="outline"
                      size="lg"
                      className="hover-lift"
                    >
                      <Share className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Video Editing Content */}
            <Tabs defaultValue="editor" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="download">Download</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-0">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <VideoEditor onVideoProcessed={handleVideoProcessed} />
                  </div>

                  <div className="lg:sticky lg:top-8">
                    <ReelPreview
                      photos={[]}
                      videos={videos}
                      isVisible={true}
                      mode="video"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="grid lg:grid-cols-1 gap-8 justify-center">
                  <div className="max-w-lg mx-auto">
                    <ReelPreview
                      photos={[]}
                      videos={videos}
                      isVisible={true}
                      mode="video"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="download">
                <div className="max-w-2xl mx-auto">
                  <DownloadCenter
                    photos={[]}
                    videos={videos}
                    mode="video"
                    projectName={projectName}
                    reelSettings={{
                      duration: 25,
                      transition: 'auto-mix'
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;