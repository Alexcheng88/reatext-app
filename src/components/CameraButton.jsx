
import React from 'react';
import { Camera, Upload, GridIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const CameraButton = () => {
  const { t } = useTheme();
  
  return (
    <div className="flex flex-col items-center space-y-5">
      <Link 
        to="/camera"
        className="camera-btn camera-glow ripple"
        aria-label={t.takePhoto}
      >
        <Camera size={48} className="text-blue-700" />
      </Link>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/upload"
          className="btn-secondary flex items-center space-x-2 ripple"
        >
          <Upload size={18} />
          <span>{t.uploadImage}</span>
        </Link>
        
      </div>
    </div>
  );
};

export default CameraButton;
  