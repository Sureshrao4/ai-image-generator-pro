import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

interface ImageAnalysis {
  dominantColors: string[];
  brightness: number;
  contrast: number;
  hasfaces: boolean;
  isPortrait: boolean;
  mood: 'bright' | 'dark' | 'neutral';
  recommendedStyle: string;
}

interface AIFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

class ImageAIProcessor {
  private segmenter: any = null;
  private classifier: any = null;

  async initialize() {
    if (!this.segmenter || !this.classifier) {
      try {
        // Initialize models in parallel
        const [segmenterResult, classifierResult] = await Promise.all([
          pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
            device: 'webgpu',
          }),
          pipeline('image-classification', 'Xenova/vit-base-patch16-224', {
            device: 'webgpu',
          })
        ]);
        
        this.segmenter = segmenterResult;
        this.classifier = classifierResult;
      } catch (error) {
        console.warn('WebGPU not available, falling back to CPU');
        const [segmenterResult, classifierResult] = await Promise.all([
          pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512'),
          pipeline('image-classification', 'Xenova/vit-base-patch16-224')
        ]);
        
        this.segmenter = segmenterResult;
        this.classifier = classifierResult;
      }
    }
  }

  private resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
    let width = image.naturalWidth;
    let height = image.naturalHeight;

    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
        width = MAX_IMAGE_DIMENSION;
      } else {
        width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
        height = MAX_IMAGE_DIMENSION;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return { width, height };
  }

  async removeBackground(imageElement: HTMLImageElement): Promise<Blob> {
    await this.initialize();
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      this.resizeImageIfNeeded(canvas, ctx, imageElement);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      const result = await this.segmenter(imageData);
      
      if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
        throw new Error('Invalid segmentation result');
      }
      
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = canvas.width;
      outputCanvas.height = canvas.height;
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) throw new Error('Could not get output canvas context');
      
      outputCtx.drawImage(canvas, 0, 0);
      
      const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
      const data = outputImageData.data;
      
      for (let i = 0; i < result[0].mask.data.length; i++) {
        const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
        data[i * 4 + 3] = alpha;
      }
      
      outputCtx.putImageData(outputImageData, 0, 0);
      
      return new Promise((resolve, reject) => {
        outputCanvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
          'image/png',
          1.0
        );
      });
    } catch (error) {
      console.error('Error removing background:', error);
      throw error;
    }
  }

  async analyzeImage(imageElement: HTMLImageElement): Promise<ImageAnalysis> {
    await this.initialize();
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    this.resizeImageIfNeeded(canvas, ctx, imageElement);
    
    // Analyze image properties
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let totalBrightness = 0;
    let totalContrast = 0;
    const colorCounts: { [key: string]: number } = {};
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < pixels.length; i += 40) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      
      // Track dominant colors (simplified)
      const colorKey = `${Math.floor(r/32)},${Math.floor(g/32)},${Math.floor(b/32)}`;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }
    
    const avgBrightness = totalBrightness / (pixels.length / 4);
    const isPortrait = canvas.height > canvas.width;
    
    // Determine mood based on brightness
    let mood: 'bright' | 'dark' | 'neutral' = 'neutral';
    if (avgBrightness > 180) mood = 'bright';
    else if (avgBrightness < 80) mood = 'dark';
    
    // Get dominant colors
    const dominantColors = Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([color]) => {
        const [r, g, b] = color.split(',').map(n => parseInt(n) * 32);
        return `rgb(${r},${g},${b})`;
      });

    // Recommend style based on analysis
    let recommendedStyle = 'Original';
    if (mood === 'bright' && isPortrait) recommendedStyle = 'Instagram';
    else if (mood === 'dark') recommendedStyle = 'Cinematic';
    else if (avgBrightness > 150) recommendedStyle = 'Sunset';
    else if (avgBrightness < 100) recommendedStyle = 'B&W Classic';
    
    return {
      dominantColors,
      brightness: avgBrightness,
      contrast: 100, // Simplified for now
      hasfaces: false, // Would need face detection model
      isPortrait,
      mood,
      recommendedStyle
    };
  }

  generateSmartFilters(analysis: ImageAnalysis): AIFilters {
    const { brightness, mood, isPortrait, recommendedStyle } = analysis;
    
    // Base adjustments based on image analysis
    let filters: AIFilters = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0
    };
    
    // Adjust based on original brightness
    if (brightness < 80) {
      filters.brightness = 120; // Brighten dark images
      filters.contrast = 130;   // Increase contrast
    } else if (brightness > 200) {
      filters.brightness = 90;  // Slightly dim very bright images
      filters.contrast = 110;
    }
    
    // Mood-based adjustments
    if (mood === 'dark') {
      filters.saturation = 85;  // Desaturate for dramatic effect
      filters.contrast = 140;
    } else if (mood === 'bright') {
      filters.saturation = 120; // Enhance colors
      filters.brightness = Math.min(filters.brightness + 10, 130);
    }
    
    // Portrait vs landscape adjustments
    if (isPortrait) {
      filters.saturation += 15; // Portraits look better with enhanced colors
    }
    
    return filters;
  }
}

export const imageAI = new ImageAIProcessor();
export type { ImageAnalysis, AIFilters };