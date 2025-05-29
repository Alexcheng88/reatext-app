import { registerPlugin } from '@capacitor/core';

import type { OcrPluginPlugin } from './definitions';

const OcrPlugin = registerPlugin<OcrPluginPlugin>('OcrPlugin', {
  web: () => import('./web').then((m) => new m.OcrPluginWeb()),
});

export * from './definitions';
export { OcrPlugin };
