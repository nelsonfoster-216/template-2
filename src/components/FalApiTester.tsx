'use client';

import { useState, useEffect } from 'react';
import { fal } from '@fal-ai/client';

// Configure the FAL client to use our proxy
fal.config({
  proxyUrl: '/api/fal/proxy',
});

export default function FalApiTester() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [envStatus, setEnvStatus] = useState<any>(null);

  // Function to test the FAL API through our proxy
  const testFalApi = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Test the simple health endpoint first
      const healthResponse = await fetch('/api/fal/proxy', {
        headers: {
          'x-fal-target-url': 'https://gateway.fal.ai/health',
        },
      });
      
      const healthData = await healthResponse.json();
      
      // If health check is successful, try a simple model call
      if (healthResponse.ok) {
        // Use the FAL client
        try {
          const response = await fal.subscribe('110602490-sdxl-lightning', {
            input: {
              prompt: 'a beautiful sunset over mountains',
              num_inference_steps: 1, // Minimum for a quick test
            }
          });
          
          setResult({
            health: healthData,
            modelResponse: response
          });
        } catch (modelError) {
          console.error('Model error:', modelError);
          setResult({
            health: healthData,
            modelError: modelError instanceof Error ? modelError.message : String(modelError)
          });
        }
      } else {
        setResult({ health: healthData });
      }
    } catch (e) {
      console.error('FAL API test error:', e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  // Test environment setup
  const testEnvironment = async () => {
    try {
      const response = await fetch('/api/fal/env-test');
      const data = await response.json();
      setEnvStatus(data);
    } catch (e) {
      console.error('Environment test error:', e);
    }
  };

  // Run environment test on component mount
  useEffect(() => {
    testEnvironment();
  }, []);

  return (
    <div className="max-w-lg mx-auto bg-slate-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">FAL.AI API Tester</h2>
      
      {envStatus && (
        <div className="mb-4 p-3 bg-gray-700 text-white rounded">
          <p className="font-semibold">Environment Status:</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>FAL_KEY: {envStatus.environment.FAL_KEY}</li>
            <li>Format Valid: {envStatus.environment.FAL_KEY_FORMAT}</li>
            <li>DNS Resolution: {envStatus.tests.dnsResolution}</li>
            <li>API Auth: {envStatus.tests.apiAuthTest}</li>
          </ul>
          
          {envStatus.recommendations.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-yellow-300">Recommendations:</p>
              <ul className="list-disc pl-5 mt-1 text-sm text-yellow-200">
                {envStatus.recommendations.map((rec: string, idx: number) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={testFalApi}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test FAL.AI API'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-500 text-white rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 bg-slate-700 p-3 rounded overflow-auto">
          <p className="font-semibold">Result:</p>
          <pre className="text-xs mt-1 bg-slate-900 p-2 rounded overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 