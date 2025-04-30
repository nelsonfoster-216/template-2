import { route } from '@fal-ai/server-proxy/nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Get FAL API key from environment variable
const FAL_KEY = process.env.FAL_KEY;

// Check if the API key is available
if (!FAL_KEY) {
  console.error('FAL_KEY environment variable is not set');
}

// Export custom GET/POST handlers with proper error handling
export async function GET(request: NextRequest) {
  if (!FAL_KEY) {
    return NextResponse.json(
      { error: 'FAL_KEY environment variable is not set' },
      { status: 500 }
    );
  }
  
  // Configure route handler with the API key
  const handler = route.GET;
  return handler(request);
}

export async function POST(request: NextRequest) {
  if (!FAL_KEY) {
    return NextResponse.json(
      { error: 'FAL_KEY environment variable is not set' },
      { status: 500 }
    );
  }
  
  // Configure route handler with the API key
  const handler = route.POST;
  return handler(request);
}
