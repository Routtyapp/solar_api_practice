import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

const API_KEY = process.env.UPSTAGE_API_KEY || 'up_Ze80XSyqgek8utPV9WacsyAE8rQNg';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ maxFileSize: 50 * 1024 * 1024 }); // 50MB limit

    const [fields, files] = await form.parse(req);
    const file = files.document?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const formData = new FormData();
    formData.append('document', fs.createReadStream(file.filepath), {
      filename: file.originalFilename || 'document',
      contentType: file.mimetype || 'application/octet-stream',
    });
    formData.append('model', 'ocr');

    const response = await fetch('https://api.upstage.ai/v1/document-digitization', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData as unknown as BodyInit,
    });

    const result = await response.json();

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    if (!response.ok) {
      return res.status(response.status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('OCR error:', error);
    return res.status(500).json({ error: 'Failed to perform OCR' });
  }
}
