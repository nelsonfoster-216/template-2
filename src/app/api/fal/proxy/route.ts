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

// The route function from @fal-ai/server-proxy/nextjs already provides GET and POST handlers
const { GET: falGET, POST: falPOST } = route;

// Export custom GET/POST handlers with proper error handling
export async function GET(request: NextRequest) {
  if (DEBUG) {
    console.log('FAL Proxy GET request received:', request.url);
    console.log('FAL_KEY available:', !!FAL_KEY);
  }
  
  if (!FAL_KEY) {
    if (DEBUG) console.error('FAL_KEY missing for GET request');
    return NextResponse.json(
      { error: 'FAL_KEY environment variable is not set' },
      { status: 500 }
    );
  }
  
  try {
    // Use the FAL GET handler
    const response = await falGET(request);
    
    if (DEBUG) {
      console.log('FAL GET response status:', response.status);
      if (!response.ok) {
        console.error('FAL GET error response:', await response.clone().text());
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error in FAL proxy GET:', error);
    return NextResponse.json(
      { error: 'Error processing request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (DEBUG) {
    console.log('FAL Proxy POST request received:', request.url);
    console.log('FAL_KEY available:', !!FAL_KEY);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Log body but be careful with sensitive data
    const body = await request.clone().json().catch(() => 'Unable to parse body');
    console.log('Request body keys:', body ? Object.keys(body) : 'No body');
  }
  
  if (!FAL_KEY) {
    if (DEBUG) console.error('FAL_KEY missing for POST request');
    return NextResponse.json(
      { error: 'FAL_KEY environment variable is not set' },
      { status: 500 }
    );
  }
  
  try {
    // Use the FAL POST handler
    const response = await falPOST(request);
    
    if (DEBUG) {
      console.log('FAL POST response status:', response.status);
      if (!response.ok) {
        console.error('FAL POST error response:', await response.clone().text());
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error in FAL proxy POST:', error);
    return NextResponse.json(
      { error: 'Error processing request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
