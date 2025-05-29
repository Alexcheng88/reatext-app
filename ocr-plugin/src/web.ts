import { WebPlugin } from '@capacitor/core';

import type { OcrPluginPlugin } from './definitions';

export class OcrPluginWeb extends WebPlugin implements OcrPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
