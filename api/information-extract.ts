import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.UPSTAGE_API_KEY || 'up_Ze80XSyqgek8utPV9WacsyAE8rQNg',
  baseURL: 'https://api.upstage.ai/v1/information-extraction',
});

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
    const form = formidable({ maxFileSize: 50 * 1024 * 1024 });

    const [fields, files] = await form.parse(req);
    const file = files.document?.[0];
    const schemaStr = fields.schema?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!schemaStr) {
      return res.status(400).json({ error: 'No schema provided' });
    }

    const schema = JSON.parse(schemaStr);
    const base64Image = fs.readFileSync(file.filepath, 'base64');

    const extraction_response = await openai.chat.completions.create({
      model: 'information-extract',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:application/octet-stream;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'document_schema',
          schema: schema,
        },
      },
    });

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json(extraction_response);
  } catch (error) {
    console.error('Information extraction error:', error);
    return res.status(500).json({ error: 'Failed to extract information' });
  }
}
