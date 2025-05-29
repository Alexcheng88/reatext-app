import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Upload, Loader, Check, FileText } from 'lucide-react';
import {
  recognizeText,
  extractAllPdfPages,
  resizeAndCompress,
  saveToHistory
} from '../utils/helpers';
import ImageProcessingOptions from './ImageProcessingOptions';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const BatchUpload = ({
  initialPages = null,   // PDF 每页的 DataURL 数组
  autoStart = false,     // 选中 PDF 后是否自动开始 OCR
  onComplete            // 识别完成回调
}) => {
  const { t } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);
  const [processingStatus, setProcessingStatus] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [processingOptions, setProcessingOptions] = useState({
    contrast: 1.2,
    brightness: 5,
    sharpness: 0,
    denoise: false,
    autoRotate: true,
  });

  // 用来去重同一次 OCR 流程中的保存
  const savedIdsRef = useRef(new Set());

  // 1) initialPages 变化时（PDF 模式），填充 images 并自动启动 OCR
  useEffect(() => {
    if (initialPages && initialPages.length) {
      const pdfImgs = initialPages.map((url, idx) => ({
        id: `pdf-page-${Date.now()}-${idx}`,
        preview: url,
        isPdfPage: true,
        pageNumber: idx + 1
      }));
      setImages(pdfImgs);
      if (autoStart) {
        // 延迟确保 images 已设置
        setTimeout(() => runOcr(pdfImgs), 0);
      }
    }
  }, [initialPages, autoStart]);

  // 2) 从 location.state 传入的 pdfFile 处理，不重复 OCR
  useEffect(() => {
    if (initialPages && initialPages.length) return;
    const { pdfFile, processingOptions: opts } = location.state || {};
    if (!pdfFile) return;

    setIsPdfProcessing(true);
    (async () => {
      try {
        const pages = await extractAllPdfPages(pdfFile);
        const pdfImgs = pages.map((url, idx) => ({
          id: `pdf-page-${Date.now()}-${idx}`,
          preview: url,
          isPdfPage: true,
          pageNumber: idx + 1
        }));
        setImages(pdfImgs);
        if (opts) setProcessingOptions(opts);
      } catch (err) {
        console.error('PDF 处理失败:', err);
        alert(t.pdfProcessFail);
      } finally {
        setIsPdfProcessing(false);
      }
    })();
  }, [location.state, initialPages, t.pdfProcessFail]);

  // OCR 主流程
  const runOcr = async (imgs) => {
    setIsUploading(true);
    setResults([]);
    setProcessingStatus(imgs.map(img => ({ id: img.id, status: 'pending' })));

    savedIdsRef.current.clear();
    const collected = [];

    for (const img of imgs) {
      setProcessingStatus(ps =>
        ps.map(s => s.id === img.id ? { ...s, status: 'processing' } : s)
      );

      let text = '识别失败';
      try {
        // 预处理 & OCR
        const compressed = await resizeAndCompress(img.preview, { maxWidth: 1000, quality: 0.8 });
        text = await recognizeText(compressed, { ...processingOptions, fileType: 'image/png' });

        // 保存历史（防重复）
        if (!savedIdsRef.current.has(img.id)) {
          await saveToHistory(compressed, text);
          savedIdsRef.current.add(img.id);
        }

        setProcessingStatus(ps =>
          ps.map(s => s.id === img.id ? { ...s, status: 'success' } : s)
        );
      } catch (err) {
        console.error(`第 ${img.pageNumber} 页识别失败:`, err);
        setProcessingStatus(ps =>
          ps.map(s => s.id === img.id ? { ...s, status: 'error' } : s)
        );
      }

      collected.push({
        id: img.id,
        image: img.preview,
        originalImage: img.preview,
        text,
        isPdfPage: img.isPdfPage || false,
        pageNumber: img.pageNumber
      });
      setResults([...collected]);
    }

    setIsUploading(false);
    onComplete?.(collected);

    if (autoStart) {
      navigate('/batchResult', { state: { results: collected } });
    }
  };

  // 手动添加本地图片
  const handleFileSelect = e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImgs = files.map(file => ({
      id: Date.now() + Math.random().toString(36).slice(2),
      preview: URL.createObjectURL(file)
    }));
    setImages(imgs => [...imgs, ...newImgs]);
  };

  const removeImage = id => {
    if (isUploading) return;
    setImages(imgs => imgs.filter(img => img.id !== id));
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'processing': return <Loader size={16} className="animate-spin text-blue-500" />;
      case 'success':    return <Check  size={16} className="text-green-500" />;
      case 'error':      return <X      size={16} className="text-red-500" />;
      default:           return null;
    }
  };

  // PDF 自动模式仅加载动画
  if (initialPages && autoStart) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader className="animate-spin text-blue-500 mr-2" />
        <span>{t.recognizingPdf}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 !pt-[94px] !pb-[94px]">
        <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-200">{t.batchRecognition}</h3>

        {isPdfProcessing ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center">
              <div className="loading-wave"><div/><div/><div/><div/><div/></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">{t.processingPdf}</p>
            </div>
          </div>
        ) : (
          <>
            <ImageProcessingOptions onOptionsChange={setProcessingOptions} />

            <div className="grid grid-cols-3 gap-3 mb-5">
              {images.map((img, idx) => (
                <div key={img.id} className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img src={img.preview} alt={`上传图片 ${idx+1}`} className="w-full h-full object-cover" />
                  {img.isPdfPage && (
                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <FileText size={10} className="mr-1" />
                      <span>{t.page} {img.pageNumber}</span>
                    </div>
                  )}
                  <button onClick={() => removeImage(img.id)} disabled={isUploading} className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 text-white rounded-full">
                    <X size={14} />
                  </button>
                  {processingStatus.find(s => s.id === img.id)?.status && (
                    <div className="absolute bottom-1 right-1">
                      {getStatusIcon(processingStatus.find(s => s.id === img.id).status)}
                    </div>
                  )}
                </div>
              ))}

              {images.length < 9 && (
                <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 ${isUploading ? 'opacity-50 cursor-not-allowed':''}`}>
                  <Plus size={24} className="text-blue-400 dark:text-blue-500 mb-1" />
                  <span className="text-xs">{t.addImage}</span>
                </button>
              )}
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple className="hidden" disabled={isUploading} />

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{images.length>0 ? t.imagesSelected.replace('{count}', images.length)+(isUploading?`，${t.processing}`:'') : t.selectImagesInfo}</p>
              <button onClick={() => runOcr(images)} disabled={!images.length||isUploading} className={`btn-primary flex items-center gap-2 ${(!images.length||isUploading)?'opacity-50 cursor-not-allowed':''}`}>                {isUploading ? (<><Loader size={18} className="animate-spin" /><span>{t.recognizing}</span></>) : (<><Upload size={18} /><span>{t.batchRecognition}</span></>)}              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BatchUpload;
