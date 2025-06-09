// src/pages/CameraPage.jsx

import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, RotateCw, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Capacitor } from '@capacitor/core';
import {
  Camera as CapacitorCamera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';

const CameraPage = () => {
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTheme();
  const isNative = Capacitor.isNativePlatform();

  // Helper: 把 dataURL 按指定角度旋转，返回新的 dataURL
  const rotateDataUrl = (dataUrl, degrees) =>
    new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // 如果旋转 90° 或 270°，交换画布宽高
        if (degrees % 180 !== 0) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(canvas.toDataURL());
      };
      img.src = dataUrl;
    });

  const processPhoto = (dataUrl) => {
    navigate('/result', {
      state: {
        image: dataUrl,
        fromCamera: true,
        processingOptions: {}
      }
    });
  };

  const handleTakePhoto = async () => {
    if (isProcessing) return;
    if (isNative) {
      setIsProcessing(true);
      try {
        const photo = await CapacitorCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });
        setPreview(photo.dataUrl);
        setRotation(0);
      } catch (err) {
        console.error('拍照失败:', err);
        alert(t.cameraError || '拍照失败，请检查权限');
      } finally {
        setIsProcessing(false);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setRotation(0);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      alert(t.fileReadError || '读取文件失败');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    // 原生 App 启动时自动打开相机
    if (isNative) handleTakePhoto();
  }, [isNative]);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="p-4 flex items-center">
        <Link to="/" className="btn-icon text-white">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-white text-lg font-medium ml-4">
          {t.takePhoto}
        </h1>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center px-4">
        {/* 拍照/选图 按钮 */}
        {!preview && (
          <>
            <button
              onClick={handleTakePhoto}
              disabled={isProcessing}
              className="w-16 h-16 rounded-full bg-white shadow-camera flex items-center justify-center ripple transform transition-transform active:scale-95"
            >
              <div className="w-14 h-14 rounded-full border-2 border-gray-300" />
            </button>
            <p className="text-gray-400 text-sm mt-6">{t.keepStable}</p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 预览 & 控件 */}
        {preview && (
          <div className="w-full max-w-md">
            <div className="relative mb-6 fade-in">
              <img
                src={preview}
                alt={t.previewAlt}
                className="w-full h-64 object-contain rounded-xl"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              />
              {/* 清除 */}
              <button
                className="absolute bottom-4 right-4 btn-icon bg-white dark:bg-gray-700 shadow-md"
                onClick={() => {
                  setPreview(null);
                  setRotation(0);
                }}
              >
                <X size={20} />
              </button>
              {/* 旋转 */}
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
            <button
              onClick={() => processPhoto(preview)}
              disabled={isProcessing}
              className="w-full btn-primary mt-6"
            >
              {isProcessing ? t.recognizing : t.startRecognition}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraPage;
