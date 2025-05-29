
import React, { useState, useEffect } from 'react';
import { X, Check, Loader, Globe, Copy, ChevronDown } from 'lucide-react';
import { translateText } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';

const TranslationModal = ({ isOpen, onClose, textToTranslate }) => {
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [error, setError] = useState(null);
  const [showCopied, setShowCopied] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);
  const { isOnline, currentLanguage, t } = useTheme();
  
  const languages = [
    { code: 'zh', name: currentLanguage === 'zh' ? '中文' : 'Chinese', flag: 'https://heyboss.heeyo.ai/1745301775-b49acabc-upload.wikimedia.org-wikipedia-commons-thumb-9-97-Chineselanguage.svg-1200px-Chineselanguage.svg.png' },
    { code: 'en', name: currentLanguage === 'zh' ? '英文' : 'English', flag: 'https://images.unsplash.com/photo-1526470498-9ae73c665de8?q=80&w=120' },
    { code: 'ja', name: currentLanguage === 'zh' ? '日文' : 'Japanese', flag: 'https://images.unsplash.com/photo-1624593895161-c2d67791ef7a?q=80&w=120' },
    { code: 'ko', name: currentLanguage === 'zh' ? '韩文' : 'Korean', flag: 'https://images.unsplash.com/photo-1597585213703-e1bd31263208?q=80&w=120' },
    { code: 'ms', name: currentLanguage === 'zh' ? '马来语' : 'Malay', flag: 'https://heyboss.heeyo.ai/1745301775-7f2b047c-p3-sdbk2-media.byteimg.com-tos-cn-i-xv4ileqgde-7fa12fa434db4104af2c237f640f8c7d-tplv-xv4ileqgde-resize-w-750.image' },
    { code: 'fr', name: currentLanguage === 'zh' ? '法文' : 'French', flag: 'https://images.unsplash.com/photo-1560269507-c4e807b98aa3?q=80&w=120' },
    { code: 'de', name: currentLanguage === 'zh' ? '德文' : 'German', flag: 'https://images.unsplash.com/photo-1527866512907-a76fb7a45595?q=80&w=120' },
    { code: 'es', name: currentLanguage === 'zh' ? '西班牙文' : 'Spanish', flag: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=120' },
    { code: 'ru', name: currentLanguage === 'zh' ? '俄文' : 'Russian', flag: 'https://images.unsplash.com/photo-1530530824905-661c730523c5?q=80&w=120' }
  ];
  
  useEffect(() => {
    if (isOpen && textToTranslate && !showLanguageSelector) {
      translateTextWithAPI();
    }
  }, [isOpen, textToTranslate, targetLanguage, showLanguageSelector]);
  
  const translateTextWithAPI = async () => {
    if (!textToTranslate) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await translateText(textToTranslate, targetLanguage);
      setTranslatedText(result);
    } catch (err) {
      console.error('翻译错误:', err);
      setError(currentLanguage === 'zh' ? '翻译服务暂时不可用，请稍后再试' : 'Translation service is temporarily unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getLanguageName = (code) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : (currentLanguage === 'zh' ? '英文' : 'English');
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };
  
  const handleLanguageSelect = (code) => {
    setTargetLanguage(code);
    setShowLanguageSelector(false);
  };
  
  const handleBackToLanguageSelect = () => {
    setShowLanguageSelector(true);
    setTranslatedText('');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden fade-in">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <div className="flex items-center">
            <Globe size={20} className="text-blue-500 mr-2" />
            <h3 className="text-lg font-medium">{showLanguageSelector ? t.selectTargetLanguage : t.translateText}</h3>
          </div>
          <button 
            onClick={onClose}
            className="btn-icon"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {showLanguageSelector ? (
            <div className="language-selection">
              <div className="mb-3">
                <p className="text-gray-600 dark:text-gray-400 mb-3">{t.selectTargetLanguage}:</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {languages.map(lang => (
                    <div 
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-all language-option"
                    >
                      <div className="w-8 h-6 mr-3 overflow-hidden rounded-sm flex-shrink-0">
                        <img 
                          src={lang.flag} 
                          alt={lang.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium">{lang.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-5 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">{t.originalText}</p>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 max-h-[150px] overflow-y-auto">
                  <div className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">
                    {textToTranslate}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <button 
                  onClick={handleBackToLanguageSelect}
                  className="flex items-center text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <ChevronDown size={16} className="transform rotate-90 mr-1" />
                  <span>{t.changeLanguage}</span>
                </button>
                <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                  <div className="w-5 h-4 mr-2 overflow-hidden rounded-sm">
                    <img 
                      src={languages.find(l => l.code === targetLanguage)?.flag} 
                      alt={getLanguageName(targetLanguage)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">{getLanguageName(targetLanguage)}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.originalText}
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 min-h-[80px] max-h-[120px] overflow-y-auto text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">
                  {textToTranslate}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.translationResult}
                  </label>
                  {isLoading && (
                    <span className="text-xs text-blue-500 flex items-center">
                      <Loader size={12} className="animate-spin mr-1" />
                      {t.translating}
                    </span>
                  )}
                </div>
                
                {error ? (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 min-h-[120px] max-h-[200px] overflow-y-auto text-gray-800 dark:text-gray-200 whitespace-pre-wrap relative">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-24">
                        <div className="loading-wave scale-75">
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                      </div>
                    ) : translatedText ? (
                      <>
                        {translatedText}
                        <button 
                          onClick={copyToClipboard}
                          className="absolute bottom-2 right-2 btn-icon bg-white dark:bg-gray-700 shadow-sm hover:shadow"
                          title={currentLanguage === 'zh' ? '复制翻译结果' : 'Copy translation'}
                        >
                          <Copy size={16} />
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">{t.resultWillShowHere}</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="border-t dark:border-gray-700 p-4 flex justify-end">
          {showLanguageSelector ? (
            <button 
              onClick={onClose}
              className="btn-secondary"
            >
              {t.cancel}
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="btn-secondary"
            >
              {t.close}
            </button>
          )}
        </div>
      </div>
      
      {showCopied && (
        <div className="copied-message">
          {t.resultCopied}
        </div>
      )}
    </div>
  );
};

export default TranslationModal;
  