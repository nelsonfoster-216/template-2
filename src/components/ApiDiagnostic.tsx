import { useState } from 'react';

export default function ApiDiagnostic() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fal/env-test');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">API Diagnostic Tool</h2>
      
      <button
        onClick={runDiagnostic}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Running tests...' : 'Run API Diagnostic'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Results:</h3>
          
          <div className="p-4 bg-white dark:bg-gray-700 rounded border overflow-x-auto">
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
          
          {/* Summary */}
          <div className="mt-4 grid gap-2">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${result.environment.FAL_KEY !== 'NOT SET' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>FAL_KEY: {result.environment.FAL_KEY !== 'NOT SET' ? 'Set' : 'Not Set'}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${result.tests.dnsResolution === 'Success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>DNS Resolution: {result.tests.dnsResolution === 'Success' ? 'Working' : 'Failed'}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${result.tests.directIpConnection.includes('200') ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Direct IP Connection: {result.tests.directIpConnection}</span>
            </div>
          </div>
          
          {/* Recommendations */}
          {(result.environment.FAL_KEY === 'NOT SET' || result.tests.dnsResolution !== 'Success') && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
              <h4 className="font-medium">Recommendations:</h4>
              <ul className="list-disc ml-5 mt-2">
                {result.environment.FAL_KEY === 'NOT SET' && (
                  <li>Add the FAL_KEY environment variable in AWS Amplify Console</li>
                )}
                {result.tests.dnsResolution !== 'Success' && (
                  <>
                    <li>Check if the FAL.AI service is accessible from AWS Amplify's network</li>
                    <li>Consider using the direct IP connection approach as a fallback</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 