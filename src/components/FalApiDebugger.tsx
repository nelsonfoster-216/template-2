'use client';

import { useState } from 'react';

export default function FalApiDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkTestResult, setNetworkTestResult] = useState<{
    canReachGoogle: boolean;
    canReachFalAi: boolean;
    isDnsIssue: boolean;
    usingFallback: boolean;
  } | null>(null);

  const testFalApi = async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      // Run network test first
      await testNetworkConnectivity();
      
      // Test direct connection to FAL API via proxy with fallback support
      const response = await fetch('/api/fal/proxy', {
        headers: {
          'x-fal-target-url': 'https://gateway.fal.ai/health',
        },
      });
      
      const data = await response.json().catch(() => response.text());
      
      setDebugInfo({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      });
      
      // Update network test with fallback status if it worked
      if (response.ok && networkTestResult?.isDnsIssue) {
        setNetworkTestResult(prev => prev ? {
          ...prev,
          usingFallback: true
        } : null);
      }
    } catch (error) {
      console.error('Error testing FAL API:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const testNetworkConnectivity = async () => {
    try {
      // Test connection to Google (general internet connectivity)
      const googleResult = await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors' // This is important for CORS issues
      }).then(() => true).catch(() => false);
      
      // Use our special ping endpoint to test DNS resolution and direct IP fallback
      const pingResponse = await fetch('/api/fal/proxy?ping=true')
        .then(r => r.json())
        .catch(() => ({ canReachFalAI: false, usingDirectIp: false }));
      
      // Check our direct test API endpoint
      const directTest = await fetch('/api/fal/direct-test')
        .then(r => r.json())
        .catch(() => ({ success: false, usingDirectIp: false }));
      
      setNetworkTestResult({
        canReachGoogle: googleResult,
        canReachFalAi: pingResponse.canReachFalAI,
        isDnsIssue: !pingResponse.canReachFalAI && (googleResult || pingResponse.usingDirectIp || directTest.usingDirectIp),
        usingFallback: pingResponse.usingDirectIp || directTest.usingDirectIp
      });
    } catch (e) {
      console.error("Network test error:", e);
      setNetworkTestResult({
        canReachGoogle: false,
        canReachFalAi: false,
        isDnsIssue: false,
        usingFallback: false
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-slate-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">FAL.AI API Debugger</h2>
      
      <button
        onClick={testFalApi}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test FAL.AI Connection'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-500 text-white rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {networkTestResult && (
        <div className="mt-4 p-3 bg-gray-700 text-white rounded">
          <p className="font-semibold">Network Test Results:</p>
          <ul className="mt-2 space-y-1">
            <li className="flex items-center">
              <span className={`inline-block w-4 h-4 mr-2 rounded-full ${networkTestResult.canReachGoogle ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {networkTestResult.canReachGoogle ? 'Can reach Google' : 'Cannot reach Google - check your internet connection'}
            </li>
            <li className="flex items-center">
              <span className={`inline-block w-4 h-4 mr-2 rounded-full ${networkTestResult.canReachFalAi ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {networkTestResult.canReachFalAi ? 'DNS can resolve gateway.fal.ai' : 'DNS cannot resolve gateway.fal.ai'}
            </li>
            {networkTestResult.isDnsIssue && (
              <li className="flex items-center">
                <span className={`inline-block w-4 h-4 mr-2 rounded-full ${networkTestResult.usingFallback ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                {networkTestResult.usingFallback 
                  ? 'Using direct IP fallback (working)' 
                  : 'Direct IP fallback not confirmed yet'}
              </li>
            )}
          </ul>
          {!networkTestResult.canReachGoogle && (
            <div className="mt-2 text-yellow-300 text-sm">
              Your device cannot connect to the internet. Please check your network connection.
            </div>
          )}
          {networkTestResult.isDnsIssue && (
            <div className="mt-2 text-yellow-300 text-sm">
              <p>DNS cannot resolve gateway.fal.ai, which is needed for the FAL.AI API. Possible causes:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>DNS resolution issues with your ISP or network</li>
                <li>Firewall or corporate network blocking this domain</li>
                <li>Local DNS cache issues</li>
              </ul>
              <p className="mt-1">Using direct IP fallback as a workaround.</p>
            </div>
          )}
        </div>
      )}
      
      {debugInfo && (
        <div className="mt-4 bg-slate-700 p-3 rounded overflow-auto">
          <p className="font-semibold">Status: {debugInfo.status} {debugInfo.statusText}</p>
          <div className="mt-2">
            <p className="font-semibold">Response Data:</p>
            <pre className="text-xs mt-1 bg-slate-900 p-2 rounded overflow-auto">
              {typeof debugInfo.data === 'string' 
                ? debugInfo.data 
                : JSON.stringify(debugInfo.data, null, 2)
              }
            </pre>
          </div>
          <div className="mt-2">
            <p className="font-semibold">Headers:</p>
            <pre className="text-xs mt-1 bg-slate-900 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo.headers, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 