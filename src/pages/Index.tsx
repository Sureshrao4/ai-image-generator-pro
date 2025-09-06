import { useState } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PhotoEditor } from "@/components/PhotoEditor";
import { ReelPreview } from "@/components/ReelPreview";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Sparkles, Download, Share } from "lucide-react";
import { toast } from "sonner";
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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit' | 'preview'>('upload');

  const handlePhotosUploaded = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    if (newPhotos.length > 0) {
      setCurrentStep('edit');
      setSelectedPhoto(newPhotos[0]);
      toast.success(`${newPhotos.length} photos uploaded successfully!`);
    }
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
    if (photos.length === 0) {
      toast.error("Please upload photos first!");
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
        {/* Hero Section */}
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
              Reel Creator
            </h1>
            <Sparkles className="w-8 h-8 text-creative-accent animate-float" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Transform your photos into stunning Instagram reels with AI-powered effects, 
            smooth transitions, and trending music.
          </p>
          
          {photos.length > 0 && (
            <div className="flex gap-4 justify-center">
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
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload & Edit */}
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

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-8">
            <ReelPreview
              photos={photos}
              isVisible={currentStep === 'preview'}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;