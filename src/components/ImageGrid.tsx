interface ImageGridProps {
  images: string[];
  isGenerating: boolean;
  hasSubmitted: boolean;
}

export default function ImageGrid({ images, isGenerating, hasSubmitted }: ImageGridProps) {
  // If no images and not submitted yet, don't show anything
  if (!hasSubmitted && !isGenerating) {
    return null;
  }

  // If generating or has submitted, show placeholders or images
  const displayImages = images.length > 0 
    ? images 
    : Array(4).fill('placeholder');

  const handleDownload = (imageUrl: string, index: number) => {
    if (imageUrl === 'placeholder') return;
    
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated-image-${index + 1}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => console.error('Error downloading image:', error));
  };

  const handleCopy = (imageUrl: string, buttonId: string) => {
    if (imageUrl === 'placeholder') return;
    
    // Copy image URL to clipboard
    navigator.clipboard.writeText(imageUrl)
      .then(() => {
        // Add animation class to the button
        const button = document.getElementById(buttonId);
        if (button) {
          button.classList.add('copy-animation');
          // Remove the animation class after animation completes
          setTimeout(() => {
            button.classList.remove('copy-animation');
          }, 500);
        }
      })
      .catch(error => console.error('Error copying image URL:', error));
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-2 gap-4">
      {displayImages.map((image, index) => (
        <div 
          key={index} 
          className={`aspect-square rounded-md shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center overflow-hidden relative ${
            isGenerating ? 'animate-pulse' : ''
          }`}
          style={{ 
            animationDelay: `${index * 150}ms`,
          }}
        >
          <div 
            className={`w-full h-full bg-gray-200 rounded-md ${
              isGenerating ? 'filter blur-sm scale-105' : ''
            }`}
            style={{ 
              transition: 'all 0.5s ease-in-out',
            }}
          >
            {image !== 'placeholder' && (
              <>
                <img 
                  src={image} 
                  alt={`Generated image ${index + 1}`} 
                  className="w-full h-full object-cover rounded-md"
                />
                {/* Action buttons container */}
                <div className="absolute top-2 right-2 flex space-x-2">
                  {/* Copy button */}
                  <button
                    id={`copy-btn-${index}`}
                    onClick={() => handleCopy(image, `copy-btn-${index}`)}
                    className="bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all duration-200"
                    aria-label="Copy image URL"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  {/* Download button */}
                  <button
                    onClick={() => handleDownload(image, index)}
                    className="bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all duration-200"
                    aria-label="Download image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      <style jsx global>{`
        .copy-animation {
          transform: scale(1.1);
          background-color: rgba(255, 255, 255, 1);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
} 