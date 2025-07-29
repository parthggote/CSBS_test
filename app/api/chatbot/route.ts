import { NextRequest, NextResponse } from 'next/server';
import { getGeminiChatResponse } from '../../../lib/google-ai';

export async function POST(req: NextRequest) {
  const { message, history, pdfContext } = await req.json();
  try {
    let fullMessage = message;
    if (pdfContext) {
      fullMessage = `Analyze the following PDF content and answer the user's question based on it.\n\nPDF Content:\n${pdfContext}\n\nUser Question: ${message}`;
    }
    const aiResponse = await getGeminiChatResponse(fullMessage, history || []);
    return NextResponse.json({ success: true, response: aiResponse });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'AI error' }, { status: 500 });
  }
} 