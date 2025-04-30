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
      const imagePromises = Array(4).fill(null).map(async (_, index) => {
        try {
          console.log(`Starting generation for image ${index + 1}`);
          
          const result = await fal.subscribe('fal-ai/fast-sdxl', {
            input: {
              prompt: `${prompt} - photorealistic, 8k resolution, cinematic lighting`,
              negative_prompt: 'low quality, blurry, distorted, deformed',
              image_size: 'square_hd',
              num_inference_steps: 25
            }
          });
          
          console.log(`FAL response for image ${index + 1}:`, result);
          
          // Check if we got a valid response
          if (!result || !result.data) {
            console.error(`Missing data in FAL response for image ${index + 1}:`, result);
            throw new Error('Invalid response from image generation API');
          }
          
          // Access the data property which contains the actual response
          const response = result.data as FastSdxlOutput;
          
          // Check if we have images in the response
          if (!response.images || !response.images[0] || !response.images[0].url) {
            console.error(`Missing image URL in FAL response for image ${index + 1}:`, response);
            throw new Error('No image URL in response');
          }
          
          return response.images[0].url;
        } catch (err) {
          console.error(`Error generating image ${index + 1}:`, err);
          throw err; // Re-throw to be caught by Promise.allSettled
        }
      });
      
      // Wait for all images to be generated, handling individual failures
      const results = await Promise.allSettled(imagePromises);
      console.log("Generation results:", results);
      
      // Filter only successful results
      const successfulImages = results
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map(result => result.value);
      
      console.log("Successfully generated images:", successfulImages);
      
      // If we have at least one image, show it
      if (successfulImages.length > 0) {
        setImages(successfulImages);
      } else {
        throw new Error("Failed to generate any images. Please try again.");
      }
    } catch (error) {
      console.error('Error generating images:', error);
      setError(error instanceof Error ? error.message : "Failed to generate images. Please try again.");
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
              <div className="text-center mb-6 px-4 py-3 bg-red-500 bg-opacity-75 rounded-lg">
                <p className="text-lg text-white">{error}</p>
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
