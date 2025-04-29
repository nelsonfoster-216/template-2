import { useState, FormEvent } from 'react';

interface ImagePromptInputProps {
  onSubmit: (prompt: string) => void;
}

export default function ImagePromptInput({ onSubmit }: ImagePromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Describe image here"
            className={`w-full p-4 text-center rounded-md border-2 transition-all duration-300 ${
              isFocused 
                ? 'border-indigo-600 bg-white shadow-lg' 
                : 'border-indigo-500 bg-white bg-opacity-90 shadow-md'
            } focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-800 placeholder-gray-500`}
          />
          <div className="absolute right-3 bottom-3 text-xs text-gray-600">
            Press Enter to generate
          </div>
        </div>
      </form>
    </div>
  );
} 