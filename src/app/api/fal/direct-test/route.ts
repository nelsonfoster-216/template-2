import { NextRequest, NextResponse } from 'next/server';

// Fallback IPs for FAL.AI domains
const FALLBACK_IPS = {
  'gateway.fal.ai': ['104.18.6.192', '104.18.7.192']
};

export async function GET(request: NextRequest) {
  // Get FAL API key - this should not have the "Key " prefix already
  const apiKey = process.env.FAL_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      message: 'FAL_KEY environment variable is not set'
    });
  }
  
  let usingDirectIp = false;
  
  try {
    // Add the "Key " prefix for the authorization header
    const authHeader = `Key ${apiKey.trim().replace(/^Key\s+/, '')}`;
    
    // First try the standard hostname
    try {
      console.log("Attempting direct connection to gateway.fal.ai...");
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
          message: 'API key is valid and working with standard DNS',
          usingDirectIp: false
        });
      }
    } catch (error) {
      // Check if this is a DNS resolution error
      const isDnsError = 
        error instanceof Error && 
        (error.message.includes('ENOTFOUND') || 
         error.message.includes('getaddrinfo') ||
         error.message.includes('network'));
         
      if (!isDnsError) {
        // If it's not a DNS error, rethrow it
        throw error;
      }
      
      console.log("DNS resolution failed, trying direct IP fallback...");
      
      // Try with direct IP fallback
      const ip = FALLBACK_IPS['gateway.fal.ai'][0];
      const response = await fetch(`https://${ip}/health`, {
        method: 'HEAD',
        headers: {
          'Authorization': authHeader,
          'Host': 'gateway.fal.ai'
        },
      });
      
      usingDirectIp = true;
      
      if (response.ok) {
        return NextResponse.json({
          success: true,
          status: response.status,
          message: 'API key is valid and working with direct IP',
          usingDirectIp: true
        });
      } else {
        return NextResponse.json({
          success: false,
          status: response.status,
          message: `API request failed with status: ${response.status} ${response.statusText}`,
          usingDirectIp: true
        });
      }
    }
    
    // If we get here, the standard DNS resolution worked but returned an error status
    return NextResponse.json({
      success: false,
      status: 500,
      message: `API request failed with unknown status`,
      usingDirectIp: false
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Failed to connect to FAL.AI API',
      usingDirectIp
    });
  }
} 