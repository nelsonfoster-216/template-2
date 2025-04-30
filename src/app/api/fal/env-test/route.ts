import { NextResponse } from 'next/server';

export async function GET() {
  // List of environment variables to check
  const envVars = {
    FAL_KEY: process.env.FAL_KEY ? `${process.env.FAL_KEY.substring(0, 4)}...` : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET',
  };

  // Test DNS resolution
  let dnsResolution = 'Failed';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    await fetch('https://gateway.fal.ai/health', {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    dnsResolution = 'Success';
  } catch (error) {
    dnsResolution = `Failed: ${error instanceof Error ? error.message : String(error)}`;
  }

  // Test direct IP connection (as a fallback)
  let directIpConnection = 'Not tested';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://104.18.6.192/health', {
      method: 'HEAD',
      headers: {
        'Host': 'gateway.fal.ai', // Set the Host header
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    directIpConnection = `${response.status} ${response.statusText}`;
  } catch (error) {
    directIpConnection = `Failed: ${error instanceof Error ? error.message : String(error)}`;
  }

  return NextResponse.json({
    message: 'Environment & Connectivity Diagnostic',
    environment: envVars,
    tests: {
      dnsResolution,
      directIpConnection,
    },
    serverInfo: {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    }
  });
} 