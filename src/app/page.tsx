'use client';

import { useState, useEffect } from 'react';
import { fal } from '@fal-ai/client';
import Navbar from '@/components/Navbar';
import ImagePromptInput from '@/components/ImagePromptInput';
import ImageGrid from '@/components/ImageGrid';
import LoadingIndicator from '@/components/LoadingIndicator';
import InfoButton from '@/components/InfoButton';
import AboutSection from '@/components/AboutSection';

// Configure FAL client with the proxy URL
fal.config({
  proxyUrl: '/api/fal/proxy',
});

// Define the type for FastSdxl output based on the API documentation
interface FastSdxlOutput {
  images: Array<{ url: string }>;
  // Add other properties as needed
}

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromptSubmit = async (prompt: string) => {
    setIsGenerating(true);
    setHasSubmitted(true);
    setImages([]); // Clear any previous images
    setError(null); // Clear any previous errors
    
    try {
      console.log("Generating images with prompt:", prompt);
      // Generate 4 images in parallel
      const imagePromises = Array(4).fill(null).map(async () => {
        const result = await fal.subscribe('fal-ai/fast-sdxl', {
          input: {
            prompt: `${prompt} - photorealistic, 8k resolution, cinematic lighting`,
            negative_prompt: 'low quality, blurry, distorted, deformed',
            image_size: 'square_hd',
            num_inference_steps: 25
          }
        });
        
        console.log("FAL response:", result);
        // Access the data property which contains the actual response
        const response = result.data as FastSdxlOutput;
        return response.images[0].url;
      });
      
      // Wait for all images to be generated
      const generatedImages = await Promise.all(imagePromises);
      console.log("Generated images:", generatedImages);
      setImages(generatedImages);
    } catch (error) {
      console.error('Error generating images:', error);
      setError("Failed to generate images. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[url('https://images.unsplash.com/photo-1543722530-d2c3201371e7')] bg-cover bg-fixed bg-center text-white">
      <Navbar />
      {/* InfoButton hidden for now */}
      <AboutSection />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ImagePromptInput onSubmit={handlePromptSubmit} />
          
          <div className="mt-8">
            {isGenerating && (
              <div className="text-center mb-6">
                <p className="text-lg text-gray-100">Generating your images...</p>
                <LoadingIndicator />
              </div>
            )}
            
            {error && (
              <div className="text-center mb-6">
                <p className="text-lg text-red-400">{error}</p>
              </div>
            )}
            
            <ImageGrid 
              images={images} 
              isGenerating={isGenerating} 
              hasSubmitted={hasSubmitted} 
            />
          </div>
        </div>
      </main>
      
      <footer className="bg-slate-800 bg-opacity-80 py-4 text-center text-white text-sm">
        <div className="container mx-auto px-4">
          <p>Made with robots and soul by Nelson Foster, Co-Founder and CEO, Prokofa Solutions.</p>
        </div>
      </footer>
    </div>
  );
}
