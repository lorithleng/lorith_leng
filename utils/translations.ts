
import { Language } from '../types';

export const translations = {
  en: {
    appTitle: 'OptiPress',
    headerTitle: 'Image Tools',
    catImage: 'Image Tools',
    catPdf: 'PDF Tools',
    
    // Stats
    totalSaved: 'Total Saved',
    files: 'Files',
    done: 'Done',
    clearAll: 'Clear All',
    download: 'Download',
    downloadZip: 'Download ZIP',
    processing: 'Processing',
    ready: 'Ready to process files',

    // DropZone
    dropActive: 'Drop files here',
    dropTitle: 'Drag & Drop files here',
    dropSubtitleImage: 'Supports JPG, PNG, WEBP',
    dropSubtitlePdf: 'Supports PDF files',
    selectFiles: 'Select Files',
    
    // Modes
    modeCompress: 'Compression',
    modeRemoveBg: 'Remove BG',
    modeConvert: 'Convert',
    modePdfCompress: 'Compress',
    modePdfToImage: 'To Image',
    modePdfSplit: 'Split',
    modePdfUnlock: 'Unlock',
    modePdfEdit: 'Edit',
    modePdfAnnotate: 'Annotate',

    // Settings
    qualityLevel: 'Quality Level',
    qualityHint: 'Lower quality means smaller file size',
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
    compressResultHint: 'Compress the image after removing background',
    
    // Resize
    resizeImages: 'Resize Images',
    maxWidth: 'Max Width',
    maxHeight: 'Max Height',
    px: 'px',
    resizeHint: 'Images larger than these dimensions will be downscaled',

    // Convert Hints
    targetFormat: 'Target Format',
    formatHint: 'Choose output format',
    pdfHint: 'Images will be embedded in PDF',
    icoHint: 'Resized to max 256x256',
    convertHint: 'Select target format',

    // PDF New Settings
    pageRange: 'Page Range',
    password: 'Password',
    rotation: 'Rotation',
    watermarkText: 'Watermark Text',
    pdfQualityHint: 'Adjust PDF compression level',
    pdfToImageHint: 'Convert pages to images',
  },
  zh: {
    appTitle: 'OptiPress',
    headerTitle: '图片工具',
    catImage: '图片工具',
    catPdf: 'PDF工具',
    
    // Stats
    totalSaved: '已节省',
    files: '个文件',
    done: '完成',
    clearAll: '清空全部',
    download: '下载',
    downloadZip: '下载 ZIP',
    processing: '处理中',
    ready: '准备处理文件',

    // DropZone
    dropActive: '释放文件',
    dropTitle: '拖拽文件到这里',
    dropSubtitleImage: '支持 JPG, PNG, WEBP',
    dropSubtitlePdf: '支持 PDF 文件',
    selectFiles: '选择文件',
    
    // Modes
    modeCompress: '压缩',
    modeRemoveBg: '去背景',
    modeConvert: '转换',
    modePdfCompress: '压缩',
    modePdfToImage: '转图片',
    modePdfSplit: '拆分',
    modePdfUnlock: '解密',
    modePdfEdit: '编辑',
    modePdfAnnotate: '水印',

    // Settings
    qualityLevel: '质量等级',
    qualityHint: '质量越低文件越小',
    outputFormat: '输出格式',
    keepOriginal: '保持原样',
    convertJpeg: '转为 JPEG',
    convertPng: '转为 PNG',
    convertWebp: '转为 WebP',
    convertPdf: '转为 PDF',
    convertIco: '转为 ICO',
    bgRemovalFormat: '结果格式',
    transparentPng: '透明 PNG',
    whiteBgJpeg: '白底 JPEG',
    compressResult: '压缩结果',
    compressResultHint: '去除背景后压缩图片',
    
    // Resize
    resizeImages: '调整大小',
    maxWidth: '最大宽度',
    maxHeight: '最大高度',
    px: '像素',
    resizeHint: '超过此尺寸的图片将被缩小',

    // Convert Hints
    targetFormat: '目标格式',
    formatHint: '选择输出格式',
    pdfHint: '图片将被嵌入PDF',
    icoHint: '调整为最大 256x256',
    convertHint: '选择目标格式',

    // PDF New Settings
    pageRange: '页面范围',
    password: '密码',
    rotation: '旋转',
    watermarkText: '水印文本',
    pdfQualityHint: '调整 PDF 压缩等级',
    pdfToImageHint: '将页面转换为图片',
  }
};

export const t = (lang: Language, key: keyof typeof translations['en']): string => {
  const dict = translations[lang] || translations['en'];
  // Fallback to English if key missing in current lang
  // @ts-ignore
  return dict[key] || translations['en'][key] || key;
};
