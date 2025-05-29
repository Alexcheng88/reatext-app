// src/components/ImageProcessingOptions.jsx

import React, { useState } from 'react';
import { Sliders, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ImageProcessingOptions = ({ onOptionsChange }) => {
  const { t } = useTheme();
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    contrast: 1.2,
    brightness: 5,
    sharpness: 0,
    denoise: false,
    autoRotate: true
  });

  const handleOptionChange = (option, value) => {
    const newOptions = { ...options, [option]: value };
    setOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const resetDefaults = () => {
    const defaultOptions = {
      contrast: 1.2,
      brightness: 5,
      sharpness: 0,
      denoise: false,
      autoRotate: true
    };
    setOptions(defaultOptions);
    onOptionsChange(defaultOptions);
  };

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium"
        >
          <Sliders size={16} className="mr-2" />
          <span>{t.preprocessingOptions}</span>
          <svg
            className={`w-4 h-4 ml-1 transform transition-transform ${showOptions ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showOptions && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 zoom-in">
          {/* 批量识别提示 */}
          <p className="text-sm mb-4">{t.batchHint}</p>

          <div className="space-y-3">
            {/* 对比度 */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t.contrast}
                </label>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {options.contrast.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.8"
                step="0.1"
                value={options.contrast}
                onChange={e => handleOptionChange('contrast', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            {/* 亮度 */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t.brightness}
                </label>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {options.brightness}
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="1"
                value={options.brightness}
                onChange={e => handleOptionChange('brightness', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            {/* 锐化 */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {t.sharpness}
                </label>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {options.sharpness}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={options.sharpness}
                onChange={e => handleOptionChange('sharpness', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            {/* 降噪 & 自动旋转 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="denoise"
                  checked={options.denoise}
                  onChange={e => handleOptionChange('denoise', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="denoise" className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  {t.denoise}
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRotate"
                  checked={options.autoRotate}
                  onChange={e => handleOptionChange('autoRotate', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="autoRotate" className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  {t.autoRotate}
                </label>
              </div>
            </div>

            {/* 重置按钮 */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={resetDefaults}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                <RefreshCw size={12} className="mr-1" />
                {t.resetDefaults}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageProcessingOptions;
