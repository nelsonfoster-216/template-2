import { useState } from 'react';

export default function AboutSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-10 px-4 py-2 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors"
        aria-label="About this app"
      >
        About
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 bg-opacity-90 rounded-lg shadow-xl max-w-2xl w-full p-6 relative text-white">
            {/* Close button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-300 hover:text-white"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="mt-2">
              <h2 className="text-3xl font-bold text-indigo-400 mb-6">StardustStudio AI Image Generator</h2>
              
              <div className="space-y-6 text-gray-100">
                <p className="text-lg">
                  A high-resolution AI image generator built with Next.js, React, and TypeScript, leveraging the FAL.AI API to create stunning AI-generated images based on text prompts.
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-indigo-300">✨ Features</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Generate high-quality, 8K resolution images from text prompts</li>
                    <li>Create 4 unique variations for each prompt</li>
                    <li>Modern, responsive UI with beautiful animations</li>
                    <li>Download generated images with a single click</li>
                    <li>Copy image URLs to clipboard</li>
                    <li>Clean, minimalist interface focused on the creative experience</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-indigo-300">🛠️ Tech Stack</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-indigo-200">Frontend:</h4>
                      <ul className="list-disc pl-5">
                        <li>Next.js 14 with App Router</li>
                        <li>React 18</li>
                        <li>TypeScript</li>
                        <li>Tailwind CSS</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-indigo-200">AI Integration:</h4>
                      <ul className="list-disc pl-5">
                        <li>FAL.AI for image generation</li>
                        <li>@fal-ai/client for client-side API</li>
                        <li>@fal-ai/server-proxy for server proxy</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-indigo-300">🚀 How to Use</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Enter a descriptive prompt in the text input field</li>
                    <li>Press Enter or click Submit to generate images</li>
                    <li>Wait for the generation process to complete (typically 10-30 seconds)</li>
                    <li>View, download, or copy the URLs of the generated images</li>
                    <li>Enter a new prompt to generate more images</li>
                  </ol>
                </div>

                <div className="pt-4 border-t border-indigo-800 text-center text-sm text-gray-400">
                  <p>Made with robots and soul by Nelson Foster, Co-Founder and CEO, Prokofa Solutions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 