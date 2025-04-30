import { route } from '@fal-ai/server-proxy/nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Get FAL API key from environment variable
const FAL_KEY = process.env.FAL_KEY;

// Check if the API key is available
if (!FAL_KEY) {
  console.error('FAL_KEY environment variable is not set');
}

// Enable debugging to see what's happening with the requests
const DEBUG = true;

// Setup the FAL server proxy with credentials
process.env.FAL_KEY = FAL_KEY; // The library reads this from process.env

// Define direct IP addresses for FAL.AI as a fallback (using Cloudflare DNS for fallback)
const FAL_API_FALLBACK = {
  hostname: '104.18.6.192', // This is a possible IP for gateway.fal.ai (may need updating)
  healthEndpoint: 'https://104.18.6.192/health',
  apiEndpoint: 'https://104.18.6.192',
};

// Function to manually construct API requests when DNS fails
async function callFalApiDirectly(targetUrl: string, method: string, body?: any, headers?: any) {
  try {
    console.log(`Direct API call to: ${targetUrl}`);
    
    // Convert gateway.fal.ai URLs to direct IP addresses
    const directUrl = targetUrl.replace('gateway.fal.ai', FAL_API_FALLBACK.hostname);
    
    // Construct headers with FAL key
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Key ${FAL_KEY}`,
      'Host': 'gateway.fal.ai', // Set the Host header to the original hostname
      ...headers
    };
    
    // Make the fetch request
    const response = await fetch(directUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    // Get the response
    const responseData = await response.json().catch(() => response.text());
    
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Direct API call failed:', error);
    return NextResponse.json({
      error: 'Direct API call failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Check if the hostname is resolvable
async function isHostnameResolvable(hostname: string): Promise<boolean> {
  try {
    // Attempt to make a simple fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    await fetch(`https://${hostname}/health`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.log(`Cannot resolve ${hostname}:`, error);
    return false;
  }
}

// Create custom handlers with better error handling and fallback
export async function GET(request: NextRequest) {
  // Check if this is a ping test request
  if (request.nextUrl.searchParams.has('ping') || request.headers.get('x-ping-test')) {
    try {
      const canReachDirect = await isHostnameResolvable('gateway.fal.ai');
      return NextResponse.json({ canReachFalAI: canReachDirect });
    } catch (error) {
      return NextResponse.json({ canReachFalAI: false, error: String(error) });
    }
  }

  try {
    // Get the target URL from the header
    const targetUrl = request.headers.get('x-fal-target-url');
    
    // Route through the standard FAL handler first
    const { GET: falGET } = route;
    
    try {
      // Try the standard route handler first
      return await falGET(request);
    } catch (error) {
      // If DNS resolution fails, use our fallback
      if (error instanceof Error && 
          (error.message.includes('ENOTFOUND') || 
           error.message.includes('getaddrinfo'))) {
        
        console.log('DNS resolution failed, using direct IP fallback');
        
        // Make sure we have a target URL
        if (!targetUrl) {
          return NextResponse.json({
            error: "Missing the x-fal-target-url header",
          }, { status: 400 });
        }
        
        // Use direct IP call as fallback
        return await callFalApiDirectly(targetUrl, 'GET');
      }
      
      // Re-throw other errors
      throw error;
    }
  } catch (error) {
    console.error('Error in FAL proxy GET:', error);
    
    return NextResponse.json({
      error: "Error processing request",
      details: error instanceof Error ? error.message : String(error),
      suggestion: "There may be a network connectivity issue. Check your connection and DNS settings."
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Check if this is a ping test request
  if (request.nextUrl.searchParams.has('ping') || request.headers.get('x-ping-test')) {
    try {
      const canReachDirect = await isHostnameResolvable('gateway.fal.ai');
      return NextResponse.json({ canReachFalAI: canReachDirect });
    } catch (error) {
      return NextResponse.json({ canReachFalAI: false, error: String(error) });
    }
  }

  try {
    // Get the target URL and body
    const targetUrl = request.headers.get('x-fal-target-url');
    const body = await request.json().catch(() => null);
    
    // Route through the standard FAL handler first
    const { POST: falPOST } = route;
    
    try {
      // Try the standard route handler first
      return await falPOST(request);
    } catch (error) {
      // If DNS resolution fails, use our fallback
      if (error instanceof Error && 
          (error.message.includes('ENOTFOUND') || 
           error.message.includes('getaddrinfo'))) {
        
        console.log('DNS resolution failed, using direct IP fallback');
        
        // Make sure we have a target URL
        if (!targetUrl) {
          return NextResponse.json({
            error: "Missing the x-fal-target-url header",
          }, { status: 400 });
        }
        
        // Use direct IP call as fallback
        return await callFalApiDirectly(targetUrl, 'POST', body);
      }
      
      // Re-throw other errors
      throw error;
    }
  } catch (error) {
    console.error('Error in FAL proxy POST:', error);
    
    return NextResponse.json({
      error: "Error processing request",
      details: error instanceof Error ? error.message : String(error),
      suggestion: "There may be a network connectivity issue. Check your connection and DNS settings."
    }, { status: 500 });
  }
}
