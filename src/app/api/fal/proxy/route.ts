import { route } from '@fal-ai/server-proxy/nextjs';

// Set FAL API key as environment variable
const FAL_KEY = process.env.FAL_KEY || 'c0f8883d-efa5-493c-bf2e-f9bce72fbd2b:acfe34d49294b5d6a14ac56ccead2a99';

// Export the route handlers
export const { GET, POST } = route;
