import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '@/lib/mongodb';

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

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  
  const db = await getDb();
  const collection = db.collection('notifications');
  
  // Get notifications for the current user
  const notifications = await collection.find({ 
    $or: [
      { userId: getUserId(user) },
      { targetRole: user.role }
    ]
  }).sort({ createdAt: -1 }).toArray();
  
  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  
  const body = await req.json();
  const { type, title, message, targetRole, quizId, studentId } = body;
  
  const db = await getDb();
  const collection = db.collection('notifications');
  
  const notification = {
    type,
    title,
    message,
    userId: studentId || getUserId(user),
    targetRole,
    quizId,
    status: 'pending', // pending, approved, rejected
    createdAt: new Date(),
    read: false
  };
  
  const result = await collection.insertOne(notification);
  return NextResponse.json({ ...notification, _id: result.insertedId }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  
  const body = await req.json();
  const { notificationId, status, read } = body;
  
  const db = await getDb();
  const collection = db.collection('notifications');
  
  const update: any = {};
  if (status !== undefined) update.status = status;
  if (read !== undefined) update.read = read;
  
  const result = await collection.updateOne(
    { _id: new (require('mongodb').ObjectId)(notificationId) },
    { $set: update }
  );
  
  if (result.matchedCount === 0) {
    return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
  }
  
  // If admin approves a quiz assignment request, update the quiz
  if (status === 'approved' && body.quizId) {
    const quizCollection = db.collection('quizzes');
    await quizCollection.updateOne(
      { _id: new (require('mongodb').ObjectId)(body.quizId) },
      { $addToSet: { assignedTo: body.studentId } }
    );
    
    // Also create a notification for the student
    const studentNotification = {
      type: 'quiz_assignment_approved',
      title: 'Quiz Access Granted',
      message: 'Your request for quiz access has been approved by the admin.',
      userId: body.studentId,
      targetRole: 'student',
      quizId: body.quizId,
      status: 'approved',
      createdAt: new Date(),
      read: false
    };
    await collection.insertOne(studentNotification);
  }
  
  return NextResponse.json({ message: 'Updated' });
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  
  const { notificationId } = await req.json();
  
  const db = await getDb();
  const collection = db.collection('notifications');
  
  const result = await collection.deleteOne({ 
    _id: new (require('mongodb').ObjectId)(notificationId) 
  });
  
  if (result.deletedCount === 0) {
    return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
  }
  
  return NextResponse.json({ message: 'Deleted' });
} 
