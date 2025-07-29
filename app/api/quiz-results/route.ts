import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function getUserId(user: any) {
  if (!user) return null;
  if (typeof user === 'string') return user;
  if ('id' in user) return user.id;
  if ('_id' in user) return user._id;
  return null;
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { quizId, score, answers } = await req.json();
  if (!quizId || score === undefined) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const db = await getDb();
  const quizResults = db.collection('quizResults');
  // Upsert: one result per user per quiz
  await quizResults.updateOne(
    { userId: getUserId(user), quizId },
    { $set: { userId: getUserId(user), quizId, score, answers, timestamp: new Date() } },
    { upsert: true }
  );
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const quizResults = db.collection('quizResults');
  const results = await quizResults.find({ userId: getUserId(user) }).toArray();
  return NextResponse.json(results);
} 