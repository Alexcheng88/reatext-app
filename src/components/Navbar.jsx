// src/components/Navbar.jsx 

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Settings as SettingsIcon,
  History,
  GridIcon,
  Sun,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const {
    isDarkMode,
    toggleDarkMode,
    isOnline,
    currentLanguage,
    changeLanguage,
    t
  } = useTheme();

  // 监听滚动以修改透明度
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 导航栏 */}
      <nav
        className={`navbar fixed top-0 left-0 right-0 z-50 py-4 px-5 transition-all duration-300 ${
          isScrolled
            ? 'bg-opacity-95 shadow dark:bg-opacity-95 dark:shadow-gray-900'
            : 'bg-opacity-80 dark:bg-opacity-80'
        }`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Camera className="h-7 w-7 text-blue-500" />
            <span className="font-bold text-xl">{t.appName}</span>
          </Link>
          <div className="hidden sm:block text-gray-500 dark:text-gray-400 font-medium">
            {t.tagline}
          </div>
          <button
            className="btn-icon settings-icon"
            onClick={() => setShowSettings(v => !v)}
            aria-label={t.settings}
          >
            <SettingsIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </nav>

      {/* 离线提示 */}
      {!isOnline && <div className="offline-banner">{t.networkOffline}</div>}

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed top-16 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 z-50 w-64 fade-in">
          {/* 标题 */}
          <div className="flex items-center mb-3">
            <SettingsIcon className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-medium">{t.settings}</h3>
          </div>

          <div className="space-y-3">
            {/* 深色模式 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {isDarkMode ? (
                  <img
                    src="https://heyboss.heeyo.ai/1745542305-d640b4f8-mrmad.com.tw-wp-content-uploads-2021-11-iphone-dark-mode-1-1.jpg"
                    alt="深色模式"
                    className="w-5 h-5 mr-2 rounded-full"
                  />
                ) : (
                  <Sun size={16} className="mr-2 text-yellow-400" />
                )}
                <span>{t.darkMode}</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                />
                <span className="slider" />
              </label>
            </div>

            {/* 语言选择 */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {t.language}
              </p>
              <select
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                onChange={e => changeLanguage(e.target.value)}
                value={currentLanguage}
              >
                <option value="zh">简体中文</option>
                <option value="en">English</option>
                <option value="ms-MY">Bahasa Melayu</option>
                <option value="hi-MY">हिन्दी</option>
              </select>
            </div>

            <hr className="my-2 border-gray-200 dark:border-gray-700" />

            {/* 其他链接 */}
            <div className="space-y-2">
              {/* 历史记录 */}
              <Link
                to="/history"
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowSettings(false)}
              >
                <History size={16} className="mr-2" />
                <span>{t.history}</span>
              </Link>

              {/* 批量识别 */}
              <Link
                to="/batch"
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowSettings(false)}
              >
                <GridIcon size={16} className="mr-2" />
                <span>{t.batchRecognition}</span>
              </Link>


              {/* 
              // —— 广告链接 （暂时注释，需要时取消注释） ——
              <a
                href="https://your-ad-url.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowSettings(false)}
              >
                <ExternalLink size={16} className="mr-2" />
                <span>{t.advertisement || '广告活动'}</span>
              </a>
              */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
