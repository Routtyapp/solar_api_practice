export interface DocumentParseResult {
  content: {
    html: string;
    text: string;
  };
  elements: Array<{
    category: string;
    content: {
      html?: string;
      text?: string;
    };
    coordinates?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    base64?: string;
  }>;
  model: string;
  usage: {
    pages: number;
  };
}

export interface OCRResult {
  text: string;
  pages: Array<{
    text: string;
    words: Array<{
      text: string;
      boundingBox: number[];
    }>;
  }>;
  model: string;
  usage: {
    pages: number;
  };
}

const API_BASE = '/api';

export async function parseDocument(file: File): Promise<DocumentParseResult> {
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch(`${API_BASE}/document-parse`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMessage = typeof error.error === 'string'
      ? error.error
      : error.message || JSON.stringify(error) || 'Failed to parse document';
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function performOCR(file: File): Promise<OCRResult> {
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch(`${API_BASE}/ocr`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to perform OCR');
  }

  return response.json();
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf';
}

export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  return documentTypes.includes(file.type) || isImageFile(file);
}
