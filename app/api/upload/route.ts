import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { ObjectId, GridFSBucket } from 'mongodb';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const db = await getDb();
  const bucket = new GridFSBucket(db);
  const filename = `${Date.now()}-${file.name}`;
  const uploadStream = bucket.openUploadStream(filename);
  await new Promise((resolve, reject) => {
    uploadStream.on('finish', resolve);
    uploadStream.on('error', reject);
    uploadStream.write(buffer);
    uploadStream.end();
  });
  // Find the file in GridFS to get its _id
  const fileDoc = await db.collection('fs.files').findOne({ filename });
  if (!fileDoc) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
  return NextResponse.json({ fileId: fileDoc._id.toString(), filename });
} 