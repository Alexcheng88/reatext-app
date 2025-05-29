// src/pages/BatchResult.jsx 

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { translateText } from '../utils/helpers';
import { Copy, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BatchResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTheme();

  // 从 location.state 拿到 OCR 结果数组
  const results = Array.isArray(location.state?.results)
    ? location.state.results
    : null;

  // 如果没有 results，就返回首页
  if (!results) {
    navigate('/', { replace: true });
    return null;
  }

  // 缓存每页的翻译文案
  const [translations, setTranslations] = useState({});

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(t.copySuccess);
  };

  const handleTranslate = async (text, page) => {
    setTranslations(prev => ({ ...prev, [page]: t.translating }));
    try {
      const translated = await translateText(text);
      setTranslations(prev => ({ ...prev, [page]: translated }));
    } catch {
      setTranslations(prev => ({ ...prev, [page]: t.translationFailed }));
    }
  };

  return (
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900 relative">
      {/* 返回上一页 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 right-5 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        {t.pdfResults}
      </h1>

      {results.map((r) => (
        <div
          key={r.id}
          className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium text-gray-800 dark:text-gray-200">
            {t.pagePrefix}{r.pageNumber}{t.pageSuffix}
             </h2>
            <button
              onClick={() => handleCopy(r.text)}
              className="flex items-center text-blue-500 hover:underline"
            >
              <Copy size={16} className="mr-1" />{t.copyAll}
            </button>
          </div>

          <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 mb-2">
            {r.text}
          </pre>

          
           {/*
           <button
            onClick={() => handleTranslate(r.text, r.pageNumber)}
            className="text-green-500 hover:underline mb-2"
          >
            {t.translateText}
          </button>
          */}

          {translations[r.pageNumber] && (
            <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
              {translations[r.pageNumber]}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};

export default BatchResult;