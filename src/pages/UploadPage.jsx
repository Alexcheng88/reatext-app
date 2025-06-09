// src/pages/UploadPage.jsx （上传图片）

import React, { useState, useRef } from 'react';
import { ArrowLeft, FileType, X, RotateCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ImageProcessingOptions from '../components/ImageProcessingOptions';
import { useTheme } from '../context/ThemeContext';
import {
  extractAllPdfPages,
  resizeAndCompress,
  recognizeText,
  saveToHistory
} from '../utils/helpers';

const ImageIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const UploadPage = () => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingOptions, setProcessingOptions] = useState({
    contrast: 1.2,
    brightness: 5,
    sharpness: 0,
    denoise: false,
    autoRotate: true,
  });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTheme();

  // Helper: 把 dataURL 按指定角度旋转，返回新的 dataURL
  const rotateDataUrl = (dataUrl, degrees) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // 如果旋转 90 或 270 度，则交换画布宽高
        if (degrees % 180 !== 0) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        // 平移到中心并旋转
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(canvas.toDataURL());
      };
      img.src = dataUrl;
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // PDF 立即识别逻辑不变...
    if (file.type === 'application/pdf') {
      setIsProcessing(true);
      try {
        const pages = await extractAllPdfPages(file);
        const results = [];
        for (let idx = 0; idx < pages.length; idx++) {
          const pageDataUrl = pages[idx];
          const compressed = await resizeAndCompress(pageDataUrl, {
            maxWidth: 1000,
            quality: 0.8
          });
          const text = await recognizeText(compressed, {
            ...processingOptions,
            fileType: 'application/pdf'
          });
          await saveToHistory(compressed, text);
          results.push({
            id: `pdf-${idx + 1}`,
            image: compressed,
            originalImage: pageDataUrl,
            text,
            isPdfPage: true,
            pageNumber: idx + 1
          });
        }
        navigate('/batchResult', { state: { results } });
      } catch (err) {
        console.error(t.pdfProcessingError, err);
        alert(t.pdfProcessingError);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // 图片逻辑：读取 dataURL，设置 preview
    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert(t.selectFileAlert);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || isProcessing) return;
    // 传给下一个页面的就是 preview，所以会用到旋转后的图像
    navigate('/result', {
      state: {
        image: preview,
        fromCamera: false,
        processingOptions: {
          ...processingOptions,
          fileType: selectedFile.type
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <div className="navbar p-4 flex items-center">
        <Link to="/" className="btn-icon"><ArrowLeft size={24} /></Link>
        <h1 className="text-gray-800 dark:text-gray-200 text-lg font-medium ml-4">
          {t.uploadImage}
        </h1>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center p-5">
        <div className="w-full max-w-md">
          <ImageProcessingOptions onOptionsChange={setProcessingOptions} />

          {preview ? (
            <div className="relative mb-6 fade-in">
              <img
                src={preview}
                alt={t.previewAlt}
                className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800 rounded-xl"
              />
              {/* 清除按钮 */}
              <button
                className="absolute bottom-4 right-4 btn-icon bg-white dark:bg-gray-700 shadow-md"
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                }}
              >
                <X size={20} />
              </button>
              {/* 旋转按钮：更新 preview 为旋转后新的 dataURL */}
              <button
                className="absolute top-4 right-4 btn-icon bg-white dark:bg-gray-700 shadow-md"
                onClick={async () => {
                  const rotated = await rotateDataUrl(preview, 90);
                  setPreview(rotated);
                }}
              >
                <RotateCw size={20} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 border-2 border-dashed border-blue-300 bg-blue-50 \
dark:bg-blue-900/10 dark:border-blue-700 rounded-xl flex flex-col justify-center items-center \
cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors fade-in"
            >
              <ImageIcon size={48} className="text-blue-400 mb-2" />
              <p className="text-blue-600 dark:text-blue-400 mb-1 font-medium">
                {t.clickToSelect}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                {t.supportFormats} <FileType size={12} className="ml-2 mr-1" />
              </p>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf"
            className="hidden"
            disabled={isProcessing}
          />

          {preview && (
            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className="w-full btn-primary mt-6"
            >
              {isProcessing ? t.recognizing : t.startRecognition}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
