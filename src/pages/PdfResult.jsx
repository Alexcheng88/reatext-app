// src/pages/PdfResult.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { translateText } from '../utils/helpers';

const PdfResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTheme();

  // 从 location.state 拿到 PDF 识别结果数组
  // 每一项 { id, pageNumber, text }
  const results = Array.isArray(location.state?.results)
    ? location.state.results
    : null;

  if (!results) {
    // 如果没有结果，跳回首页
    navigate('/', { replace: true });
    return null;
  }

  // 存储每页的翻译结果
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
    <div className="min-h-screen p-5 bg-gray-50 dark:bg-gray-900">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 right-5 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        {t.pdfResults}
      </h1>

      {/* 网格布局：1-3 列自适应 */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {results.map((r) => (
          <ResultCard
            key={r.id}
            text={r.text}
            // PDF 情况下，没有图片，也无需 onRetake
            // image 和 originalImage 不传，ResultCard 会跳过展示图片部分
            // onRetake 不传，就不渲染「重拍/重选」按钮
          />
        ))}
      </div>
    </div>
  );
};

export default PdfResult;
