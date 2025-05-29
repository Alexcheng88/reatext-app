
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const LoadingAnimation = () => {
  const { t } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <img 
        src="/images/loading-dark.png"
        alt="OCR"
        className="w-32 h-32 mb-8 rounded-full shadow-md"
      />
      <div className="loading-wave">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="mt-6 text-gray-600 font-medium">{t.recognizing}</p>
    </div>
  );
};

export default LoadingAnimation;
  