// src/pages/BatchPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import BatchUpload from '../components/BatchUpload';
import BatchResults from '../components/BatchResults';
import { useTheme } from '../context/ThemeContext';

const BatchPage = () => {
  const [batchResults, setBatchResults] = useState(null);
  const navigate = useNavigate();
  const { t } = useTheme();

  // 只接收结果并切换视图，不再重复 saveToHistory
  const handleBatchComplete = (results) => {
    setBatchResults(results);
  };

  const handleBackToUpload = () => {
    setBatchResults(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-grow pt-20 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {!batchResults ? (
            <>
              <div className="flex items-center mb-6 gap-2">
                <Link to="/" className="btn-icon">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold ml-3">{t.batchRecognition}</h1>
              </div>

              <p className="text-gray-500 text-sm text-center mb-6">
                {t.batchHint}
              </p>

              <BatchUpload onComplete={handleBatchComplete} />
            </>
          ) : (
            <BatchResults
              results={batchResults}
              onBack={handleBackToUpload}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchPage;
