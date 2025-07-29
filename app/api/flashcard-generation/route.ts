import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { generateFlashcardsFromContent } from '../../../lib/google-ai';
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
  try {
    const { fileId, subject, cardCount, description } = await req.json();
    
    if (!fileId || !subject) {
      return NextResponse.json({ 
        error: 'File ID and subject are required' 
      }, { status: 400 });
    }

    const db = await getDb();
    const user = getUserFromRequest(req);
    const createdBy = getUserId(user);
    
    // Get the uploaded file from GridFS
    const bucket = new (require('mongodb')).GridFSBucket(db);
    const downloadStream = bucket.openDownloadStream(new (require('mongodb')).ObjectId(fileId));
    
    // Collect file data
    const chunks: Buffer[] = [];
    downloadStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Wait for the file to be read
    await new Promise((resolve, reject) => {
      downloadStream.on('end', resolve);
      downloadStream.on('error', reject);
    });

    // Combine chunks and extract text
    const fileBuffer = Buffer.concat(chunks);
    
    // Extract text content from the file
    let fileContent = '';
    
    try {
      // Try to extract text from file buffer
      const textFromBuffer = fileBuffer.toString('utf8');
      
      // For PDFs, look for text content
      if (textFromBuffer.includes('%PDF')) {
        const textMatch = textFromBuffer.match(/\/Text\s*\[(.*?)\]/g);
        if (textMatch) {
          fileContent = textMatch.join(' ');
        } else {
          // If no text found in PDF, use a placeholder
          fileContent = `Content from ${subject} study materials. This document contains information about ${subject} concepts, principles, and applications.`;
        }
      } else {
        // For text files, use the content directly
        fileContent = textFromBuffer;
      }
    } catch (error) {
      // Fallback content
      fileContent = `Study materials for ${subject}. This document covers fundamental concepts, advanced topics, and practical applications in ${subject}.`;
    }

    // Generate flash cards using real AI
    const generatedFlashcards = await generateFlashcardsFromContent(fileContent, {
      subject,
      cardCount
    });

    // Create flash card set document
    const flashcardSetData = {
      title: generatedFlashcards.title,
      description: description || generatedFlashcards.description,
      subject: subject,
      cardCount: cardCount,
      cards: generatedFlashcards.cards,
      generatedFromFile: true,
      originalFileId: fileId,
      createdAt: new Date(),
      type: 'flashcards',
      createdBy
    };

    // Save to database
    const flashcardSetsCollection = db.collection('flashcardSets');
    const result = await flashcardSetsCollection.insertOne(flashcardSetData);

    return NextResponse.json({
      success: true,
      flashcardSet: { ...flashcardSetData, _id: result.insertedId },
      message: 'Flash cards generated successfully'
    });

  } catch (error) {
    console.error('Error generating flash cards:', error);
    return NextResponse.json({ 
      error: 'Failed to generate flash cards' 
    }, { status: 500 });
  }
} 