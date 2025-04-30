import { NextResponse } from 'next/server';

export async function GET() {
  // Get FAL API key and validate format
  let falKeyStatus = 'NOT SET';
  let falKeyFormatValid = false;
  
  if (process.env.FAL_KEY) {
    // Mask the key for security
    const maskedKey = `${process.env.FAL_KEY.substring(0, 4)}...${process.env.FAL_KEY.slice(-4)}`;
    falKeyStatus = `Set (${maskedKey})`;
    
    // Check if key format is valid (should not start with "Key ")
    falKeyFormatValid = !process.env.FAL_KEY.trim().startsWith('Key ');
  }

  // List of environment variables to check
  const envVars = {
    FAL_KEY: falKeyStatus,
    FAL_KEY_FORMAT: falKeyFormatValid ? 'Valid' : 'Invalid or not set',
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET',
  };

  // Test DNS resolution
  let dnsResolution = 'Failed';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://gateway.fal.ai/health', {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    dnsResolution = response.ok ? 'Success' : `Failed with status: ${response.status}`;
  } catch (error) {
    dnsResolution = `Failed: ${error instanceof Error ? error.message : String(error)}`;
  }

  // Test API authorization (if key is set)
  let apiAuthTest = 'Not tested (no key)';
  if (process.env.FAL_KEY) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://gateway.fal.ai/health', {
        method: 'HEAD',
        headers: {
          'Authorization': `Key ${process.env.FAL_KEY.trim().replace(/^Key\s+/, '')}`
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      apiAuthTest = response.ok ? 'Success' : `Failed with status: ${response.status}`;
    } catch (error) {
      apiAuthTest = `Failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // Test proxy endpoint
  let proxyTest = 'Not tested';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('/api/fal/proxy', {
      method: 'GET',
      headers: {
        'x-fal-target-url': 'https://gateway.fal.ai/health'
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    proxyTest = response.ok ? 'Success' : `Failed with status: ${response.status}`;
  } catch (error) {
    proxyTest = `Failed: ${error instanceof Error ? error.message : String(error)}`;
  }

  return NextResponse.json({
    message: 'Environment & Connectivity Diagnostic',
    environment: envVars,
    tests: {
      dnsResolution,
      apiAuthTest,
      proxyTest
    },
    serverInfo: {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    },
    recommendations: [
      !process.env.FAL_KEY ? "Add FAL_KEY environment variable" : null,
      !falKeyFormatValid ? "Ensure FAL_KEY doesn't have 'Key ' prefix - the proxy adds this automatically" : null,
      dnsResolution.includes('Failed') ? "Check network connectivity to gateway.fal.ai" : null,
      apiAuthTest.includes('401') ? "Check if your FAL API key is valid" : null
    ].filter(Boolean)
  });
} 