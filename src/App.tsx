import { useState } from "react";

export default function Index() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.images || data.images.length === 0) {
        throw new Error("No images returned from API");
      }

      setImageUrl(data.images[0]);
    } catch (err) {
      if (err instanceof Error) {
        alert("Failed: " + err.message);
      } else {
        alert("Failed: " + String(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>AI Image Generator</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your image prompt..."
        rows={4}
        cols={50}
        style={{ display: "block", margin: "1rem auto" }}
      />
      <button onClick={generateImage} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Image"}
      </button>

      {imageUrl && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Generated Image:</h2>
          <img
            src={imageUrl}
            alt="Generated result"
            style={{ maxWidth: "100%", borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
}
