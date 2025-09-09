import { Photo } from "@/pages/Index";
import { VideoFile } from "@/components/VideoEditor";

export interface SavedProject {
  id: string;
  name: string;
  type: 'photo' | 'video';
  photos: Photo[];
  videos: VideoFile[];
  createdAt: string;
  updatedAt: string;
  settings: {
    reelDuration: number;
    transition: string;
    photoDuration?: number;
  };
}

const STORAGE_KEY = 'reel-creator-projects';
const SETTINGS_KEY = 'reel-creator-settings';

export class LocalStorageManager {
  static saveProject(project: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'>): SavedProject {
    const projects = this.getProjects();
    const id = Math.random().toString(36).substring(2);
    const timestamp = new Date().toISOString();
    
    const newProject: SavedProject = {
      ...project,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return newProject;
  }

  static updateProject(id: string, updates: Partial<SavedProject>): SavedProject | null {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return projects[index];
  }

  static getProjects(): SavedProject[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getProject(id: string): SavedProject | null {
    const projects = this.getProjects();
    return projects.find(p => p.id === id) || null;
  }

  static deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered.length !== projects.length;
  }

  static saveSettings(settings: any): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  static getSettings(): any {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  static exportData(): string {
    const projects = this.getProjects();
    const settings = this.getSettings();
    return JSON.stringify({ projects, settings, exportedAt: new Date().toISOString() });
  }

  static importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.projects) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.projects));
      }
      if (parsed.settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed.settings));
      }
      return true;
    } catch {
      return false;
    }
  }

  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }
}