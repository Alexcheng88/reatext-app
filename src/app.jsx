import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage        from './pages/HomePage';
import CameraPage      from './pages/CameraPage';
import UploadPage      from './pages/UploadPage';
import ResultPage      from './pages/ResultPage';
import HistoryPage     from './pages/HistoryPage';
import BatchPage       from './pages/BatchPage';
import BatchResult     from './pages/BatchResult.jsx';
import LoginPage       from './pages/LoginPage';
import OfflineModePage from './pages/OfflineModePage';
import { ThemeProvider } from './context/ThemeContext';
import CropPage        from './pages/CropPage';
import PdfResult       from './pages/PdfResult.jsx';

// ✅ 包裹整个 App 的监听器组件
const PDFListener = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePDF = (event) => {
      const pdfUri = event.detail?.uri;
      if (pdfUri) {
        console.log("📄 Received PDF from native Android:", pdfUri);

        // 避免重复跳转
        if (!location.pathname.startsWith("/pdf-result")) {
          navigate(`/pdf-result?file=${encodeURIComponent(pdfUri)}`);
        }
      }
    };

    window.addEventListener("pdfReceived", handlePDF);
    return () => window.removeEventListener("pdfReceived", handlePDF);
  }, [navigate, location]);

  return children;
};

export const App = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <PDFListener>
          <Routes>
            <Route path="/"             element={<HomePage />} />
            <Route path="/camera"       element={<CameraPage />} />
            <Route path="/upload"       element={<UploadPage />} />
            <Route path="/crop"         element={<CropPage />} />
            <Route path="/result"       element={<ResultPage />} />
            <Route path="/history"      element={<HistoryPage />} />
            <Route path="/batch"        element={<BatchPage />} />
            <Route path="/batchResult"  element={<BatchResult />} />
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/offline"      element={<OfflineModePage />} />
            <Route path="/pdf-result"   element={<PdfResult />} />
          </Routes>
        </PDFListener>
      </HashRouter>
    </ThemeProvider>
  );
};
