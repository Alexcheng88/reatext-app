// src/pages/CameraPage.jsx

import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, RotateCw, X, Crop } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropUtils';
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

  // Crop states
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTheme();
  const isNative = Capacitor.isNativePlatform();

  // Helper: rotate dataURL
  const rotateDataUrl = (dataUrl, degrees) =>
    new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
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

  // Process final photo (cropped/rotated)
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
    if (isNative) handleTakePhoto();
  }, [isNative]);

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

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

        {preview && (
          <div className="w-full max-w-md">
            {/* Cropping Modal */}
            {isCropping && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <div className="relative w-[300px] h-[300px] bg-gray-200">
                    <Cropper
                      image={preview}
                      crop={crop}
                      zoom={zoom}
                      aspect={4 / 3}
                      rotation={rotation}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={e => setZoom(e.target.value)}
                    />
                    <button onClick={() => setIsCropping(false)}>取消</button>
                    <button onClick={async () => {
                      const croppedDataUrl = await getCroppedImg(
                        preview,
                        croppedAreaPixels,
                        rotation
                      );
                      setPreview(croppedDataUrl);
                      setIsCropping(false);
                    }}>确认</button>
                  </div>
                </div>
              </div>
            )}

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
              <button
                className="absolute bottom-4 right-4 btn-icon bg-white dark:bg-gray-700 shadow-md"
                onClick={() => {
                  setPreview(null);
                  setRotation(0);
                }}
              >
                <X size={20} />
              </button>
              <button
                className="absolute top-4 right-16 btn-icon bg-white dark:bg-gray-700 shadow-md"
                onClick={() => setIsCropping(true)}
              >
                <Crop size={20} />
              </button>
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
