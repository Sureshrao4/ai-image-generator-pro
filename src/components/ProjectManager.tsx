import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FolderOpen, 
  Trash2, 
  Calendar, 
  Image, 
  Video,
  Download,
  Upload,
  Search,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { LocalStorageManager, SavedProject } from "@/lib/storage/localStorage";

interface ProjectManagerProps {
  onProjectLoad?: (project: SavedProject) => void;
  onCreateNew?: () => void;
}

export const ProjectManager = ({ onProjectLoad, onCreateNew }: ProjectManagerProps) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<'all' | 'photo' | 'video'>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedProjects = LocalStorageManager.getProjects();
    setProjects(savedProjects);
  };

  const handleDeleteProject = (id: string) => {
    const success = LocalStorageManager.deleteProject(id);
    if (success) {
      toast.success("Project deleted");
      loadProjects();
    } else {
      toast.error("Failed to delete project");
    }
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = LocalStorageManager.importData(data);
        if (success) {
          toast.success("Project imported successfully!");
          loadProjects();
        } else {
          toast.error("Failed to import project");
        }
      } catch (error) {
        toast.error("Invalid project file");
      }
    };
    reader.readAsText(file);
  };

  const handleExportAllData = () => {
    try {
      const data = LocalStorageManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reel-creator-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("All data exported!");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || project.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Project Manager
          <Badge variant="secondary">{projects.length} projects</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              All
            </Button>
            <Button
              variant={selectedType === 'photo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('photo')}
            >
              <Image className="w-4 h-4 mr-1" />
              Photo
            </Button>
            <Button
              variant={selectedType === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('video')}
            >
              <Video className="w-4 h-4 mr-1" />
              Video
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={onCreateNew} variant="instagram" className="hover-lift">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          
          <Button
            variant="outline"
            className="hover-lift"
            onClick={() => document.getElementById('import-input')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <input
            id="import-input"
            type="file"
            accept=".json"
            onChange={handleImportProject}
            className="hidden"
          />
          
          <Button onClick={handleExportAllData} variant="outline" className="hover-lift">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>

        {/* Project List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>
                {searchTerm || selectedType !== 'all' 
                  ? "No projects match your search" 
                  : "No saved projects yet"
                }
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge variant={project.type === 'photo' ? 'default' : 'secondary'}>
                        {project.type === 'photo' ? (
                          <Image className="w-3 h-3 mr-1" />
                        ) : (
                          <Video className="w-3 h-3 mr-1" />
                        )}
                        {project.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(project.updatedAt)}
                      </div>
                      <span>
                        {project.photos.length + project.videos.length} items
                      </span>
                      <span>{project.settings.reelDuration}s duration</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => onProjectLoad?.(project)}
                      size="sm"
                      variant="outline"
                      className="hover-lift"
                    >
                      <FolderOpen className="w-3 h-3 mr-1" />
                      Load
                    </Button>
                    <Button
                      onClick={() => handleDeleteProject(project.id)}
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive hover-lift"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Storage Info */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <p className="flex items-center gap-1">
            <Search className="w-3 h-3" />
            Projects are saved locally in your browser storage. Clear browser data will remove all projects.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};