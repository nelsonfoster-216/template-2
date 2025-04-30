'use client';

import { useState } from 'react';
import { fal } from '@fal-ai/client';

// Configure the FAL client to use our proxy
fal.config({
  proxyUrl: '/api/fal/proxy',
});

// Lightning model ID for SDXL
const MODEL_ID = '110602490-sdxl-lightning';

// Define types for the FAL API response
interface FalImage {
  url: string;
  width: number;
  height: number;
}

interface FalApiResponse {
  images: FalImage[];
  // Add other properties as needed
}

export default function FalImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Generating image with prompt:', prompt);
      
      // Call the FAL.AI API
      const result = await fal.subscribe(MODEL_ID, {
        input: {
          prompt: prompt,
          num_inference_steps: 4, // Lower for faster results during testing
          guidance_scale: 7.5,
        },
      });
      
      console.log('Image generation result:', result);
      
      // Use type assertion to handle the response
      const resultData = result as unknown as { images?: Array<{ url: string }> };
      
      if (resultData && resultData.images && resultData.images[0]?.url) {
        setGeneratedImage(resultData.images[0].url);
      } else {
        setError('No image was generated. Check the console for details.');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-slate-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">FAL.AI Image Generator</h2>
      
      <div className="mb-4">
        <label htmlFor="prompt" className="block text-sm font-medium mb-1">
          Image Prompt
        </label>
        <textarea
          id="prompt"
          className="w-full p-2 rounded bg-slate-700 text-white"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a detailed description of the image you want to generate..."
        />
      </div>
      
      <button
        onClick={generateImage}
        disabled={isLoading || !prompt.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Image'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-500 text-white rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {generatedImage && (
        <div className="mt-4">
          <p className="font-semibold mb-2">Generated Image:</p>
          <div className="relative aspect-square bg-slate-900 rounded overflow-hidden">
            <img 
              src={generatedImage} 
              alt="Generated image"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <div className="text-xs mt-1 break-words">
              <span className="font-semibold">URL:</span> {generatedImage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 