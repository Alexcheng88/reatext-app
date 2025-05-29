export interface OcrPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
