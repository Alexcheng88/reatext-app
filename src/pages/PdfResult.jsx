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
        {results.map(r => (
          <div
            key={r.id}
            className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            {/* 页眉：页码 + 操作按钮 */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {`${t.pagePrefix}${r.pageNumber}${t.pageSuffix}`}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(r.text)}
                  className="text-blue-500 hover:text-blue-700"
                  title={t.copyAll}
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleTranslate(r.text, r.pageNumber)}
                  className="text-green-500 hover:text-green-700 text-sm"
                >
                  {t.translateText}
                </button>
              </div>
            </div>

            {/* 文本内容区，可滚动 */}
            <div className="flex-1 overflow-auto mb-4">
              <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                {r.text}
              </pre>
            </div>

            {/* 翻译结果 */}
            {translations[r.pageNumber] && (
              <div className="mt-auto bg-gray-100 dark:bg-gray-700 p-3 rounded">
                <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                  {translations[r.pageNumber]}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PdfResult;
