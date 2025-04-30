import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get FAL API key - this should not have the "Key " prefix already
  const apiKey = process.env.FAL_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      message: 'FAL_KEY environment variable is not set'
    });
  }
  
  try {
    // Add the "Key " prefix for the authorization header
    const authHeader = `Key ${apiKey.trim().replace(/^Key\s+/, '')}`;
    
    // Test by making a direct request to the FAL API
    const response = await fetch('https://gateway.fal.ai/health', {
      method: 'HEAD',
      headers: {
        'Authorization': authHeader
      },
    });
    
    if (response.ok) {
      return NextResponse.json({
        success: true,
        status: response.status,
        message: 'API key is valid and working'
      });
    } else {
      return NextResponse.json({
        success: false,
        status: response.status,
        message: `API request failed with status: ${response.status} ${response.statusText}`
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Failed to connect to FAL.AI API'
    });
  }
} 