import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Video, Sparkles, Edit3 } from "lucide-react";

interface ModeSelectorProps {
  onModeSelect: (mode: 'photo' | 'video') => void;
}

export const ModeSelector = ({ onModeSelect }: ModeSelectorProps) => {
  return (
    <div className="text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-primary animate-glow" />
          <h2 className="text-3xl md:text-4xl font-bold gradient-instagram bg-clip-text text-transparent">
            Choose Your Creation Mode
          </h2>
          <Sparkles className="w-8 h-8 text-creative-accent animate-float" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create stunning content with AI-powered editing. Choose between photo editing for static content or video editing for dynamic reels.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Photo Editing Mode */}
        <Card className="hover-lift cursor-pointer transition-all duration-300 hover:shadow-creative border-2 hover:border-primary/30">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
              <Camera className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Photo Editing</CardTitle>
            <CardDescription className="text-base">
              Transform your photos with AI-powered effects, filters, and enhancements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                AI-powered style recommendations
              </li>
              <li className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                Smart background removal
              </li>
              <li className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                Advanced filters & effects
              </li>
              <li className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                Auto color correction
              </li>
            </ul>
            <Button 
              onClick={() => onModeSelect('photo')} 
              className="w-full hover-scale"
              variant="outline"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Photo Editing
            </Button>
          </CardContent>
        </Card>

        {/* Video Editing Mode */}
        <Card className="hover-lift cursor-pointer transition-all duration-300 hover:shadow-creative border-2 hover:border-creative-accent/30">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 rounded-full bg-creative-accent/10">
              <Video className="w-12 h-12 text-creative-accent" />
            </div>
            <CardTitle className="text-2xl">Video Editing</CardTitle>
            <CardDescription className="text-base">
              Create dynamic 20-30 second Instagram reels with smart transitions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-creative-accent" />
                AI transition recommendations
              </li>
              <li className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-creative-accent" />
                Beat-synchronized editing
              </li>
              <li className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-creative-accent" />
                20-30 second reel creation
              </li>
              <li className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-creative-accent" />
                Trending effects & filters
              </li>
            </ul>
            <Button 
              onClick={() => onModeSelect('video')} 
              className="w-full hover-scale"
              variant="secondary"
            >
              <Video className="w-5 h-5 mr-2" />
              Start Video Editing
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};