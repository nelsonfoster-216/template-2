import { useState } from 'react';

export default function ApiDiagnostic() {
  const [result, setResult] = useState<any>(null);
  const [directTestResult, setDirectTestResult] = useState<any>(null);
  const [keyFormatResult, setKeyFormatResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [directTestLoading, setDirectTestLoading] = useState(false);
  const [keyFormatLoading, setKeyFormatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [directTestError, setDirectTestError] = useState<string | null>(null);
  const [keyFormatError, setKeyFormatError] = useState<string | null>(null);

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

  const runDirectTest = async () => {
    setDirectTestLoading(true);
    setDirectTestError(null);
    try {
      const response = await fetch('/api/fal/direct-test');
      const data = await response.json();
      setDirectTestResult(data);
    } catch (err) {
      setDirectTestError(err instanceof Error ? err.message : String(err));
    } finally {
      setDirectTestLoading(false);
    }
  };

  const checkKeyFormat = async () => {
    setKeyFormatLoading(true);
    setKeyFormatError(null);
    try {
      const response = await fetch('/api/fal/key-format');
      const data = await response.json();
      setKeyFormatResult(data);
    } catch (err) {
      setKeyFormatError(err instanceof Error ? err.message : String(err));
    } finally {
      setKeyFormatLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">API Diagnostic Tool</h2>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running tests...' : 'Run API Diagnostic'}
        </button>
        
        <button
          onClick={runDirectTest}
          disabled={directTestLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {directTestLoading ? 'Testing...' : 'Test Direct API Connection'}
        </button>

        <button
          onClick={checkKeyFormat}
          disabled={keyFormatLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {keyFormatLoading ? 'Checking...' : 'Check API Key Format'}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {keyFormatError && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {keyFormatError}
        </div>
      )}
      
      {keyFormatResult && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">API Key Format Analysis:</h3>
          
          <div className="p-4 bg-white dark:bg-gray-700 rounded border">
            <div className="grid gap-2">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${keyFormatResult.keyPresent ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>API Key Present: {keyFormatResult.keyPresent ? 'Yes' : 'No'}</span>
              </div>
              
              {keyFormatResult.keyPresent && (
                <>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${!keyFormatResult.containsQuotes ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Contains Quotes: {keyFormatResult.containsQuotes ? 'Yes (problem)' : 'No (good)'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${keyFormatResult.hasKeyPrefix ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Has &quot;Key &quot; Prefix: {keyFormatResult.hasKeyPrefix ? 'Yes (good)' : 'No (problem)'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${!keyFormatResult.hasExtraSpaces ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Has Extra Spaces: {keyFormatResult.hasExtraSpaces ? 'Yes (problem)' : 'No (good)'}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-200 rounded whitespace-pre-wrap">
              {keyFormatResult.suggestion}
            </div>
          </div>
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">General Diagnostic Results:</h3>
          
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
                    <li>Check if the FAL.AI service is accessible from AWS Amplify&apos;s network</li>
                    <li>Consider using the direct IP connection approach as a fallback</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {directTestError && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {directTestError}
        </div>
      )}
      
      {directTestResult && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Direct API Test Results:</h3>
          
          <div className="p-4 bg-white dark:bg-gray-700 rounded border overflow-x-auto">
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(directTestResult, null, 2)}
            </pre>
          </div>
          
          {/* Direct Test Summary */}
          <div className="mt-4 bg-gray-100 dark:bg-gray-600 p-4 rounded">
            <h4 className="font-medium">API Key Status:</h4>
            <div className="flex items-center mt-2">
              <div className={`w-4 h-4 rounded-full mr-2 ${directTestResult.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>
                {directTestResult.success 
                  ? 'API key is valid and working' 
                  : `API key validation failed (Status: ${directTestResult.status || 'unknown'})`}
              </span>
            </div>
            
            {!directTestResult.success && directTestResult.status === 401 && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
                <h4 className="font-medium">API Key Issues:</h4>
                <ul className="list-disc ml-5 mt-2">
                  <li>The API key appears to be invalid or improperly formatted</li>
                  <li>Check if the API key in AWS Amplify environment variables is correct</li>
                  <li>Ensure the key is entered without any extra spaces or quotes</li>
                  <li>The key should be in the format: <code className="bg-gray-200 px-1 rounded">Key sk-xxx...</code> or just <code className="bg-gray-200 px-1 rounded">sk-xxx...</code></li>
                  <li>Try regenerating a new API key from FAL.AI dashboard</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 