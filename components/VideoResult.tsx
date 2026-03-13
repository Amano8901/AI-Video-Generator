import React from 'react';

interface VideoResultProps {
  videoUrl: string;
}

export const VideoResult: React.FC<VideoResultProps> = ({ videoUrl }) => {
  return (
    <div className="w-full h-full p-2">
      <video
        key={videoUrl}
        controls
        autoPlay
        loop
        className="w-full h-full object-contain rounded-md"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
