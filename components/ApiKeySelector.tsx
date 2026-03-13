import React from 'react';

interface ApiKeySelectorProps {
  onSelectKey: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onSelectKey }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-4 text-white">API Key Required</h2>
        <p className="text-gray-400 mb-6">
          To use the Veo video generation model, you need to select an API key. This application requires a project with billing enabled.
        </p>
        <button
          onClick={onSelectKey}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          Select API Key
        </button>
        <p className="text-xs text-gray-500 mt-4">
          By using this service, you agree to the associated costs. For more information, please visit the{" "}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            billing documentation
          </a>.
        </p>
      </div>
    </div>
  );
};
