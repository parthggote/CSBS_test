import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getDb } from '../../../lib/mongodb';

const SETTINGS_ID = 'main';
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
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const db = await getDb();
  const collection = db.collection('settings');
  const settings = await collection.findOne({ _id: SETTINGS_ID } as any);
  return NextResponse.json(settings || {});
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const db = await getDb();
  const collection = db.collection('settings');
  const update = await req.json();
  await collection.updateOne(
    { _id: SETTINGS_ID } as any,
    { $set: update },
    { upsert: true }
  );
  const settings = await collection.findOne({ _id: SETTINGS_ID } as any);
  return NextResponse.json(settings);
} 