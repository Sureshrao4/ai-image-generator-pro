import { Photo } from "@/pages/Index";
import { VideoFile } from "@/components/VideoEditor";

export interface ExportOptions {
  quality: 'high' | 'medium' | 'low';
  format: 'mp4' | 'webm' | 'jpg' | 'png' | 'gif';
  dimensions: { width: number; height: number };
  duration?: number;
  fps?: number;
}

export class DownloadManager {
  private static createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    return [canvas, ctx];
  }

  static async downloadPhoto(photo: Photo, filename?: string): Promise<void> {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      
      // Apply filters if any
      if (photo.filters) {
        const processedBlob = await this.applyFiltersToImage(blob, photo.filters);
        this.downloadBlob(processedBlob, filename || `photo-${photo.id}.png`);
      } else {
        this.downloadBlob(blob, filename || `photo-${photo.id}.jpg`);
      }
    } catch (error) {
      console.error('Error downloading photo:', error);
      throw new Error('Failed to download photo');
    }
  }

  static async downloadReel(
    photos: Photo[], 
    options: ExportOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (photos.length === 0) {
      throw new Error('No photos to export');
    }

    try {
      if (options.format === 'gif') {
        return this.createGif(photos, options, onProgress);
      } else {
        return this.createVideo(photos, options, onProgress);
      }
    } catch (error) {
      console.error('Error creating reel:', error);
      throw new Error('Failed to create reel');
    }
  }

  static async downloadVideoReel(
    videos: VideoFile[],
    options: ExportOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (videos.length === 0) {
      throw new Error('No videos to export');
    }

    try {
      // For video reels, we'll create a compilation
      return this.createVideoCompilation(videos, options, onProgress);
    } catch (error) {
      console.error('Error creating video reel:', error);
      throw new Error('Failed to create video reel');
    }
  }

  private static async applyFiltersToImage(blob: Blob, filters: any): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const [canvas, ctx] = this.createCanvas(img.width, img.height);
        
        // Apply CSS filters to canvas context
        ctx.filter = `
          brightness(${filters.brightness}%)
          contrast(${filters.contrast}%)
          saturate(${filters.saturation}%)
          blur(${filters.blur}px)
        `;
        
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(resolve!, 'image/png');
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  private static async createGif(
    photos: Photo[],
    options: ExportOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    // Simplified GIF creation - in a real app, you'd use a library like gif.js
    const canvas = document.createElement('canvas');
    canvas.width = options.dimensions.width;
    canvas.height = options.dimensions.height;
    const ctx = canvas.getContext('2d')!;

    // Create a simple slideshow effect
    let currentPhotoIndex = 0;
    const frameDuration = (options.duration || 5000) / photos.length;
    
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
        img.crossOrigin = 'anonymous';
      });
    };

    try {
      // Load all images
      const images = await Promise.all(photos.map(photo => loadImage(photo.url)));
      
      // Create frames
      const frames: Blob[] = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const photo = photos[i];
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply filters
        if (photo.filters) {
          ctx.filter = `
            brightness(${photo.filters.brightness}%)
            contrast(${photo.filters.contrast}%)
            saturate(${photo.filters.saturation}%)
            blur(${photo.filters.blur}px)
          `;
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const frameBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(resolve!, 'image/png');
        });
        
        frames.push(frameBlob!);
        onProgress?.(((i + 1) / images.length) * 100);
      }

      // For simplicity, download the first frame as PNG
      // In a real implementation, you'd combine frames into a GIF
      this.downloadBlob(frames[0], 'reel.png');
      
    } catch (error) {
      throw new Error('Failed to create GIF');
    }
  }

  private static async createVideo(
    photos: Photo[],
    options: ExportOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    // Note: Video creation in the browser is limited without WebCodecs API
    // This is a simplified implementation that creates a slideshow-style video
    
    try {
      // Create a simple video-like experience by creating individual frames
      const canvas = document.createElement('canvas');
      canvas.width = options.dimensions.width;
      canvas.height = options.dimensions.height;
      const ctx = canvas.getContext('2d')!;

      // Create MediaRecorder for video recording
      const stream = canvas.captureStream(options.fps || 30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          this.downloadBlob(blob, 'reel.webm');
          resolve();
        };

        mediaRecorder.onerror = reject;

        // Start recording
        mediaRecorder.start();

        // Animate through photos
        let currentIndex = 0;
        const frameDuration = ((options.duration || 5000) / photos.length) / (options.fps || 30);
        
        const animate = async () => {
          if (currentIndex >= photos.length) {
            mediaRecorder.stop();
            return;
          }

          const photo = photos[currentIndex];
          const img = new Image();
          
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (photo.filters) {
              ctx.filter = `
                brightness(${photo.filters.brightness}%)
                contrast(${photo.filters.contrast}%)
                saturate(${photo.filters.saturation}%)
                blur(${photo.filters.blur}px)
              `;
            }
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            onProgress?.(((currentIndex + 1) / photos.length) * 100);
            
            setTimeout(() => {
              currentIndex++;
              animate();
            }, frameDuration * 1000);
          };
          
          img.src = photo.url;
        };

        animate();
      });
    } catch (error) {
      throw new Error('Failed to create video');
    }
  }

  private static async createVideoCompilation(
    videos: VideoFile[],
    options: ExportOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    // For video compilation, we'll download individual video segments
    // In a real app, you'd use FFmpeg.wasm or similar for video processing
    
    try {
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const response = await fetch(video.url);
        const blob = await response.blob();
        
        this.downloadBlob(blob, `video-segment-${i + 1}.${options.format}`);
        onProgress?.(((i + 1) / videos.length) * 100);
      }
    } catch (error) {
      throw new Error('Failed to create video compilation');
    }
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async downloadProjectData(projectData: any, filename?: string): Promise<void> {
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    this.downloadBlob(blob, filename || 'reel-project.json');
  }

  static getOptimalDimensions(aspectRatio: 'square' | 'portrait' | 'landscape' = 'portrait'): { width: number; height: number } {
    switch (aspectRatio) {
      case 'square':
        return { width: 1080, height: 1080 };
      case 'landscape':
        return { width: 1920, height: 1080 };
      case 'portrait':
      default:
        return { width: 1080, height: 1920 }; // Instagram Reel format
    }
  }
}