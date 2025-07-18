import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getDb } from '../../../lib/mongodb';

const validTypes = ['pyqs', 'certifications', 'hackathons', 'interviews', 'events'];
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function getType(searchParams: URLSearchParams) {
  const type = searchParams.get('type');
  if (!type || !validTypes.includes(type)) return null;
  return type;
}

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
  const type = getType(req.nextUrl.searchParams);
  if (!type) return NextResponse.json({ message: 'Invalid resource type' }, { status: 400 });
  const db = await getDb();
  const collection = type === 'events' ? db.collection('Events') : db.collection(type);
  const items = await collection.find({}).toArray();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const type = body.type;
  if (!type || !validTypes.includes(type)) return NextResponse.json({ message: 'Invalid resource type' }, { status: 400 });
  const db = await getDb();
  const collection = type === 'events' ? db.collection('Events') : db.collection(type);
  // Add required arrays if not present
  let item = { ...body };
  if (type === 'events') {
    if (!Array.isArray(item.registeredUsers)) item.registeredUsers = [];
  }
  if (!Array.isArray(item.bookmarkedBy)) item.bookmarkedBy = [];
  if (type === 'certifications' && !Array.isArray(item.issuedTo)) item.issuedTo = [];
  const result = await collection.insertOne(item);
  return NextResponse.json({ ...item, _id: result.insertedId }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const type = getType(req.nextUrl.searchParams);
  if (!type) return NextResponse.json({ message: 'Invalid resource type' }, { status: 400 });
  const db = await getDb();
  const collection = type === 'events' ? db.collection('Events') : db.collection(type);
  const { id, _id, addRegisteredUserId, registrationData, ...rest } = await req.json();

  if (type === 'events' && addRegisteredUserId) {
    // Add the user to registeredUsers and store registration data
    const update: any = { $addToSet: { registeredUsers: addRegisteredUserId } };
    if (registrationData) {
      update.$push = { registrations: { userId: addRegisteredUserId, data: registrationData } };
    }
    const result = await collection.updateOne(
      { _id: new (require('mongodb').ObjectId)(id) },
      update
    );
    if (result.matchedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'User registered' });
  }

  // Default: update other fields (exclude _id)
  const result = await collection.updateOne(
    { _id: new (require('mongodb').ObjectId)(id) },
    { $set: rest }
  );
  if (result.matchedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Updated' });
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const type = getType(req.nextUrl.searchParams);
  if (!type) return NextResponse.json({ message: 'Invalid resource type' }, { status: 400 });
  const db = await getDb();
  const collection = type === 'events' ? db.collection('Events') : db.collection(type);
  const { id } = await req.json();
  const result = await collection.deleteOne({ _id: new (require('mongodb').ObjectId)(id) });
  if (result.deletedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
} 