export default function LoadingIndicator() {
  return (
    <div className="flex justify-center items-center space-x-2 my-4">
      <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
    </div>
  );
} 