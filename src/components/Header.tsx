import { Button } from "@/components/ui/button";
import { Instagram, Github, Heart } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border/50 glass-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-instagram flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg gradient-instagram bg-clip-text text-transparent">
                Reel Creator
              </h2>
              <p className="text-xs text-muted-foreground">
                AI-Powered Instagram Reels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hover-lift">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button variant="outline" size="sm" className="border-gradient hover-lift">
              <Heart className="w-4 h-4 mr-2 text-creative-accent" />
              Support
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};