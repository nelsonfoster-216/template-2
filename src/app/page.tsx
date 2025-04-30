'use client';

import { useState, useEffect } from 'react';
import { fal } from '@fal-ai/client';
import Navbar from '@/components/Navbar';
import ImagePromptInput from '@/components/ImagePromptInput';
import ImageGrid from '@/components/ImageGrid';
import LoadingIndicator from '@/components/LoadingIndicator';
import InfoButton from '@/components/InfoButton';
import AboutSection from '@/components/AboutSection';
import FalApiDebugger from '@/components/FalApiDebugger';
import ApiDiagnostic from '@/components/ApiDiagnostic';

// Configure FAL client with the proxy URL
fal.config({
  proxyUrl: '/api/fal/proxy',
  // Ensure we're passing credentials correctly
  credentials: 'same-origin',
  // The timeout isn't supported in the type definitions, so we remove it
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
  
  // This will allow us to check if the API connection works at all
  const [apiStatus, setApiStatus] = useState<'checking' | 'working' | 'error' | null>(null);
  
  useEffect(() => {
    // Check if the API is accessible when the component mounts
    checkApiConnection();
  }, []);
  
  const checkApiConnection = async () => {
    setApiStatus('checking');
    try {
      // Test connection using a simple GET request to verify the proxy works
      const testRequest = await fetch('/api/fal/proxy', {
        headers: {
          'x-fal-target-url': 'https://gateway.fal.ai/health',
        },
      });
      
      if (testRequest.ok) {
        console.log('FAL API connection test successful');
        setApiStatus('working');
      } else {
        const errorText = await testRequest.text();
        console.error('FAL API connection test failed:', errorText);
        setApiStatus('error');
      }
    } catch (error) {
      console.error('Error checking FAL API connection:', error);
      setApiStatus('error');
    }
  };

  const handlePromptSubmit = async (prompt: string) => {
    setIsGenerating(true);
    setHasSubmitted(true);
    setImages([]); // Clear any previous images
    setError(null); // Clear any previous errors
    
    try {
      console.log("Generating image with prompt:", prompt);
      
      // Try with higher timeout and error handling
      try {
        // Just try to generate a single image with a simplified approach
        const result = await fal.subscribe('fal-ai/fast-sdxl', {
          input: {
            prompt: `${prompt}`,
            negative_prompt: 'low quality, blurry, distorted, deformed',
            image_size: 'square_hd', 
            num_inference_steps: 25
          }
        });
        
        console.log("FAL response received:", result);
        
        // Check if we got a valid response
        if (!result || !result.data) {
          throw new Error('Invalid response from image generation API');
        }
        
        // Access the data property which contains the actual response
        const response = result.data as FastSdxlOutput;
        
        // Check if we have an image URL in the response
        if (!response.images || !response.images[0] || !response.images[0].url) {
          throw new Error('No image URL in response');
        }
        
        // Set the successful image
        setImages([response.images[0].url]);
      } catch (error) {
        // If we get a DNS error, try using an alternative endpoint
        if (error instanceof Error && 
            (error.message.includes('ENOTFOUND') || 
             error.message.includes('network') || 
             error.message.includes('DNS'))) {
          
          console.log("Detected DNS or network issue, updating connection status");
          setApiStatus('error');
          throw error; // Re-throw to be caught by the outer catch
        }
        
        throw error; // Re-throw other errors
      }
      
    } catch (error) {
      console.error('Error generating image:', error);
      
      // Provide a more detailed error message
      if (error instanceof Error) {
        if (error.message.includes('network') || 
            error.message.includes('fetch') || 
            error.message.includes('ENOTFOUND')) {
          setError("Network error connecting to the image generation service. Please check your internet connection or DNS settings. If you're on a corporate network, try using a different internet connection.");
        } else if (error.message.includes('timeout')) {
          setError("Request timed out. The image generation service might be busy. Please try again later.");
        } else if (error.message.includes('401') || error.message.includes('auth')) {
          setError("Authentication error with the image service. Please check your API key configuration.");
        } else {
          setError(`Error: ${error.message}`);
        }
      } else {
        setError("Failed to generate image. Please try again later.");
      }
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
          {apiStatus === 'error' && (
            <div className="p-4 mb-4 bg-red-500 bg-opacity-75 rounded-lg text-white">
              <h3 className="font-bold mb-2">API Connection Issue</h3>
              <p>There seems to be a problem connecting to the image generation service. This could be due to:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Missing or invalid API key</li>
                <li>Network connectivity issues</li>
                <li>Service may be temporarily unavailable</li>
              </ul>
              <button 
                onClick={checkApiConnection}
                className="mt-3 bg-white text-red-600 px-4 py-2 rounded-md font-semibold hover:bg-red-100 transition-colors"
              >
                Retry Connection
              </button>
              
              {/* Add the debugger component when there's an API error */}
              <div className="mt-5">
                <FalApiDebugger />
                <ApiDiagnostic />
              </div>
            </div>
          )}
          
          <ImagePromptInput onSubmit={handlePromptSubmit} />
          
          <div className="mt-8">
            {isGenerating && (
              <div className="text-center mb-6">
                <p className="text-lg text-gray-100">Generating your image...</p>
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
