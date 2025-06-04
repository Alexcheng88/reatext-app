// src/pages/BatchResult.jsx 

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { translateText } from '../utils/helpers';
import { Copy, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ResultCard from '../components/ResultCard';


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
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 right-5 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        {t.batchResults || t.pdfResults}
      </h1>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {results.map((r) => (
          <ResultCard
            key={r.id}
            text={r.text}
            image={r.image}
            originalImage={r.originalImage}
            //onRetake={() => handleRetake(r.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default BatchResult;
