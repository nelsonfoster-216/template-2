import FalApiTester from '@/components/FalApiTester';
import FalApiDebugger from '@/components/FalApiDebugger';
import FalImageGenerator from '@/components/FalImageGenerator';

export default function FalTestPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-6">FAL.AI API Testing</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">API Tester</h2>
            <p className="text-sm text-slate-300 mb-4">Tests the full FAL client with model calls</p>
            <FalApiTester />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">API Debugger</h2>
            <p className="text-sm text-slate-300 mb-4">Tests DNS and network connectivity</p>
            <FalApiDebugger />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Image Generator</h2>
          <p className="text-sm text-slate-300 mb-4">Generate images using the FAL.AI API</p>
          <FalImageGenerator />
        </div>
        
        <div className="mt-8 p-4 bg-slate-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Troubleshooting Guide</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Ensure your <code className="bg-slate-700 px-1 rounded">FAL_KEY</code> environment variable is set correctly in <code className="bg-slate-700 px-1 rounded">.env.local</code> file.</li>
            <li>Make sure your API key is entered <strong>without</strong> the "Key " prefix.</li>
            <li>Check if your network can reach gateway.fal.ai (our diagnostics will check this).</li>
            <li>If DNS issues are detected, try using a different DNS server or connect to a different network.</li>
            <li>The proxy has a fallback to direct IP addresses for gateway.fal.ai if DNS fails.</li>
            <li>Verify that your API key has sufficient usage quota remaining.</li>
          </ol>
        </div>
      </div>
    </main>
  );
} 