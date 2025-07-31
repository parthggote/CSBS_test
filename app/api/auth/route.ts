import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '../../../lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: NextRequest) {
  const { email, password, type } = await req.json();
  const db = await getDb();
  const users = db.collection('users');
  const user = await users.findOne({ email, password, role: type });
  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
  const response = NextResponse.json({ message: 'Login successful', role: user.role, name: user.name });
  response.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'strict',
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'strict',
  });
  return response;
} 