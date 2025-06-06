// src/components/BatchResults.jsx

import React, { useState, useEffect } from 'react';
import {
  Copy,
  ArrowLeft,
  ArrowRight,
  Globe,
  FileText,
  Edit2
} from 'lucide-react';
import TranslationModal from './TranslationModal';
import { useTheme } from '../context/ThemeContext';

const BatchResults = ({ results, onBack }) => {
  const { t } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCopied, setShowCopied] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showOriginalImage, setShowOriginalImage] = useState(false);

  // 维护每条结果的编辑状态和当前文本
  const [editedTexts, setEditedTexts] = useState(results.map((r) => r.text));
  const [isEditingArray, setIsEditingArray] = useState(results.map(() => false));

  // 当 results 更新时，重新初始化
  useEffect(() => {
    setEditedTexts(results.map((r) => r.text));
    setIsEditingArray(results.map(() => false));
    setCurrentIndex(0);
    setShowOriginalImage(false);
    setShowTranslationModal(false);
    setShowCopied(false);
  }, [results]);

  const currentResult = results[currentIndex];
  const currentEditedText = editedTexts[currentIndex];
  const isEditing = isEditingArray[currentIndex];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentEditedText);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const goToNext = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowOriginalImage(false);
      setShowCopied(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowOriginalImage(false);
      setShowCopied(false);
    }
  };

  const handleTranslate = () => {
    setShowTranslationModal(true);
  };

  const toggleImageView = () => {
    if (
      currentResult.originalImage &&
      currentResult.image !== currentResult.originalImage
    ) {
      setShowOriginalImage(!showOriginalImage);
    }
  };

  // 点击“Edit Text”按钮时切换编辑模式
  const toggleEditMode = () => {
    const newIsEditingArray = [...isEditingArray];
    newIsEditingArray[currentIndex] = !newIsEditingArray[currentIndex];
    setIsEditingArray(newIsEditingArray);
  };

  // 文本框内容变化时
  const handleTextChange = (e) => {
    const newEditedTexts = [...editedTexts];
    newEditedTexts[currentIndex] = e.target.value;
    setEditedTexts(newEditedTexts);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 fade-in">
        {/* 顶部标题和翻页按钮 */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
            {t.batchResults} ({currentIndex + 1}/{results.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className={`btn-icon ${
                currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex === results.length - 1}
              className={`btn-icon ${
                currentIndex === results.length - 1
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {currentResult && (
          <>
            {/* 图片显示区 */}
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
                  <span>
                    {t.pdfPage} {currentResult.pageNumber}
                  </span>
                </div>
              )}
              {currentResult.originalImage &&
                currentResult.image !== currentResult.originalImage && (
                  <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {showOriginalImage ? t.originalImageLabel : t.optimizedImageLabel}
                  </div>
                )}
            </div>

            {/* 文本展示或编辑区 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-32 mb-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {isEditing ? (
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700"
                  rows={4}
                  value={currentEditedText}
                  onChange={handleTextChange}
                />
              ) : (
                <p className="whitespace-pre-wrap">{currentEditedText}</p>
              )}
            </div>

            {/* 按钮区：Copy 和 Edit Text */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={copyToClipboard}
                className="btn-primary flex-1 flex items-center justify-center space-x-2 ripple"
              >
                <Copy size={18} />
                <span>{t.copyAll}</span>
              </button>

              <button
                onClick={toggleEditMode}
                className="flex-1 flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded px-4 py-2"
              >
                <Edit2 size={18} />
                <span>Edit Text</span>
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

      {/* 复制后提示信息 */}
      {showCopied && (
        <div className="copied-message">
          {t.copied}
        </div>
      )}

      {/* 翻译弹窗 */}
      <TranslationModal
        isOpen={showTranslationModal}
        onClose={() => setShowTranslationModal(false)}
        textToTranslate={currentEditedText || ''}
      />
    </div>
  );
};

export default BatchResults;
