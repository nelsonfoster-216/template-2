# FAL.AI API Integration Troubleshooting Guide

This document provides troubleshooting steps for resolving issues with the FAL.AI API integration in your Next.js application.

## Overview of the Implementation

The application uses a server-side proxy to securely communicate with the FAL.AI API. This approach keeps your API key on the server and not exposed to clients.

Key components:
- **Proxy Route**: `/src/app/api/fal/proxy/route.ts` - Handles requests to the FAL API, adding authorization headers
- **Client Configuration**: Uses the `@fal-ai/client` library configured to use our proxy
- **DNS Fallback**: Built-in fallback to direct IP if DNS resolution fails

## Common Issues and Solutions

### 1. API Key Configuration

**Issue**: FAL.AI API returns 401 Unauthorized errors

**Solutions**:
- Ensure your API key is set in the `.env.local` file as `FAL_KEY=your_key_here`
- Make sure your API key is entered **without** the "Key " prefix (our proxy adds this)
- Verify your API key has not expired or been revoked

### 2. Network and DNS Issues

**Issue**: Cannot connect to gateway.fal.ai

**Solutions**:
- Check your DNS resolution (our diagnostics will test this)
- The proxy includes a fallback to direct IP addresses if DNS fails
- Try using a different DNS server or connect to a different network

### 3. Content Type Validation

**Issue**: "Content-Type must be application/json" error

**Solutions**:
- Ensure all POST requests set the Content-Type header to "application/json"
- Check that your request body is valid JSON

### 4. Model-Specific Errors

**Issue**: Model errors when trying to generate images

**Solutions**:
- Check for quota limitations on your FAL.AI account
- Verify the model ID is correct (e.g., '110602490-sdxl-lightning')
- Try simplifying your prompt or parameters

## Testing Environment

We've created a diagnostic page at `/fal-test` that provides:
1. **API Tester** - Tests the full FAL client with model calls
2. **API Debugger** - Tests DNS and network connectivity
3. **Image Generator** - Simple UI to generate images with the FAL.AI API

Visit this page to diagnose any issues with your FAL.AI API integration.

## Advanced Diagnostics

For more detailed diagnostics, you can check:

1. **Server Logs** - Check the console for any error messages related to the FAL API
2. **Network Panel** - Examine the requests in your browser's developer tools
3. **API Tests** - Use the specialized test endpoints:
   - `/api/fal/env-test` - Tests environment variables and connectivity
   - `/api/fal/proxy?ping=true` - Tests if the proxy can reach FAL.AI servers

## Reference Links

- [FAL.AI Documentation](https://docs.fal.ai/)
- [Server-Side Integration Guide](https://docs.fal.ai/model-endpoints/server-side)
- [FAL.AI Client Library](https://docs.fal.ai/reference/fal-ai-client) 