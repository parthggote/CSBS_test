import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

export const maxRequestBodySize = '20mb';

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json();
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }
    const db = await getDb();
    // Get the uploaded file from GridFS
    const bucket = new (require('mongodb')).GridFSBucket(db);
    const downloadStream = bucket.openDownloadStream(new (require('mongodb')).ObjectId(fileId));
    // Collect PDF data
    const chunks: Buffer[] = [];
    downloadStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    await new Promise((resolve, reject) => {
      downloadStream.on('end', resolve);
      downloadStream.on('error', reject);
    });
    const pdfBuffer = Buffer.concat(chunks);
    let pdfContent = '';
    try {
      const textFromBuffer = pdfBuffer.toString('utf8');
      const textMatch = textFromBuffer.match(/\/Text\s*\[(.*?)\]/g);
      if (textMatch) {
        pdfContent = textMatch.join(' ');
      } else {
        pdfContent = textFromBuffer;
      }
    } catch (error) {
      pdfContent = '';
    }
    return NextResponse.json({ success: true, content: pdfContent });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze PDF' }, { status: 500 });
  }
} 