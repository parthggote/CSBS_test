import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

async function getUserFromRequest(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  return token;
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
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
  
  // Hash the password before storing
  if (user.password) {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
  
  // Add default fields for new users
  const newUser = {
    ...user,
    role: user.role || 'student',
    createdAt: new Date(),
    isActive: true,
    preferences: {}
  };
  
  const result = await collection.insertOne(newUser);
  return NextResponse.json({ ...newUser, _id: result.insertedId }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const db = await getDb();
  const collection = db.collection('users');
  const { id, ...rest } = await req.json();
  const result = await collection.updateOne({ _id: new (require('mongodb').ObjectId)(id) }, { $set: rest });
  if (result.matchedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Updated' });
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const db = await getDb();
  const collection = db.collection('users');
  const { id } = await req.json();
  const result = await collection.deleteOne({ _id: new (require('mongodb').ObjectId)(id) });
  if (result.deletedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
} 
