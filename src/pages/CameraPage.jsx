import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Capacitor } from '@capacitor/core';
import {
  Camera as CapacitorCamera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';

const CameraPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTheme();
  const isNative = Capacitor.isNativePlatform();

  const processPhoto = (dataUrl) => {
    navigate('/result', {
      state: {
        image: dataUrl,
        fromCamera: true,
        processingOptions: {}  // 如需传入默认处理参数，可在这里设置
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
        processPhoto(photo.dataUrl);
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
    reader.onload = () => processPhoto(reader.result);
    reader.onerror = () => {
      alert(t.fileReadError || '读取文件失败');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  // 原生 App 下自动打开相机
  useEffect(() => {
    if (isNative) handleTakePhoto();
  }, [isNative]);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="p-4 flex items-center">
        <Link to="/" className="btn-icon text-white">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-white text-lg font-medium ml-4">{t.takePhoto}</h1>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center px-4">
        <button
          onClick={handleTakePhoto}
          disabled={isProcessing}
          className="w-16 h-16 rounded-full bg-white shadow-camera flex items-center justify-center ripple transform transition-transform active:scale-95"
        >
          <div className="w-14 h-14 rounded-full border-2 border-gray-300" />
        </button>
        <p className="text-gray-400 text-sm mt-6">{t.keepStable}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default CameraPage;
