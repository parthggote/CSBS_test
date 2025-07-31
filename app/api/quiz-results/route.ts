import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { getToken } from 'next-auth/jwt';

async function getUserFromRequest(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  return token;
}

function getUserId(user: any) {
  if (!user) return null;
  if (typeof user === 'string') return user;
  if ('id' in user) return user.id;
  if ('_id' in user) return user._id;
  return null;
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
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
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const quizResults = db.collection('quizResults');
  const results = await quizResults.find({ userId: getUserId(user) }).toArray();
  return NextResponse.json(results);
} 
