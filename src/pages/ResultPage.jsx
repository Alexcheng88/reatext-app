// src/pages/ResultPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingAnimation from '../components/LoadingAnimation';
import ResultCard from '../components/ResultCard';
import {
  recognizeText,
  saveToHistory,
  applyImageProcessing,
} from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';

const ResultPage = () => {
  const { t } = useTheme();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { image, fromCamera = false, processingOptions = {} } = state || {};

  const [isLoading, setIsLoading] = useState(true);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState(null);
  const [processedImage, setProcessedImage] = useState('');

  useEffect(() => {
    if (!image) {
      navigate('/');
      return;
    }

    let didTimeout = false;
    let timeoutId;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1) 图像预处理
        const proc = await applyImageProcessing(image, processingOptions);
        setProcessedImage(proc);

        // 2) OCR + 10s 超时保护
        const ocrPromise = recognizeText(proc, processingOptions);
        timeoutId = setTimeout(() => {
          didTimeout = true;
          setIsLoading(false);
        }, 10000);

        const text = await ocrPromise;
        setRecognizedText(text);

        // 3) 一定要保存到历史（无论 fromCamera 还是 fromUpload）
        await saveToHistory(proc, text);
      } catch (e) {
        console.error('OCR 出错', e);
        setError(t.recognitionError);
      } finally {
        if (!didTimeout) {
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      }
    };

    // defer 一帧，提高首屏体验
    requestAnimationFrame(run);

    return () => clearTimeout(timeoutId);
  // 依赖加上 image，确保相机拍照后的 image 也会触发
  }, [image, processingOptions, t.recognitionError, navigate]);

  const handleRetake = () => {
    // 重拍或重新上传
    navigate(fromCamera ? '/camera' : '/upload');
  };

  if (!image) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex-grow flex flex-col pt-20 px-5">
        {isLoading ? (
          <LoadingAnimation />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button onClick={handleRetake} className="btn-primary">
              {t.retake}
            </button>
          </div>
        ) : (
          <div className="w-full py-8">
            <ResultCard
              text={recognizedText}
              image={processedImage || image}
              originalImage={image}
              onRetake={handleRetake}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
