import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage        from './pages/HomePage';
import CameraPage      from './pages/CameraPage';
import UploadPage      from './pages/UploadPage';
import ResultPage      from './pages/ResultPage';
import HistoryPage     from './pages/HistoryPage';
import BatchPage       from './pages/BatchPage';
import BatchResult     from './pages/BatchResult';    // ← 新增这一行
import LoginPage       from './pages/LoginPage';
import OfflineModePage from './pages/OfflineModePage';
import { ThemeProvider } from './context/ThemeContext';
import CropPage        from './pages/CropPage';
import PdfResult from './pages/PdfResult';

export const App = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/camera"       element={<CameraPage />} />
          <Route path="/upload"       element={<UploadPage />} />
          <Route path="/crop"         element={<CropPage />} />        {/* ← CropPage 已导入，路由生效 */}
          <Route path="/result"       element={<ResultPage />} />
          <Route path="/history"      element={<HistoryPage />} />
          <Route path="/batch"        element={<BatchPage />} />
          <Route path="/batchResult"  element={<BatchResult />} />  {/* ← 新增这个路由 */}
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/offline"      element={<OfflineModePage />} />
          <Route path="/pdf-result" element={<PdfResult />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
};
App.jsx