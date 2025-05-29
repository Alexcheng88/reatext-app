import ReactDOM from 'react-dom/client';
import { App } from './app';
import './index.css';

// ✅ 引入 translateText 函数
import { translateText } from './utils/helpers';

// ✅ 将它挂载到全局 window 上，方便在控制台测试
window.translateText = translateText;

const root = ReactDOM.createRoot(document.getElementById('app'));

root.render(
  <App />
);