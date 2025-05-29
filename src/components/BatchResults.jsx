// src/components/BatchResults.jsx

import React, { useState } from 'react';
import { Copy, ArrowLeft, ArrowRight, Globe, FileText } from 'lucide-react';
import TranslationModal from './TranslationModal';
import { useTheme } from '../context/ThemeContext';

const BatchResults = ({ results, onBack }) => {
  const { t } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCopied, setShowCopied] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showOriginalImage, setShowOriginalImage] = useState(false);
  
  const currentResult = results[currentIndex];
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };
  
  const goToNext = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleTranslate = () => {
    setShowTranslationModal(true);
  };

  const toggleImageView = () => {
    if (currentResult.originalImage && currentResult.image !== currentResult.originalImage) {
      setShowOriginalImage(!showOriginalImage);
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
            {t.batchResults} ({currentIndex + 1}/{results.length})
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className={`btn-icon ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={goToNext}
              disabled={currentIndex === results.length - 1}
              className={`btn-icon ${currentIndex === results.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        
        {currentResult && (
          <>
            <div className="mb-4 relative">
              <img 
                src={showOriginalImage ? currentResult.originalImage : currentResult.image} 
                alt={t.resultImageAlt} 
                className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer"
                onClick={toggleImageView}
              />
              {currentResult.isPdfPage && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <FileText size={12} className="mr-1" />
                  <span>{t.pdfPage} {currentResult.pageNumber}</span>
                </div>
              )}
              {currentResult.originalImage && currentResult.image !== currentResult.originalImage && (
                <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {showOriginalImage ? t.originalImageLabel : t.optimizedImageLabel}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-32 mb-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {currentResult.text}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => copyToClipboard(currentResult.text)}
                className="btn-primary flex-1 flex items-center justify-center space-x-2 ripple"
              >
                <Copy size={18} />
                <span>{t.copyAll}</span>
              </button>
              
              {/*
              <button 
                onClick={handleTranslate}
                className="btn-primary flex-1 flex items-center justify-center space-x-2 ripple"
              >
                <Globe size={18} />
                <span>{t.translateText}</span>
              </button>
              
              <button 
                onClick={onBack}
                className="btn-secondary flex-1"
              >
                {t.backToUpload}
              </button>
               */}
            </div>
          </>
        )}
      </div>
      
      {showCopied && (
        <div className="copied-message">
          {t.copied}
        </div>
      )}
      
      <TranslationModal 
        isOpen={showTranslationModal}
        onClose={() => setShowTranslationModal(false)}
        textToTranslate={currentResult?.text || ''}
      />
    </div>
  );
};

export default BatchResults;
