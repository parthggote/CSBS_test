import { NextRequest } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId, GridFSBucket } from 'mongodb';

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const db = await getDb();
  const bucket = new GridFSBucket(db);
  const fileId = params.id;
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type');
  const resourceId = searchParams.get('resourceId');
  let fileDoc;
  try {
    fileDoc = await db.collection('fs.files').findOne({ _id: new ObjectId(fileId) });
    if (!fileDoc) {
      return new Response('File not found', { status: 404 });
    }
    // Increment downloads if type and resourceId are provided
    if (type && resourceId) {
      const validTypes = ['pyqs', 'certifications', 'hackathons', 'interviews'];
      if (validTypes.includes(type)) {
        await db.collection(type).updateOne(
          { _id: new ObjectId(resourceId) },
          { $inc: { downloads: 1 } }
        );
      }
    }
  } catch {
    return new Response('Invalid file id', { status: 400 });
  }
  const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
  const headers = new Headers();
  headers.set('Content-Type', fileDoc.contentType || 'application/octet-stream');
  headers.set('Content-Disposition', `attachment; filename="${fileDoc.filename}"`);
  return new Response(downloadStream as any, { headers });
} 