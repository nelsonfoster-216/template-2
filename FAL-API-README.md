# FAL.AI API Integration Guide

This document explains how the FAL.AI API integration works in this application and how to properly configure it.

## Overview

The application uses FAL.AI for AI image generation. To keep the API key secure, we've implemented a server-side proxy that handles API requests while keeping the API key on the server.

## Configuration

### Setting Up Your API Key

1. Get an API key from the [FAL.AI dashboard](https://fal.ai/dashboard)
2. Add the API key to your environment variables:
   - For local development: Create a `.env.local` file with `FAL_KEY=your_api_key_here`
   - For production: Set the `FAL_KEY` environment variable in your hosting platform

**IMPORTANT:** Do NOT include the "Key " prefix in your API key configuration. The proxy will add this automatically.

### Environment Variables

- `FAL_KEY` - Your FAL.AI API key (without the "Key " prefix)
- `NEXT_PUBLIC_BASE_URL` - Base URL for the application (optional, used for callbacks)

## Implementation Details

### Proxy Implementation

The proxy is implemented in `/src/app/api/fal/proxy/route.ts` and follows the official [FAL.AI server-side integration guidelines](https://docs.fal.ai/model-endpoints/server-side).

It handles:
- Proper request validation (target URL, content type)
- Adding authorization headers with your API key
- Forwarding requests to FAL.AI API
- Returning responses to the client

### Client Configuration

The client is configured in `/src/app/page.tsx` to use the proxy:

```typescript
import { fal } from '@fal-ai/client';

fal.config({
  proxyUrl: '/api/fal/proxy',
});
```

### Diagnostic Tools

The application includes several diagnostic components to help troubleshoot API connectivity:

- `/api/fal/env-test` - Checks environment variables and connectivity
- `/api/fal/proxy?ping=true` - Tests if the proxy can reach FAL.AI servers

## Troubleshooting

If you encounter issues with the FAL.AI API integration:

1. Verify your API key is correctly set without the "Key " prefix
2. Check network connectivity to `gateway.fal.ai`
3. Look for DNS resolution issues
4. Test the proxy endpoint with `/api/fal/env-test`

## Security Considerations

- The API key is only stored on the server
- The proxy validates that requests only go to FAL.AI domains
- The client cannot access the API key directly 