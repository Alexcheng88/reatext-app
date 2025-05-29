// src/components/LegalLinks.jsx
import React from 'react';
import { Browser } from '@capacitor/browser';
import { useTheme } from '../context/ThemeContext';

const LegalLinks = () => {
  const { t } = useTheme();

  const openUrl = async (url) => {
    // Web 环境下也能用 window.open
    if (typeof window !== 'undefined' && window.open) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      await Browser.open({ url });
    }
  };

  return (
    <div className="legal-links text-center text-sm mt-4">
      <button
        onClick={() => openUrl('https://Alexcheng88.github.io/reatext-legal/terms-of-service.html')}
        className="underline mx-2"
      >
        {t.userAgreement /* 如“用户协议” */}
      </button>
      <button
        onClick={() => openUrl('https://Alexcheng88.github.io/reatext-legal/privacy-policy.html')}
        className="underline mx-2"
      >
        {t.privacyPolicy /* 如“隐私政策” */}
      </button>
    </div>
  );
};

export default LegalLinks;
