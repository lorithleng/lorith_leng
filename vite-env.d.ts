declare module 'browser-image-compression' {
  interface Options {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    maxIteration?: number;
    exifOrientation?: number;
    onProgress?: (p: number) => void;
    fileType?: string;
    initialQuality?: number;
  }
  function imageCompression(file: File, options: Options): Promise<File>;
  export default imageCompression;
}

declare module 'jszip' {
  export default class JSZip {
    constructor();
    folder(name: string): JSZip | null;
    file(name: string, data: Blob | string | Promise<Blob | string>, options?: any): this;
    generateAsync(options: { type: "blob" | "base64" | "uint8array" | "string" }): Promise<Blob | string | Uint8Array>;
  }
}

declare module '@imgly/background-removal' {
  export interface Config {
    publicPath?: string;
    debug?: boolean;
    device?: 'cpu' | 'gpu';
    proxyToWorker?: boolean;
    model?: 'small' | 'medium';
  }
  export function removeBackground(image: File | Blob | string, config?: Config): Promise<Blob>;
}