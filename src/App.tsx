import React, { useState } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);

    try {
      // First, check generations (simulate)
      const checkRes = await fetch('https://photoflix-magic.onrender.com/api/flux/check-generations');
      const checkData = await checkRes.json();
      if (checkData.remaining <= 0) {
        alert('No generations left!');
        setIsLoading(false);
        return;
      }

      // Then generate image
      const response = await fetch('https://photoflix-magic.onrender.com/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      setImageUrl(data.images[0]);
    } catch (err) {
      if (err instanceof Error) {
        alert('Failed: ' + err.message);
      } else {
        alert('Failed: Unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🎨 AI Image Generator</h1>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe your image..."
        style={{ width: '100%', height: '100px', marginBottom: '10px' }}
      />
      <button onClick={generateImage} disabled={isLoading}>
        {isLoading ? 'Generating...' : '✨ Generate Image'}
      </button>

      {imageUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>Generated Image:</h3>
          <img src={imageUrl} alt="AI Generated" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}

export default App;