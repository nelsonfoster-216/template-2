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

// Get FAL API key from environment variable
const FAL_KEY = process.env.FAL_KEY;

// Validate if we have an API key
if (!FAL_KEY) {
  console.error('FAL_KEY environment variable is not set');
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
      return {
        isValid: false,
        response: NextResponse.json(
          { error: 'Target URL must be a valid fal.ai or fal.run domain' },
          { status: HTTP_STATUS.PRECONDITION_FAILED }
        )
      };
    }
  } catch (error) {
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
  const targetUrl = request.headers.get('x-fal-target-url')!;
  const method = request.method;
  
  // Clone the request headers and add authorization
  const headers = new Headers(request.headers);
  headers.set('authorization', `Key ${FAL_KEY}`);
  
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
    } catch (error) {
      // If there's no body or it's not valid JSON, continue without it
    }
  }
  
  try {
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
    } catch (error) {
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
      const pingResponse = await fetch('https://gateway.fal.ai/health', {
        method: 'HEAD',
        headers: { 'authorization': `Key ${FAL_KEY}` },
      });
      return NextResponse.json({ canReachFalAI: pingResponse.ok });
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
      const pingResponse = await fetch('https://gateway.fal.ai/health', {
        method: 'HEAD',
        headers: { 'authorization': `Key ${FAL_KEY}` },
      });
      return NextResponse.json({ canReachFalAI: pingResponse.ok });
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
 * Handles unsupported HTTP methods
 */
export function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: HTTP_STATUS.METHOD_NOT_ALLOWED,
    headers: {
      'Allow': 'GET, POST'
    }
  });
}

export const PUT = OPTIONS;
export const DELETE = OPTIONS;
export const PATCH = OPTIONS;
export const HEAD = OPTIONS;
