import { NextRequest, NextResponse } from 'next/server';

// Get and format FAL API key from environment variable
let FAL_KEY = process.env.FAL_KEY;

// Clean up the API key if it exists
if (FAL_KEY) {
  // Remove any quotes or extra whitespace
  FAL_KEY = FAL_KEY.trim().replace(/^['"]|['"]$/g, '');
  
  // Add "Key " prefix if it doesn't already have it
  if (!FAL_KEY.startsWith('Key ')) {
    FAL_KEY = `Key ${FAL_KEY}`;
  }
} 

export async function GET(request: NextRequest) {
  // Log environment variable information for debugging
  console.log('FAL_KEY available:', !!FAL_KEY);
  if (FAL_KEY) {
    console.log('FAL_KEY length:', FAL_KEY.length);
    console.log('FAL_KEY starts with:', FAL_KEY.substring(0, 8) + '...');
  }

  try {
    // Using direct IP for gateway.fal.ai through Cloudflare
    const directUrl = 'https://104.18.6.192/health';

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': FAL_KEY || '',
      'Host': 'gateway.fal.ai', // Important to set the Host header
    };

    console.log('Authorization header set:', !!headers.Authorization);

    // Make a direct request to test auth
    const response = await fetch(directUrl, {
      method: 'GET',
      headers,
    });

    // Log response details
    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);

    // Get the response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const responseData = await response.json().catch(async () => {
      return await response.text().catch(() => null);
    });

    // Return a more detailed diagnostic response
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      apiKeyProvided: !!FAL_KEY,
      apiKeyFormat: FAL_KEY ? (FAL_KEY.startsWith('Key ') ? 'Has "Key " prefix' : 'Missing "Key " prefix') : 'Not provided',
      headers: responseHeaders,
      data: responseData,
    });
  } catch (error) {
    console.error('Direct test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 