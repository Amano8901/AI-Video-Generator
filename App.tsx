import React, { useState, useEffect, useCallback } from 'react';
import { ApiKeySelector } from './components/ApiKeySelector';
import { ControlPanel } from './components/ControlPanel';
import { LoadingIndicator } from './components/LoadingIndicator';
import { VideoResult } from './components/VideoResult';
import { generateVideo } from './services/geminiService';
import { type AspectRatio } from './types';
import { ORIGINAL_IMAGE_BASE64, LOADING_MESSAGES } from './constants';

const App: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  const [prompt, setPrompt] = useState('are they waving at us');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = useCallback(async () => {
    try {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    } catch (e) {
      console.error("Error checking for API key:", e);
      setApiKeySelected(false);
    } finally {
      setIsCheckingApiKey(false);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success after dialog opens to avoid race conditions
      setApiKeySelected(true); 
    } catch (e) {
      console.error("Error opening API key selection:", e);
      setError("Failed to open the API key selection dialog.");
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    let messageIndex = 0;

    const progressInterval = setInterval(() => {
      setLoadingMessage(LOADING_MESSAGES[messageIndex % LOADING_MESSAGES.length]);
      messageIndex++;
    }, 3000);

    const onProgress = (message: string) => {
      setLoadingMessage(message);
    };

    try {
      const videoUrl = await generateVideo({
        prompt,
        base64Image: ORIGINAL_IMAGE_BASE64,
        aspectRatio,
        onProgress,
      });
      setGeneratedVideoUrl(videoUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(errorMessage);
       if (errorMessage.includes("Requested entity was not found")) {
        setError("API key is invalid. Please select a valid key.");
        setApiKeySelected(false);
      } else {
        setError(`An error occurred: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      clearInterval(progressInterval);
      setLoadingMessage('');
    }
  };

  if (isCheckingApiKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-xl text-gray-400">Checking for API Key...</p>
      </div>
    );
  }

  if (!apiKeySelected) {
    return <ApiKeySelector onSelectKey={handleSelectKey} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            AI Video Generator
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Turn a static image into a dynamic video with a simple prompt.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-300">Original Image</h2>
            <div className="w-full max-w-lg rounded-lg overflow-hidden shadow-2xl shadow-purple-900/20">
               <img 
                 src={`data:image/jpeg;base64,${ORIGINAL_IMAGE_BASE64}`} 
                 alt="Three children sitting with balloons"
                 className="w-full h-auto object-contain"
               />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col space-y-6">
            <ControlPanel
              prompt={prompt}
              setPrompt={setPrompt}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              onGenerate={handleGenerateVideo}
              isLoading={isLoading}
            />
            
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="flex-grow flex items-center justify-center bg-black/30 rounded-md min-h-[300px]">
              {isLoading ? (
                <LoadingIndicator message={loadingMessage} />
              ) : generatedVideoUrl ? (
                <VideoResult videoUrl={generatedVideoUrl} />
              ) : (
                 <div className="text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.55a2.5 2.5 0 010 4L15 18M3 8a2 2 0 012-2h4.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H17a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                  <p className="mt-2">Your generated video will appear here</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
