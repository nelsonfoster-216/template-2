import { NextRequest, NextResponse } from 'next/server';

// Hard-coded IP address for gateway.fal.ai
const FAL_IP = '104.18.6.192';

export async function POST(request: NextRequest) {
  try {
    // Try to connect directly to the IP
    const response = await fetch(`https://${FAL_IP}/health`, {
      method: 'GET',
      headers: {
        'Host': 'gateway.fal.ai',  // Important: set the Host header to the domain
      },
    });
    
    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully connected to FAL.AI using direct IP' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        status: response.status,
        message: `Failed to connect to FAL.AI IP with status: ${response.status}` 
      }, { status: 502 });
    }
  } catch (error) {
    console.error('Error testing direct IP:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to FAL.AI using direct IP' 
    }, { status: 500 });
  }
} 