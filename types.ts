export type AspectRatio = '16:9' | '9:16';

export interface VideoGenerationParams {
  prompt: string;
  base64Image: string;
  aspectRatio: AspectRatio;
  onProgress: (message: string) => void;
}
