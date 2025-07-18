import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getDb } from '../../../lib/mongodb';

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
  const collection = db.collection('users');
  const users = await collection.find({}).toArray();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const collection = db.collection('users');
  const user = await req.json();
  // Prevent duplicate email
  const existing = await collection.findOne({ email: user.email });
  if (existing) return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
  const result = await collection.insertOne(user);
  return NextResponse.json({ ...user, _id: result.insertedId }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const db = await getDb();
  const collection = db.collection('users');
  const { id, ...rest } = await req.json();
  const result = await collection.updateOne({ _id: new (require('mongodb').ObjectId)(id) }, { $set: rest });
  if (result.matchedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Updated' });
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const db = await getDb();
  const collection = db.collection('users');
  const { id } = await req.json();
  const result = await collection.deleteOne({ _id: new (require('mongodb').ObjectId)(id) });
  if (result.deletedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
} 