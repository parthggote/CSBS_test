import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getDb } from '../../../../lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function getUserFromRequest(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (typeof user === 'object' && 'role' in user) return user as JwtPayload;
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const jwtUser = getUserFromRequest(req);
  if (!jwtUser) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const db = await getDb();
  const collection = db.collection('users');
  // Try to match by _id (string or ObjectId) or email
  let user = null;
  if (jwtUser.id) {
    user = await collection.findOne({ _id: jwtUser.id });
    if (!user) {
      // Try ObjectId
      try {
        const { ObjectId } = require('mongodb');
        user = await collection.findOne({ _id: new ObjectId(jwtUser.id) });
      } catch {}
    }
  }
  if (!user && jwtUser.email) {
    user = await collection.findOne({ email: jwtUser.email });
  }
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  return NextResponse.json(user);
} 