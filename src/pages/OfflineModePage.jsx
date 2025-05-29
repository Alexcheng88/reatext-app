// src/pages/OfflineModePage.jsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Trash, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getOfflineHistoryRecords,
  deleteHistoryRecord,
  clearAllHistory
} from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';

const OfflineModePage = () => {
  const { t } = useTheme();
  const [offlineItems, setOfflineItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadOfflineHistory();
  }, []);

  const loadOfflineHistory = () => {
    setIsLoading(true);
    const records = getOfflineHistoryRecords();
    setOfflineItems(records);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDeleteOffline)) return;
    const success = await deleteHistoryRecord(id);
    if (success) {
      setOfflineItems(items => items.filter(item => item.id !== id));
    }
  };

  const handleClearAll = async () => {
    if (!offlineItems.length) return;
    if (!window.confirm(t.confirmClearAllOffline)) return;
    await clearAllHistory();
    setOfflineItems([]);
  };

  const filteredItems = offlineItems.filter(item =>
    item.text_content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="flex-1 pt-20 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* 顶部导航 + 清空按钮 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link to="/" className="btn-icon">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold ml-3">{t.offlineHistory}</h1>
            </div>
            <button
              onClick={handleClearAll}
              className="btn-secondary text-sm"
            >
              {t.clearAll}
            </button>
          </div>

          {/* 搜索框 */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder={t.searchOffline}
              className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute top-3.5 left-3.5 text-gray-400" size={18} />
          </div>

          {/* 列表 */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading-wave">
                <div/><div/><div/><div/><div/>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={item.image_url}
                        alt={t.offlineRecord}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(item.created_at)}
                        </span>
                        <span className="ml-2 flex items-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                          <WifiOff size={10} className="mr-1" />
                          {t.offlineTag}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {item.text_content}
                      </p>
                    </div>
                    <button
                      className="flex-shrink-0 btn-icon ml-4"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash size={18} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">{t.noOfflineHistory}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineModePage;
