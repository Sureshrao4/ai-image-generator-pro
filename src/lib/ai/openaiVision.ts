interface StyleRecommendation {
  style: string;
  confidence: number;
  reasoning: string;
  suggestedFilters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
  };
}

interface TransitionRecommendation {
  transitions: string[];
  reasoning: string;
  timing: number;
}

class OpenAIVisionAnalyzer {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async analyzeImageForStyle(imageUrl: string): Promise<StyleRecommendation> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not provided');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert photo editing AI. Analyze the image and recommend the best Instagram-style editing approach. 

Available styles: Original, Instagram, Vintage, Cinematic, Dreamy, B&W Classic, Sunset, Arctic.

Respond in JSON format:
{
  "style": "recommended style name",
  "confidence": 0.8,
  "reasoning": "brief explanation why this style works",
  "suggestedFilters": {
    "brightness": 110,
    "contrast": 120,
    "saturation": 130,
    "blur": 0
  }
}

Consider: lighting, mood, subject matter, colors, composition.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and recommend the best editing style and filter values.'
                },
                {
                  type: 'image_url',
                  image_url: { url: imageUrl }
                }
              ]
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI Vision analysis failed:', error);
      // Fallback recommendation
      return {
        style: 'Instagram',
        confidence: 0.5,
        reasoning: 'Default recommendation due to API error',
        suggestedFilters: {
          brightness: 108,
          contrast: 115,
          saturation: 125,
          blur: 0
        }
      };
    }
  }

  async recommendTransitions(imageUrls: string[]): Promise<TransitionRecommendation> {
    if (!this.apiKey || imageUrls.length < 2) {
      return {
        transitions: ['fade', 'slide'],
        reasoning: 'Default transitions',
        timing: 2000
      };
    }

    try {
      const imageMessages = imageUrls.map(url => ({
        type: 'image_url' as const,
        image_url: { url }
      }));

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `Analyze these sequential images and recommend the best transitions between them for an Instagram reel.

Available transitions: fade, slide-left, slide-right, slide-up, slide-down, zoom-in, zoom-out, spin, flip, glitch, dissolve, wipe, bounce.

Consider: visual similarity, colors, movement, energy level.

Respond in JSON:
{
  "transitions": ["transition1", "transition2", ...],
  "reasoning": "why these transitions work well",
  "timing": 2000
}`
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Recommend the best transitions between these images:' },
                ...imageMessages
              ]
            }
          ],
          max_tokens: 200,
          temperature: 0.4
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      return content ? JSON.parse(content) : {
        transitions: ['fade', 'slide-left', 'zoom-in'],
        reasoning: 'Balanced mix of smooth and dynamic transitions',
        timing: 2000
      };
    } catch (error) {
      console.error('Transition recommendation failed:', error);
      return {
        transitions: ['fade', 'slide-left', 'zoom-in'],
        reasoning: 'Default varied transitions due to API error',
        timing: 2000
      };
    }
  }
}

export const openaiVision = new OpenAIVisionAnalyzer();
export type { StyleRecommendation, TransitionRecommendation };