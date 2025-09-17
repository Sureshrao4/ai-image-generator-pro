import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check
app.get('/', (req, res) => {
  res.send('✅ AI Image Generator Backend is LIVE!');
});

// Check remaining generations (for Flux Pro)
app.get('/api/flux/check-generations', async (req, res) => {
  try {
    // Simulate checking remaining generations
    const remaining = 5; // Replace with real logic later
    res.json({ remaining });
  } catch (error) {
    console.error('Error checking generations:', error);
    res.status(500).json({ error: 'Failed to check remaining generations' });
  }
});

// Generate image
app.post('/api/ai/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024"
    });

    const imageUrl = response.data[0].url;

    res.json({
      success: true,
      images: [imageUrl]
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: error.message || 'Image generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});