// src/pages/HomePage.jsx

import React, { useState, useRef } from 'react'; 
import Navbar from '../components/Navbar';
import CameraButton from '../components/CameraButton';
import BatchUpload from '../components/BatchUpload';
import { History, GridIcon, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { extractAllPdfPages } from '../utils/helpers';

const HomePage = () => {
  const { isOnline, t } = useTheme();
  const fileInputRef = useRef(null);

  // null: 尚未选过 PDF；[] 或 >0 数组：已选过
  const [pdfPages, setPdfPages] = useState(null);
  const [pdfResults, setPdfResults] = useState([]);

  const handleIconClick = () => fileInputRef.current?.click();

  const handlePdfSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const pages = await extractAllPdfPages(file);
      setPdfPages(pages);
      // 清空上一次结果
      setPdfResults([]);
    } catch (err) {
      console.error('PDF 提取失败：', err);
      alert('无法处理该 PDF，请检查文件或重试');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow flex flex-col justify-center items-center px-5 pt-20">
        <div className="page-transition text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {t.appName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            {t.tagline}
          </p>
        </div>

        <CameraButton />

        {/* 按钮区：批量识别 / 历史 / PDF 识别 */}
        <div className="mt-12 grid grid-cols-3 gap-4 w-full max-w-sm">
          <Link
            to="/batch"
            className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <GridIcon className="h-7 w-7 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.batchRecognition}
            </span>
          </Link>

          <Link
            to="/history"
            className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <History className="h-7 w-7 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.history}
            </span>
          </Link>

          <button
            onClick={handleIconClick}
            className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <Globe className="h-7 w-7 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.translation}
            </span>
          </button>
        </div>

        {/* 隐藏的 PDF 文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handlePdfSelect}
        />

        {/* 如果选中了 PDF，显示 BatchUpload 并自动开始 */}
        {pdfPages?.length > 0 && (
          <div className="w-full max-w-2xl mx-auto mt-8">
            <BatchUpload
              initialPages={pdfPages}
              autoStart
              onComplete={setPdfResults}
            />
          </div>
        )}

        {/* 显示 OCR 结果 */}
        {pdfResults.length > 0 && (
          <div className="w-full max-w-2xl mx-auto mt-6">
            <h2 className="text-xl font-semibold mb-4">PDF 识别结果</h2>
            {pdfResults.map(r => (
              <div
                key={r.id}
                className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                <h3 className="font-medium mb-2">第 {r.pageNumber} 页：</h3>
                <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                  {r.text}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* 页面底部说明 */}
        <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{t.supportInfo}</p>
          <p className="mt-2 text-blue-500 dark:text-blue-400">
            {t.newFeature}
          </p>
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>{t.copyright}</p>
        <div className="flex justify-center mt-3 space-x-4">
          <a href="#" className="hover:text-blue-500">
            {t.privacyPolicy}
          </a>
          <a href="#" className="hover:text-blue-500">
            {t.termsConditions}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
