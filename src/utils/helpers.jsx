// src/utils/helpers.js

import React, { useRef, useEffect } from 'react';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// 指向 public/pdf.worker.js
GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

// 历史记录最大条数
const HISTORY_LIMIT = 100;

/** 水波纹效果 Hook */
export const useRipple = () => {
  const rippleRef = useRef(null);
  useEffect(() => {
    const el = rippleRef.current;
    if (!el) return;
    const handler = (e) => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const span = document.createElement('span');
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${e.clientX - rect.left - size/2}px`;
      span.style.top = `${e.clientY - rect.top - size/2}px`;
      span.classList.add('ripple-effect');
      const old = el.querySelector('.ripple-effect');
      if (old) old.remove();
      el.appendChild(span);
      setTimeout(() => span.remove(), 600);
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, []);
  return rippleRef;
};

/** 图像预处理：亮度、对比度、锐化、降噪 */
export const applyImageProcessing = async (imageBase64, options = {}) => {
  const {
    contrast = 1.2,
    brightness = 5,
    sharpness = 0,
    denoise = false,
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 1800;
      let w = img.width, h = img.height;
      if (w > maxWidth) {
        const r = maxWidth / w;
        w = maxWidth;
        h = h * r;
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // 亮度 & 对比度
      for (let i = 0; i < data.length; i += 4) {
        data[i]   = Math.min(255, Math.max(0, (data[i]   - 128)*contrast + 128 + brightness));
        data[i+1] = Math.min(255, Math.max(0, (data[i+1] - 128)*contrast + 128 + brightness));
        data[i+2] = Math.min(255, Math.max(0, (data[i+2] - 128)*contrast + 128 + brightness));
      }

      // 简单锐化
      if (sharpness > 0) {
        const tmp = new Uint8ClampedArray(data);
        const kernel = [0,-1,0,-1,5,-1,0,-1,0];
        const factor = 1 + sharpness/10;
        for (let y = 1; y < h-1; y++) {
          for (let x = 1; x < w-1; x++) {
            const idx = (y*w + x)*4;
            for (let c = 0; c < 3; c++) {
              let sum = 0;
              for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                  const k = kernel[(ky+1)*3 + (kx+1)];
                  sum += k * tmp[idx + (ky*w + kx)*4 + c];
                }
              }
              data[idx + c] = Math.min(255, Math.max(0, sum/factor));
            }
          }
        }
      }

      // 简单降噪（3x3 均值滤波）
      if (denoise) {
        const tmp = new Uint8ClampedArray(data);
        for (let y = 1; y < h-1; y++) {
          for (let x = 1; x < w-1; x++) {
            const idx = (y*w + x)*4;
            for (let c = 0; c < 3; c++) {
              let sum = 0;
              for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                  sum += tmp[idx + (ky*w + kx)*4 + c];
                }
              }
              data[idx + c] = sum / 9;
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = imageBase64;
  });
};

/**
 * 将 PDF 的每一页渲染为 PNG DataURL
 * @param {File} pdfFile
 * @returns {Promise<string[]>}
 */
export async function extractAllPdfPages(pdfFile) {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    pages.push(canvas.toDataURL('image/png'));
  }
  return pages;
}

/** 压缩 & 缩放图片 DataURL */
export const resizeAndCompress = (dataUrl, { maxWidth = 1000, quality = 0.8 } = {}) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });

/** 用 Tesseract OCR 识别文字 */
export const recognizeText = async (imageBase64) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageBase64,
      'eng+chi_sim',
      { logger: m => console.log(m.status, m.progress) }
    );
    return text.trim();
  } catch (e) {
    console.error('OCR 识别失败:', e);
    return 'OCR识别失败，请稍后重试。';
  }
};

/** 文本翻译 */
export const translateText = async (text, target = 'en', source = 'zh') => {
  if (!text.trim()) return '';
  try {
    const res = await axios.post('https://translate.astian.org/translate', {
      q: text, source, target, format: 'text'
    });
    return res.data.translatedText;
  } catch (e) {
    console.error('翻译失败:', e);
    return '翻译失败，请稍后重试。';
  }
};

/** 获取所有本地历史（最新优先） */
export const getHistoryRecords = () => {
  const arr = JSON.parse(localStorage.getItem('offlineHistory') || '[]');
  return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

/** 获取离线历史（同 getHistoryRecords） */
export const getOfflineHistoryRecords = getHistoryRecords;

/** 保存一条历史到 localStorage，并限长 */
export const saveToHistory = (imageUrl, textContent) => {
  console.log('>>> 当前 HISTORY_LIMIT =', HISTORY_LIMIT);
  const offline = JSON.parse(localStorage.getItem('offlineHistory') || '[]');
  offline.push({
    id: Date.now(),
    image_url: imageUrl,
    text_content: textContent,
    created_at: new Date().toISOString(),
  });
  const trimmed = offline.slice(-HISTORY_LIMIT);
  localStorage.setItem('offlineHistory', JSON.stringify(trimmed));
};

/** 删除一条本地历史 */
export const deleteHistoryRecord = (id) => {
  const arr = JSON.parse(localStorage.getItem('offlineHistory') || '[]')
    .filter(r => r.id !== id);
  localStorage.setItem('offlineHistory', JSON.stringify(arr));
  return true;    // ← 确保返回 true
};

/** 清空所有本地历史 */
export const clearAllHistory = () => {
  localStorage.removeItem('offlineHistory');
};

/** 同步离线数据 —— 由于只用本地存储，这里直接 noop */
export const syncOfflineData = async () => {
  return { success: false, count: 0 };
};
