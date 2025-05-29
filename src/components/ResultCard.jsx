
import React, { useState } from 'react';
import { Copy, Camera, Edit2, Globe } from 'lucide-react';
import TranslationModal from './TranslationModal';
import { useTheme } from '../context/ThemeContext';

const ResultCard = ({ text, image, originalImage, onRetake }) => {
  const [showCopied, setShowCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showOriginalImage, setShowOriginalImage] = useState(false);
  const { isOnline, t } = useTheme();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(isEditing ? editedText : text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleEdit = () => {
    if (isEditing) {
      // 保存编辑
      setIsEditing(false);
    } else {
      // 开始编辑
      setIsEditing(true);
      setEditedText(text);
    }
  };
  
  const handleTranslate = () => {
    setShowTranslationModal(true);
  };

  const toggleImageView = () => {
    if (originalImage && image !== originalImage) {
      setShowOriginalImage(!showOriginalImage);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto fade-in">
      {image && (
        <div className="mb-5 relative">
          <img 
            src={showOriginalImage ? originalImage : image} 
            alt="识别图片" 
            className="w-full h-48 object-cover rounded-xl shadow-sm cursor-pointer"
            onClick={toggleImageView}
          />
          {originalImage && image !== originalImage && (
            <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {showOriginalImage ? "原始图像" : "优化图像"}
            </div>
          )}
        </div>
      )}
      
      <div className="result-card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{t.recognitionResult}</h3>
          {!isOnline && (
            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs px-2 py-1 rounded-full flex items-center">
              {t.networkOffline}
            </span>
          )}
        </div>
        
        {isEditing ? (
          <textarea 
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-32 mb-4 text-gray-800 dark:text-gray-200 w-full border border-blue-200 dark:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={6}
          />
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-32 mb-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {text}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <button 
            onClick={copyToClipboard}
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
          */}
          
          <button 
            onClick={onRetake}
            className="btn-secondary flex-1 flex items-center justify-center space-x-2 ripple"
          >
            <Camera size={18} />
            <span>{t.retake}</span>
          </button>
          
          <button 
            onClick={handleEdit}
            className="btn-secondary flex-1 flex items-center justify-center space-x-2 ripple"
          >
            <Edit2 size={18} />
            <span>{isEditing ? t.save : t.editText}</span>
          </button>
        </div>
      </div>
      
      {showCopied && (
        <div className="copied-message">
          {t.copied}
        </div>
      )}

      <TranslationModal 
        isOpen={showTranslationModal}
        onClose={() => setShowTranslationModal(false)}
        textToTranslate={isEditing ? editedText : text}
      />
    </div>
  );
};

export default ResultCard;
  