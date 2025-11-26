
import { Language } from '../types';

export const translations = {
  en: {
    appTitle: 'OptiPress',
    headerTitle: 'Image Tools',
    catImage: 'Image Tools',
    catPdf: 'PDF Tools',
    
    // Stats
    totalSaved: 'Total Saved',
    
    // Modes
    modeCompress: 'Compression',
    modeRemoveBg: 'Remove BG',
    modeConvert: 'Convert',
    modePdfCompress: 'Compress PDF',
    modePdfToImage: 'PDF to Image',

    // Settings
    qualityLevel: 'Quality Level',
    outputFormat: 'Output Format',
    keepOriginal: 'Keep Original',
    convertJpeg: 'Convert to JPEG',
    convertPng: 'Convert to PNG',
    convertWebp: 'Convert to WebP',
    convertPdf: 'Convert to PDF',
    convertIco: 'Convert to ICO',
    bgRemovalFormat: 'Result Format',
    transparentPng: 'Transparent PNG',
    whiteBgJpeg: 'White BG JPEG',
    compressResult: 'Compress Result',
    
    // Hints
    compressResultHint: 'Optimize the image after removing background',
    qualityHint: 'Lower quality = smaller file size. 70-80% recommended.',
    pdfQualityHint: 'Reduces the internal image quality of the PDF.',
    formatHint: 'WebP is smaller; PNG is lossless.',
    pdfToImageHint: 'Convert all pages to images. If multiple pages, downloads as ZIP.',
    
    // DropZone
    dropTitle: 'Drag & drop files here',
    dropActive: 'Drop files to process',
    dropSubtitleImage: 'Supports JPG, PNG, WebP. Batch processing available.',
    dropSubtitlePdf: 'Supports PDF documents. Batch processing available.',
    selectFiles: 'Select Files',
    
    // Actions
    clearAll: 'Clear All',
    download: 'Download',
    downloadZip: 'Download ZIP',
    ready: 'Ready to process your files.',
    remove: 'Remove',
    processing: 'Processing...',
    error: 'Error',
    files: 'files',
    done: 'done',
    
    // Resize
    resizeImages: 'Resize Images',
    resizeHint: 'Scale down images larger than these dimensions',
    maxWidth: 'Max Width',
    maxHeight: 'Max Height',
    px: 'px',
    
    // Convert
    targetFormat: 'Target Format',
    convertHint: 'Convert images to different formats.',
    pdfHint: 'Embeds the image into a PDF page.',
    icoHint: 'Generates a 256x256 icon suitable for favicons.',
  },
  zh: {
    appTitle: 'OptiPress',
    headerTitle: '图片工具箱',
    catImage: '图片工具',
    catPdf: 'PDF 工具',

    totalSaved: '总计节省',
    
    modeCompress: '图片压缩',
    modeRemoveBg: '智能抠图',
    modeConvert: '格式转换',
    modePdfCompress: 'PDF 压缩',
    modePdfToImage: 'PDF 转图片',

    qualityLevel: '压缩质量',
    outputFormat: '输出格式',
    keepOriginal: '保持原格式',
    convertJpeg: '转为 JPEG',
    convertPng: '转为 PNG',
    convertWebp: '转为 WebP',
    convertPdf: '转为 PDF',
    convertIco: '转为 ICO',
    bgRemovalFormat: '导出格式',
    transparentPng: '透明背景 PNG',
    whiteBgJpeg: '白底 JPEG',
    compressResult: '结果压缩',
    
    compressResultHint: '抠图后自动压缩图片体积',
    qualityHint: '质量越低体积越小，推荐 70-80%。',
    pdfQualityHint: '降低 PDF 内部图片的清晰度以减小体积。',
    formatHint: 'WebP 体积通常更小；PNG 支持透明。',
    pdfToImageHint: '将所有页面转换为图片。多页文档将打包为 ZIP 下载。',
    
    dropTitle: '拖拽文件到这里',
    dropActive: '释放以开始处理',
    dropSubtitleImage: '支持 JPG, PNG, WebP。支持批量处理。',
    dropSubtitlePdf: '支持 PDF 文档。支持批量处理。',
    selectFiles: '选择文件',
    
    clearAll: '清空列表',
    download: '下载',
    downloadZip: '打包下载',
    ready: '准备就绪，请上传文件。',
    remove: '移除',
    processing: '处理中...',
    error: '失败',
    files: '个文件',
    done: '完成',
    
    // Resize
    resizeImages: '调整尺寸',
    resizeHint: '将超过限制的图片按比例缩小',
    maxWidth: '最大宽度',
    maxHeight: '最大高度',
    px: '像素',
    
    // Convert
    targetFormat: '目标格式',
    convertHint: '将图片转换为不同的格式。',
    pdfHint: '将图片嵌入到 PDF 页面中。',
    icoHint: '生成适用于网站图标的 256x256 图标。',
  }
};

export const t = (lang: Language, key: keyof typeof translations['en']) => {
  return translations[lang][key] || translations['en'][key];
};