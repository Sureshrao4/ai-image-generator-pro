import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Wand2, 
  Loader2, 
  Eye,
  Sparkles,
  Key,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { imageAI } from "@/lib/ai/imageAnalysis";
import { openaiVision } from "@/lib/ai/openaiVision";
import type { Photo } from "@/pages/Index";
import type { ImageAnalysis, AIFilters } from "@/lib/ai/imageAnalysis";
import type { StyleRecommendation } from "@/lib/ai/openaiVision";

interface AIEnhancerProps {
  photos: Photo[];
  selectedPhoto: Photo | null;
  onPhotoEnhanced: (photo: Photo) => void;
  onStyleApplied: (filters: AIFilters) => void;
}

export const AIEnhancer = ({ 
  photos, 
  selectedPhoto, 
  onPhotoEnhanced, 
  onStyleApplied 
}: AIEnhancerProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [recommendation, setRecommendation] = useState<StyleRecommendation | null>(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai-api-key') || '');

  const saveApiKey = () => {
    localStorage.setItem('openai-api-key', apiKey);
    openaiVision.setApiKey(apiKey);
    toast.success('API key saved locally');
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
      img.crossOrigin = 'anonymous';
    });
  };

  const analyzeCurrentPhoto = async () => {
    if (!selectedPhoto) {
      toast.error('Please select a photo first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const img = await loadImage(selectedPhoto.url);
      
      // Browser-based analysis
      const browserAnalysis = await imageAI.analyzeImage(img);
      setAnalysis(browserAnalysis);
      
      // AI-powered smart filters
      const smartFilters = imageAI.generateSmartFilters(browserAnalysis);
      onStyleApplied(smartFilters);
      
      toast.success('Image analyzed! Smart filters applied.', {
        description: `Detected: ${browserAnalysis.mood} mood, ${browserAnalysis.isPortrait ? 'portrait' : 'landscape'}`
      });
      
      // OpenAI Vision analysis (if API key provided)
      if (apiKey) {
        openaiVision.setApiKey(apiKey);
        const aiRecommendation = await openaiVision.analyzeImageForStyle(selectedPhoto.url);
        setRecommendation(aiRecommendation);
        
        toast.success('AI style recommendation ready!', {
          description: `Suggested: ${aiRecommendation.style} (${Math.round(aiRecommendation.confidence * 100)}% confidence)`
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAIRecommendation = () => {
    if (!recommendation) return;
    
    setIsEnhancing(true);
    setTimeout(() => {
      onStyleApplied(recommendation.suggestedFilters);
      toast.success(`${recommendation.style} style applied!`, {
        description: recommendation.reasoning
      });
      setIsEnhancing(false);
    }, 500);
  };

  const removeBackground = async () => {
    if (!selectedPhoto) {
      toast.error('Please select a photo first');
      return;
    }

    setIsRemovingBg(true);
    try {
      const img = await loadImage(selectedPhoto.url);
      const resultBlob = await imageAI.removeBackground(img);
      
      // Create new photo with background removed
      const newUrl = URL.createObjectURL(resultBlob);
      const enhancedPhoto: Photo = {
        ...selectedPhoto,
        url: newUrl,
        edited: true,
        filters: selectedPhoto.filters
      };
      
      onPhotoEnhanced(enhancedPhoto);
      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Background removal failed:', error);
      toast.error('Background removal failed. Please try again.');
    } finally {
      setIsRemovingBg(false);
    }
  };

  if (photos.length === 0) {
    return (
      <Card className="p-8 text-center glass-card">
        <div className="space-y-4">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            AI Enhancement Ready
          </h3>
          <p className="text-muted-foreground">
            Upload photos to start AI-powered editing
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Key Setup */}
      <Card className="p-4 glass-card">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-primary" />
          <h4 className="font-semibold">OpenAI API Key (Optional)</h4>
          <Badge variant="secondary" className="text-xs">Enhanced AI</Badge>
        </div>
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1"
          />
          <Button onClick={saveApiKey} variant="outline" size="sm">
            Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Stored locally for AI style recommendations. Browser-based analysis works without API key.
        </p>
      </Card>

      {/* AI Analysis */}
      <Card className="p-4 glass-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            AI Photo Analysis
          </h4>
          <Button 
            onClick={analyzeCurrentPhoto}
            disabled={!selectedPhoto || isAnalyzing}
            variant="creative"
            size="sm"
            className="hover-lift"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Analyze Photo
          </Button>
        </div>

        {analysis && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Mood:</span>
                <Badge variant="outline" className="ml-2 capitalize">
                  {analysis.mood}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="ml-2">
                  {analysis.isPortrait ? 'Portrait' : 'Landscape'}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Recommended:</span>
              <Badge variant="secondary" className="ml-2">
                {analysis.recommendedStyle}
              </Badge>
            </div>
          </div>
        )}

        {recommendation && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Recommendation
              </h5>
              <Badge variant="secondary">
                {Math.round(recommendation.confidence * 100)}% confident
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {recommendation.reasoning}
            </p>
            <Button 
              onClick={applyAIRecommendation}
              disabled={isEnhancing}
              variant="creative"
              size="sm"
              className="w-full hover-lift"
            >
              {isEnhancing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Apply {recommendation.style} Style
            </Button>
          </div>
        )}
      </Card>

      {/* AI Tools */}
      <Card className="p-4 glass-card">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" />
          AI Enhancement Tools
        </h4>
        
        <div className="grid gap-3">
          <Button 
            onClick={removeBackground}
            disabled={!selectedPhoto || isRemovingBg}
            variant="outline"
            className="hover-lift justify-start"
          >
            {isRemovingBg ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Remove Background
          </Button>
        </div>
      </Card>
    </div>
  );
};