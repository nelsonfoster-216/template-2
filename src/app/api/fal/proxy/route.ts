import { NextRequest, NextResponse } from 'next/server';

// Define constants for HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  METHOD_NOT_ALLOWED: 405,
  UNSUPPORTED_MEDIA_TYPE: 415,
  PRECONDITION_FAILED: 412,
  INTERNAL_SERVER_ERROR: 500
};

// DNS fallback configuration - direct IP addresses for FAL.AI API
const FALLBACK_IPS: Record<string, string[]> = {
  // Cloudflare DNS for gateway.fal.ai
  'gateway.fal.ai': ['104.18.6.192', '104.18.7.192']
};

// Configure Node.js to bypass certificate verification when needed
if (process.env.NODE_ENV !== 'production') {
  // Only for development environments
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.log("SSL certificate verification disabled for development");
  } catch (error) {
    console.error("Failed to configure TLS settings:", error);
  }
}

// Get FAL API key from environment variable
const FAL_KEY = process.env.FAL_KEY;

// Validate if we have an API key
if (!FAL_KEY) {
  console.error('FAL_KEY environment variable is not set');
}

/**
 * Try to resolve a host using fallback IPs if needed
 * @param hostname - The hostname to resolve
 * @returns The resolved URL (using direct IP if standard DNS fails)
 */
async function resolveHost(url: string): Promise<string> {
  try {
    // First, try a standard fetch request to check DNS resolution
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    return url; // DNS resolution successful, use original URL
  } catch (error) {
    // Check if this is a DNS resolution error
    const isDnsError = 
      error instanceof Error && 
      (error.message.includes('ENOTFOUND') || 
       error.message.includes('getaddrinfo') ||
       error.message.includes('network'));
    
    if (!isDnsError) {
      // If it's not a DNS error, rethrow
      throw error;
    }
    
    // Extract the hostname from the URL
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      
      // Check if we have a fallback IP for this hostname
      if (FALLBACK_IPS[hostname] && FALLBACK_IPS[hostname].length > 0) {
        // Use the first fallback IP
        const ip = FALLBACK_IPS[hostname][0];
        const directUrl = url.replace(hostname, ip);
        
        console.log(`DNS resolution failed for ${hostname}. Using direct IP: ${ip}`);
        return directUrl;
      }
    } catch (parseError) {
      console.error('Error parsing URL for fallback:', parseError);
    }
    
    // If we don't have a fallback or can't parse the URL, return the original
    return url;
  }
}

/**
 * Validates the target URL from the request headers
 * @param request - The incoming request
 * @returns Object containing validation result and response if invalid
 */
function validateTargetUrl(request: NextRequest) {
  const targetUrl = request.headers.get('x-fal-target-url');
  
  // Check if target URL is provided
  if (!targetUrl) {
    console.error('Missing x-fal-target-url header');
    return {
      isValid: false,
      response: NextResponse.json(
        { error: 'Missing the x-fal-target-url header' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    };
  }
  
  // Parse the URL to check domain
  try {
    const url = new URL(targetUrl);
    const validDomains = ['fal.ai', 'fal.run'];
    const isDomainValid = validDomains.some(domain => url.hostname.endsWith(domain));
    
    if (!isDomainValid) {
      console.error(`Invalid target URL domain: ${url.hostname}`);
      return {
        isValid: false,
        response: NextResponse.json(
          { error: 'Target URL must be a valid fal.ai or fal.run domain' },
          { status: HTTP_STATUS.PRECONDITION_FAILED }
        )
      };
    }
    
    console.log(`Valid target URL: ${targetUrl}`);
  } catch (error) {
    console.error('Invalid target URL format:', error);
    return {
      isValid: false,
      response: NextResponse.json(
        { error: 'Invalid target URL format' },
        { status: HTTP_STATUS.PRECONDITION_FAILED }
      )
    };
  }
  
  return { isValid: true };
}

/**
 * Validates the content type of the request
 * @param request - The incoming request
 * @returns Object containing validation result and response if invalid
 */
function validateContentType(request: NextRequest) {
  // Only check for POST requests with a body
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type');
    
    if (contentType && !contentType.includes('application/json')) {
      console.error(`Invalid content type: ${contentType}`);
      return {
        isValid: false,
        response: NextResponse.json(
          { error: 'Content-Type must be application/json' },
          { status: HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE }
        )
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Forwards the request to the FAL API
 * @param request - The incoming request
 * @returns Response from the FAL API
 */
async function forwardRequest(request: NextRequest) {
  let targetUrl = request.headers.get('x-fal-target-url')!;
  const method = request.method;
  
  // Try to resolve the host with fallback to direct IP if needed
  try {
    targetUrl = await resolveHost(targetUrl);
  } catch (error) {
    console.warn('Error resolving host, continuing with original URL:', error);
  }
  
  // Clone the request headers and add authorization
  const headers = new Headers(request.headers);
  
  // Make sure the API key doesn't already have the "Key " prefix
  const cleanApiKey = FAL_KEY?.trim().replace(/^Key\s+/, '');
  headers.set('authorization', `Key ${cleanApiKey}`);
  
  // Add Host header when using direct IP
  if (FALLBACK_IPS['gateway.fal.ai']?.some(ip => targetUrl.includes(ip))) {
    headers.set('Host', 'gateway.fal.ai');
  }
  
  // Remove headers that shouldn't be forwarded
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');
  
  // Prepare the fetch options
  const options: RequestInit = {
    method,
    headers,
    redirect: 'follow',
  };
  
  // Add request body for POST methods
  if (method === 'POST') {
    try {
      const body = await request.json();
      options.body = JSON.stringify(body);
      console.log(`POST request body: ${JSON.stringify(body, null, 2).substring(0, 200)}...`);
    } catch (error) {
      console.warn('Error parsing request body:', error);
      // If there's no body or it's not valid JSON, continue without it
    }
  }
  
  try {
    console.log(`Making ${method} request to: ${targetUrl}`);
    
    // Make the request to FAL API
    const response = await fetch(targetUrl, options);
    
    // Prepare response headers
    const responseHeaders = new Headers();
    responseHeaders.set('content-type', 'application/json');
    
    // Copy any other relevant headers from the response
    response.headers.forEach((value, key) => {
      if (key !== 'content-length' && key !== 'content-encoding') {
        responseHeaders.set(key, value);
      }
    });
    
    // Get response data
    let responseData;
    try {
      responseData = await response.json();
      
      // Log a small portion of the response for debugging
      const responsePreview = JSON.stringify(responseData).substring(0, 200);
      console.log(`Response status: ${response.status}, preview: ${responsePreview}...`);
    } catch (error) {
      console.error('Invalid JSON response:', error);
      responseData = { error: 'Invalid JSON response from target' };
    }
    
    // Return the response
    return NextResponse.json(responseData, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Error forwarding request:', error);
    return NextResponse.json(
      {
        error: 'Failed to forward request to FAL API',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * Handles GET requests to the proxy
 */
export async function GET(request: NextRequest) {
  // Handle ping test requests
  if (request.nextUrl.searchParams.has('ping')) {
    try {
      // Try with the standard URL first
      let pingUrl = 'https://gateway.fal.ai/health';
      
      // Resolve the host with fallback if needed
      try {
        pingUrl = await resolveHost(pingUrl);
      } catch (error) {
        console.warn('Error resolving host for ping, continuing with original URL:', error);
      }
      
      const headers: HeadersInit = { 'authorization': `Key ${FAL_KEY?.trim().replace(/^Key\s+/, '')}` };
      
      // Add Host header when using direct IP
      if (FALLBACK_IPS['gateway.fal.ai']?.some(ip => pingUrl.includes(ip))) {
        headers['Host'] = 'gateway.fal.ai';
      }
      
      const pingResponse = await fetch(pingUrl, {
        method: 'HEAD',
        headers
      });
      
      return NextResponse.json({ 
        canReachFalAI: pingResponse.ok,
        usingDirectIp: pingUrl.includes(FALLBACK_IPS['gateway.fal.ai']?.[0] || '')
      });
    } catch (error) {
      return NextResponse.json({ 
        canReachFalAI: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  // Validate the request
  const urlValidation = validateTargetUrl(request);
  if (!urlValidation.isValid) {
    return urlValidation.response;
  }
  
  // Forward the request
  return forwardRequest(request);
}

/**
 * Handles POST requests to the proxy
 */
export async function POST(request: NextRequest) {
  // Handle ping test requests
  if (request.nextUrl.searchParams.has('ping')) {
    try {
      // Try with the standard URL first
      let pingUrl = 'https://gateway.fal.ai/health';
      
      // Resolve the host with fallback if needed
      try {
        pingUrl = await resolveHost(pingUrl);
      } catch (error) {
        console.warn('Error resolving host for ping, continuing with original URL:', error);
      }
      
      const headers: HeadersInit = { 'authorization': `Key ${FAL_KEY?.trim().replace(/^Key\s+/, '')}` };
      
      // Add Host header when using direct IP
      if (FALLBACK_IPS['gateway.fal.ai']?.some(ip => pingUrl.includes(ip))) {
        headers['Host'] = 'gateway.fal.ai';
      }
      
      const pingResponse = await fetch(pingUrl, {
        method: 'HEAD',
        headers
      });
      
      return NextResponse.json({ 
        canReachFalAI: pingResponse.ok,
        usingDirectIp: pingUrl.includes(FALLBACK_IPS['gateway.fal.ai']?.[0] || '')
      });
    } catch (error) {
      return NextResponse.json({ 
        canReachFalAI: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  // Validate the request
  const urlValidation = validateTargetUrl(request);
  if (!urlValidation.isValid) {
    return urlValidation.response;
  }
  
  const contentTypeValidation = validateContentType(request);
  if (!contentTypeValidation.isValid) {
    return contentTypeValidation.response;
  }
  
  // Forward the request
  return forwardRequest(request);
}

/**
 * Handles OPTIONS requests for CORS
 */
export function OPTIONS(request: NextRequest) {
  // Create CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-fal-target-url, Authorization',
    'Allow': 'GET, POST, OPTIONS'
  };
  
  // Return an empty response with CORS headers
  return new NextResponse(null, {
    status: HTTP_STATUS.OK,
    headers
  });
}

// Handle other HTTP methods with Method Not Allowed
export function PUT(request: NextRequest) {
  return new NextResponse(null, {
    status: HTTP_STATUS.METHOD_NOT_ALLOWED,
    headers: { 'Allow': 'GET, POST, OPTIONS' }
  });
}

export const DELETE = PUT;
export const PATCH = PUT;
export const HEAD = PUT;
