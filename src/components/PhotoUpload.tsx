import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Image, X, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Photo } from "@/pages/Index";

interface PhotoUploadProps {
  onPhotosUploaded: (photos: Photo[]) => void;
}

export const PhotoUpload = ({ onPhotosUploaded }: PhotoUploadProps) => {
  const [previewPhotos, setPreviewPhotos] = useState<Photo[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhotos: Photo[] = acceptedFiles.map((file, index) => ({
      id: `photo-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
      }
    }));

    setPreviewPhotos(prev => [...prev, ...newPhotos]);
    
    if (newPhotos.length > 0) {
      toast.success(`${newPhotos.length} photos added!`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true,
    maxFiles: 10
  });

  const removePhoto = (photoId: string) => {
    setPreviewPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handleContinue = () => {
    if (previewPhotos.length === 0) {
      toast.error("Please upload at least one photo!");
      return;
    }
    onPhotosUploaded(previewPhotos);
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 glass-card border-gradient animate-slide-up">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
            ${isDragActive 
              ? 'border-primary bg-primary/10 scale-105' 
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-creative flex items-center justify-center animate-float">
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {isDragActive ? "Drop your photos here!" : "Upload Your Photos"}
              </h3>
              <p className="text-muted-foreground">
                Drag & drop your images or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WebP, GIF • Max 10 photos
              </p>
            </div>

            <Button variant="secondary" size="lg" className="hover-lift">
              <Plus className="w-5 h-5 mr-2" />
              Choose Files
            </Button>
          </div>
        </div>
      </Card>

      {/* Photo Previews */}
      {previewPhotos.length > 0 && (
        <Card className="p-6 glass-card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Uploaded Photos ({previewPhotos.length})
            </h4>
            <Button onClick={handleContinue} variant="instagram" className="hover-lift">
              Continue to Edit
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photo.url}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                <Button
                  onClick={() => removePhoto(photo.id)}
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};