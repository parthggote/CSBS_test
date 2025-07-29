// Dynamic import to avoid compilation issues
let genAI: any = null;

async function initializeGoogleAI() {
  if (!genAI) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
  }
  return genAI;
}

export async function generateQuizFromContent(
  content: string,
  options: {
    subject: string;
    difficulty: string;
    questionCount: number;
  }
) {
  try {
    const ai = await initializeGoogleAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert quiz generator. Create a multiple-choice quiz based on the following content.

Content to analyze:
${content.substring(0, 8000)} // Limit content to avoid token limits

Requirements:
- Subject: ${options.subject}
- Difficulty: ${options.difficulty}
- Number of questions: ${options.questionCount}
- Format: Multiple choice with 4 options (A, B, C, D)
- Questions should be based on the actual content provided
- Make questions relevant and educational
- Vary question types (concept understanding, application, analysis)

Please generate the quiz in the following JSON format:
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Important:
- Only return valid JSON
- Ensure correctAnswer is A, B, C, or D
- Make questions challenging but fair
- Base questions on the actual content provided
- If content is insufficient, create general questions about the subject
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const quizData = JSON.parse(jsonMatch[0]);
    
    // Validate the response
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format from AI');
    }

    return quizData;

  } catch (error) {
    console.error('Error generating quiz with AI:', error);
    
    // Fallback to mock questions if AI fails
    return generateFallbackQuiz(options);
  }
}

function generateFallbackQuiz(options: {
  subject: string;
  difficulty: string;
  questionCount: number;
}) {
  const baseQuestions = [
    {
      question: `What is the primary focus of ${options.subject}?`,
      options: [
        'Understanding fundamental concepts',
        'Memorizing facts',
        'Following procedures',
        'Creative expression'
      ],
      correctAnswer: 'A',
      explanation: 'Understanding fundamental concepts is essential in any subject.'
    },
    {
      question: `Which approach is most effective for learning ${options.subject}?`,
      options: [
        'Passive reading',
        'Active practice and application',
        'Memorization only',
        'Avoiding difficult topics'
      ],
      correctAnswer: 'B',
      explanation: 'Active practice and application leads to better understanding and retention.'
    },
    {
      question: `What is a key challenge in mastering ${options.subject}?`,
      options: [
        'Finding time to study',
        'Understanding complex relationships',
        'Remembering terminology',
        'All of the above'
      ],
      correctAnswer: 'D',
      explanation: 'All these factors contribute to the challenge of mastering any subject.'
    },
    {
      question: `In ${options.subject}, what does "analysis" typically involve?`,
      options: [
        'Breaking down complex information',
        'Memorizing definitions',
        'Following step-by-step procedures',
        'Avoiding difficult questions'
      ],
      correctAnswer: 'A',
      explanation: 'Analysis involves breaking down complex information into understandable parts.'
    },
    {
      question: `What is the best way to approach ${options.subject} problems?`,
      options: [
        'Guessing randomly',
        'Systematic problem-solving',
        'Avoiding difficult problems',
        'Rushing through quickly'
      ],
      correctAnswer: 'B',
      explanation: 'Systematic problem-solving leads to better results and understanding.'
    }
  ];

  // Generate more questions based on the requested count
  const questions = [];
  for (let i = 0; i < Math.min(options.questionCount, 20); i++) {
    const baseQuestion = baseQuestions[i % baseQuestions.length];
    questions.push({
      ...baseQuestion,
      question: `${baseQuestion.question} (Question ${i + 1})`
    });
  }

  return {
    title: `${options.subject} Quiz`,
    description: `Quiz covering ${options.subject} concepts and applications`,
    questions: questions
  };
} 

export async function generateFlashcardsFromContent(
  content: string,
  options: {
    subject: string;
    cardCount: number;
  }
) {
  try {
    const ai = await initializeGoogleAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert flash card generator. Create flash cards based on the following content.

Content to analyze:
${content.substring(0, 8000)} // Limit content to avoid token limits

Requirements:
- Subject: ${options.subject}
- Number of flash cards: ${options.cardCount}
- Format: Question and Answer pairs
- Questions should be based on the actual content provided
- Make questions relevant and educational
- Focus on key concepts, definitions, and important facts from the content
- Questions should be clear and concise
- Answers should be accurate and informative

Please generate the flash cards in the following JSON format:
{
  "title": "Flash Card Set Title",
  "description": "Brief description of the flash card set",
  "cards": [
    {
      "question": "Clear, concise question based on the content",
      "answer": "Accurate and informative answer"
    }
  ]
}

Important:
- Only return valid JSON
- Base questions and answers on the actual content provided
- Make questions challenging but fair
- If content is insufficient, create general questions about the subject
- Ensure questions and answers are educational and helpful for learning
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const flashcardData = JSON.parse(jsonMatch[0]);
    
    // Validate the response
    if (!flashcardData.cards || !Array.isArray(flashcardData.cards)) {
      throw new Error('Invalid flash card format from AI');
    }

    return flashcardData;

  } catch (error) {
    console.error('Error generating flash cards with AI:', error);
    
    // Fallback to mock flash cards if AI fails
    return generateFallbackFlashcards(options);
  }
}

function generateFallbackFlashcards(options: {
  subject: string;
  cardCount: number;
}) {
  const baseCards = [
    {
      question: `What is the primary focus of ${options.subject}?`,
      answer: 'Understanding fundamental concepts and principles of the subject matter.'
    },
    {
      question: `Which approach is most effective for learning ${options.subject}?`,
      answer: 'Active practice, application, and regular review of concepts.'
    },
    {
      question: `What is a key challenge in mastering ${options.subject}?`,
      answer: 'Understanding complex relationships and applying theoretical knowledge to practical situations.'
    },
    {
      question: `In ${options.subject}, what does "analysis" typically involve?`,
      answer: 'Breaking down complex information into understandable parts and examining relationships between concepts.'
    },
    {
      question: `What is the best way to approach ${options.subject} problems?`,
      answer: 'Systematic problem-solving with a clear understanding of fundamental principles.'
    }
  ];

  // Generate more cards based on the requested count
  const cards = [];
  for (let i = 0; i < Math.min(options.cardCount, 20); i++) {
    const baseCard = baseCards[i % baseCards.length];
    cards.push({
      ...baseCard,
      question: `${baseCard.question} (Card ${i + 1})`
    });
  }

  return {
    title: `${options.subject} Flash Cards`,
    description: `Flash cards covering ${options.subject} concepts and applications`,
    cards: cards
  };
} 

export async function getGeminiChatResponse(message: string, history: Array<{role: string, content: string}>) {
  const ai = await initializeGoogleAI();
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  // Compose prompt with history for context
  const prompt =
    (history && history.length > 0
      ? history.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n') + '\n'
      : '') +
    `User: ${message}\nAI:`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    if (!text || text.trim().toLowerCase().includes('sorry')) {
      throw new Error('AI returned an empty or unhelpful response');
    }
    return text;
  } catch (err) {
    return "I'm having trouble connecting to my knowledge base or generating a response. Please try again later.";
  }
} 