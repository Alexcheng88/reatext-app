// src/pages/CropPage.jsx
import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCroppedImg } from '../utils/cropHelpers'; // 我们后面写它
import { useTheme } from '../context/ThemeContext';

const CropPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t } = useTheme();
  const imageSrc = state?.image;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      // 将裁剪旋转后的图传给 ResultPage
      navigate('/result', {
        state: {
          image: croppedImage,
          fromCamera: true,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, rotation, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="flex-grow relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={NaN /* 自由比例，或指定 4/3 */}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
        />
      </div>
      <div className="p-4 flex space-x-3 bg-gray-900">
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(e.target.value)}
        />
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={rotation}
          onChange={(e) => setRotation(e.target.value)}
        />
        <button
          onClick={handleConfirm}
          className="btn-primary ml-auto"
        >
          {t.confirm}
        </button>
      </div>
    </div>
  );
};

export default CropPage;
