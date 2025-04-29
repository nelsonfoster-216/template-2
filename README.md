# StardustStudio AI Image Generator

A high-resolution AI image generator built with Next.js, React, and TypeScript, leveraging the FAL.AI API to create stunning AI-generated images based on text prompts.

![StardustStudio AI Image Generator](https://images.unsplash.com/photo-1543722530-d2c3201371e7)

## 🌟 Features

- Generate high-quality, 8K resolution images from text prompts
- Create 4 unique variations for each prompt
- Modern, responsive UI with beautiful animations
- Download generated images with a single click
- Copy image URLs to clipboard
- Clean, minimalist interface focused on the creative experience

## 🛠️ Tech Stack

- **Frontend**:
  - [Next.js 14](https://nextjs.org/) with App Router
  - [React 18](https://reactjs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/) for styling

- **AI Integration**:
  - [FAL.AI](https://fal.ai/) for image generation (via fast-sdxl model)
  - [@fal-ai/client](https://www.npmjs.com/package/@fal-ai/client) for client-side API integration
  - [@fal-ai/server-proxy](https://www.npmjs.com/package/@fal-ai/server-proxy) for server-side proxy to FAL API

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── fal/
│   │   │   └── proxy/
│   │   │       └── route.ts      # FAL API proxy route
│   │   └── ...                   # Other API routes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Main page component
├── components/
│   ├── ImageGrid.tsx             # Grid display for generated images
│   ├── ImagePromptInput.tsx      # Text input for image prompts
│   ├── InfoButton.tsx            # Information button component
│   ├── LoadingIndicator.tsx      # Loading animation component
│   ├── Navbar.tsx                # Navigation bar component
│   └── ...                       # Other components
└── lib/
    ├── contexts/                 # React context providers
    ├── firebase/                 # Firebase configuration and utilities
    └── hooks/                    # Custom React hooks
```

## 🧩 Key Components

- **Main Page (`src/app/page.tsx`)**: Main application component that handles image generation and orchestrates the UI components.

- **ImagePromptInput**: A sleek input component that accepts user prompts for image generation.

- **ImageGrid**: Displays the generated images in a responsive grid with download and copy URL functionality.

- **LoadingIndicator**: Animated loading indicator that displays while images are being generated.

- **Navbar**: Navigation bar with the application title and links.

## 🚀 Image Generation Process

1. User enters a text prompt in the input field
2. The application sends the prompt to the FAL.AI API through a server proxy
3. The request is augmented with parameters for high-quality image generation:
   - Added "photorealistic, 8k resolution, cinematic lighting" to enhance quality
   - Negative prompts to avoid common issues like blurriness and distortion
   - Square HD format configuration
   - 25 inference steps for optimal quality
4. Four images are generated in parallel to provide variations
5. Results are displayed in the ImageGrid component with options to download or copy URLs

## 🔧 Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stardust-ai-image-generator.git
cd stardust-ai-image-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Create a `.env.local` file in the root directory with your FAL.AI API key:
```
FAL_KEY=your_fal_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 API Integration

The application uses the FAL.AI API for image generation through a Next.js API route that proxies requests. This approach keeps your API key secure by handling requests server-side while still allowing real-time image generation.

The proxy configuration is in `src/app/api/fal/proxy/route.ts` and uses the `@fal-ai/server-proxy` package.

## 📷 How to Use

1. Enter a descriptive prompt in the text input field (e.g., "a futuristic cityscape at sunset with flying cars")
2. Press Enter or click Submit to generate images
3. Wait for the generation process to complete (typically 10-30 seconds)
4. View, download, or copy the URLs of the generated images
5. Enter a new prompt to generate more images

## 🛣️ Future Enhancements

- User authentication for saving favorite images
- More generation options (resolution, aspect ratio, style presets)
- Image history to revisit previously generated images
- Share functionality for social media
- Additional AI model options

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Made with robots and soul by Nelson Foster, Co-Founder and CEO, Prokofa Solutions.

## 🙏 Acknowledgements

- [FAL.AI](https://fal.ai/) for their powerful image generation API
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Unsplash](https://unsplash.com/) for the background image