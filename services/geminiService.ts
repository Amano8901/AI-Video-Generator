import { GoogleGenAI } from "@google/genai";
import { type VideoGenerationParams, type AspectRatio } from '../types';

// Fix: Define the AIStudio interface to resolve TypeScript declaration errors.
// The error message "Property 'aistudio' must be of type 'AIStudio'" indicates
// that a named type is expected for the global window.aistudio property.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    // Fix: Use the AIStudio interface for window.aistudio to match the expected type.
    aistudio: AIStudio;
  }
}

// Helper function to wait
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateVideo = async ({
  prompt,
  base64Image,
  aspectRatio,
  onProgress,
}: VideoGenerationParams): Promise<string> => {

  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please select an API key.");
  }

  // Create a new instance right before the call to ensure the latest key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  onProgress("Initiating video generation...");

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: base64Image,
      mimeType: 'image/jpeg',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    }
  });

  onProgress("Processing request... This may take a few minutes.");
  let checks = 0;

  while (!operation.done) {
    await sleep(10000); // Wait for 10 seconds before checking again
    checks++;
    onProgress(`Checking status (attempt ${checks})...`);
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  onProgress("Video generated! Fetching data...");

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error("Video generation completed, but no download link was found.");
  }

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) {
    throw new Error(`Failed to download video. Status: ${response.statusText}`);
  }
  
  onProgress("Download complete. Creating video URL...");
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};