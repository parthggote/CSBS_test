# 🤖 AI Quiz Generation Setup Guide

## Prerequisites

To enable real AI-powered quiz generation from PDFs, you need to set up Google's Gemini AI API.

## Step 1: Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Step 2: Set Environment Variables

Create a `.env.local` file in your project root and add:

```env
# Google AI (Gemini) API Key
GOOGLE_AI_API_KEY=your_actual_api_key_here

# MongoDB Connection String (if not already set)
MONGODB_URI=your_mongodb_connection_string_here

# JWT Secret (if not already set)
JWT_SECRET=your_jwt_secret_here
```

## Step 3: Install Dependencies

Run the following command to install the Google AI library:

```bash
npm install @google/generative-ai
```

## Step 4: Restart Your Development Server

```bash
npm run dev
```

## How It Works

### Before AI Integration:
- ❌ Generic mock questions
- ❌ No content analysis
- ❌ Same questions for all PDFs

### After AI Integration:
- ✅ Real questions based on PDF content
- ✅ Intelligent content analysis
- ✅ Subject-specific questions
- ✅ Difficulty-appropriate questions
- ✅ Educational explanations

## Features

### 🧠 Smart Content Analysis
- Extracts text from uploaded PDFs
- Analyzes content for key concepts
- Generates relevant questions

### 🎯 Intelligent Question Generation
- Multiple choice format (A, B, C, D)
- Questions based on actual content
- Varying difficulty levels
- Educational explanations

### 🔄 Fallback System
- If AI fails, uses smart fallback questions
- Ensures quiz generation always works
- Maintains educational value

## Troubleshooting

### "Cannot find module '@google/generative-ai'"
```bash
npm install @google/generative-ai
```

### "API key not found"
- Check your `.env.local` file
- Ensure `GOOGLE_AI_API_KEY` is set correctly
- Restart your development server

### "AI generation failed"
- Check your internet connection
- Verify API key is valid
- Check Google AI service status
- System will use fallback questions

## API Usage

The system uses Google's Gemini 1.5 Flash model for:
- Fast response times
- Cost-effective processing
- High-quality question generation
- Content analysis up to 8,000 characters

## Cost Considerations

- Google AI has a free tier
- Pay-per-use pricing for additional usage
- Typical cost: ~$0.01-0.05 per quiz generation
- Fallback system prevents unnecessary API calls

## Security

- API key is stored in environment variables
- Never commit API keys to version control
- Content is processed securely
- No data is stored by Google AI

## Next Steps

Once set up, you can:
1. Upload any PDF (notes, textbooks, articles)
2. Configure quiz settings (subject, difficulty, questions)
3. Generate AI-powered quizzes instantly
4. Take quizzes with real questions from your content

🎉 **Your AI-powered quiz generation system is ready!** 