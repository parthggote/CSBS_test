import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getDb } from '../../../lib/mongodb';

const validTypes = ['pyqs', 'certifications', 'hackathons', 'interviews', 'events', 'quizzes', 'flashcardSets'];

function getType(searchParams: URLSearchParams) {
  const type = searchParams.get('type');
  if (!type || !validTypes.includes(type)) return null;
  return type;
}

async function getUserFromRequest(req: NextRequest) {
  const token = await getToken({ req });
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
  const type = getType(req.nextUrl.searchParams);
  if (!type) return NextResponse.json({ message: 'Invalid resource type' }, { status: 400 });
  const db = await getDb();
  const collection = type === 'events' ? db.collection('Events') : db.collection(type);
  
  // Allow public access to events, resources (pyqs, certifications, hackathons, interviews)
  if (type === 'events' || type === 'pyqs' || type === 'certifications' || type === 'hackathons' || type === 'interviews') {
    const items = await collection.find({}).toArray();
    return NextResponse.json(items);
  }
  
  // Require authentication for quizzes
  if (type === 'quizzes') {
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    const userId = getUserId(user);
    // If admin, show all quizzes
    if (user.role === 'admin') {
      const items = await collection.find({}).toArray();
      return NextResponse.json(items);
    } else {
      // Student: show quizzes assigned to them or created by themselves
      const items = await collection.find({ 
        $or: [
          { createdBy: userId },
          { assignedTo: { $in: [userId] } },
          { isActive: true } // Show active quizzes for all students
        ]
      }).toArray();
      return NextResponse.json(items);
    }
  }
  
  // Require authentication for flashcardSets
  if (type === 'flashcardSets') {
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    const userId = getUserId(user);
    // If admin, show all flashcard sets
    if (user.role === 'admin') {
      const items = await collection.find({}).toArray();
      return NextResponse.json(items);
    } else {
      // Student: show flashcard sets created by themselves
      const items = await collection.find({ 
        $or: [
          { createdBy: userId },
          { isActive: true } // Show active flashcard sets for all students
        ]
      }).toArray();
      return NextResponse.json(items);
    }
  }
  
  // For other types, require authentication
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const items = await collection.find({}).toArray();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
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
  const user = await getUserFromRequest(req);
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
  const user = await getUserFromRequest(req);
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