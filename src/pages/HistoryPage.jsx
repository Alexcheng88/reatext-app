// src/pages/HistoryPage.jsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Trash, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import {
  getHistoryRecords,
  deleteHistoryRecord,
  getOfflineHistoryRecords,
  clearAllHistory
} from '../utils/helpers';

const HistoryPage = () => {
  const { t } = useTheme();
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState({});

  // 加载线上 + 离线历史
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const records = await getHistoryRecords(true);
        setHistoryItems(records);
      } catch (e) {
        console.error(t.loadHistoryError, e);
        const offline = getOfflineHistoryRecords();
        setHistoryItems(offline);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [t.loadHistoryError]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  };

  const handleDelete = async (id, offline) => {
    if (window.confirm(t.confirmDelete)) {
      await deleteHistoryRecord(id); // 不再关心返回值
     // 立即从 state 里移除
     setHistoryItems(items => items.filter(item => item.id !== id));
      }
    }
  

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(t.copySuccess);
  };

  const handleClearAll = async () => {
    if (!historyItems.length) return;
    if (window.confirm(t.confirmClearHistory)) {
      await clearAllHistory();
      setHistoryItems([]);
    }
  };

  // 过滤 + 排序 + 限制 100 条
  const filteredItems = historyItems
    .filter(item =>
      item.text_content?.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 100);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 pt-20 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link to="/" className="btn-icon">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold ml-3">{t.history}</h1>
            </div>
            <button
              onClick={handleClearAll}
              className="btn-secondary text-sm"
            >
              {t.clearHistory}
            </button>
          </div>

          <div className="relative mb-2">
            <input
              type="text"
              placeholder={t.searchHistory}
              className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute top-3.5 left-3.5 text-gray-400" size={18} />
          </div>
          <p className="text-sm text-gray-500 mb-6">{t.maxHistoryRecords}</p>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading-wave"><div/><div/><div/><div/><div/></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row">
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={item.image_url}
                        alt={t.historyRecord}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">{filteredItems.length - idx}.</span>
                        <p className="text-sm text-gray-700">{formatDate(item.created_at)}</p>
                      </div>
                      <p
                        className={`mt-1 text-gray-800 whitespace-pre-wrap ${expanded[item.id] ? '' : 'line-clamp-2 overflow-hidden'} cursor-pointer`}
                        onClick={() => toggleExpand(item.id)}
                      >
                        {item.text_content}
                      </p>
                      {item.text_content && (
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="text-blue-500 text-xs mt-1"
                        >
                          {expanded[item.id] ? t.collapse : t.readMore}
                        </button>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0 flex items-center">
                      <button
                        className="btn-icon mr-2"
                        onClick={() => copyToClipboard(item.text_content)}
                      >
                        <Copy size={18} className="text-gray-400 hover:text-blue-500" />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(item.id, item.offline)}
                      >
                        <Trash size={18} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">{t.noHistory}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
