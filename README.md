# CSBS Platform

A modern web platform built with Next.js for the Computer Science and Business Systems community. This platform provides resources, events management, forums, and administrative features for CSBS students and faculty.

## Features

- 📚 Resource Management (PYQs, Certifications, Hackathons)
- 🎯 Events Portal
- 💬 Community Forum
- 📰 Newsletter System
- 🔐 **Advanced Authentication System**
  - Google OAuth integration
  - Traditional email/password login
  - Smart account linking (prevents user duplication)
  - Role-based access control (Student/Admin)
- 🤖 **AI-Powered Learning Tools**
  - AI-generated quizzes using Google Gemini
  - AI-generated flashcards for study materials
  - Intelligent content generation from PDFs and text
- 🎨 Modern UI with Radix Components
- 🌙 Dark Mode Support
- 📱 Responsive Design
- 🔔 Toast Notifications
- ⭐ "New" Content Badges

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Authentication:** NextAuth.js (Google OAuth + Credentials)
- **Database:** MongoDB
- **File Storage:** MongoDB GridFS
- **AI Integration:** Google Gemini AI
- **Password Hashing:** bcryptjs
- **Animations:** Lottie, Spline

## Recent Updates (Latest Release)

### 🔐 Authentication System Overhaul
- **Migrated from JWT to NextAuth.js** for better security and ease of use
- **Implemented Google OAuth** with proper user account linking
- **Fixed traditional email/password login** with secure password hashing
- **Prevented user duplication** - existing users can sign in with Google using the same email
- **Enhanced security** with proper session management and middleware protection

### 🎯 Quiz & Flashcard System Improvements
- **Fixed routing issues** - quizzes and flashcards are now immediately visible after generation
- **Improved user experience** - no more forced redirects, users can attempt quizzes whenever they want
- **Added "New" badges** for recently created content (within 24 hours)
- **Enhanced error handling** with toast notifications instead of alerts
- **Better content organization** with proper access control

### 🛠 Technical Improvements
- **Updated authentication middleware** to prevent infinite redirect loops
- **Fixed React Hooks order violations** for better performance
- **Improved API security** with proper NextAuth integration
- **Enhanced type safety** with NextAuth TypeScript declarations
- **Optimized database queries** and user experience

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- MongoDB database
- Google OAuth credentials (for Google sign-in)

### Installation

1. Clone the repository
```bash
git clone https://github.com/parthggote/CSBS_test.git
cd CSBS_test
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory and add:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (for Google sign-in)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google AI (for quiz/flashcard generation)
GOOGLE_API_KEY=your_google_ai_api_key
```

4. Run the development server
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth.js authentication routes
│   │   ├── quiz-generation/    # AI quiz generation
│   │   ├── flashcard-generation/ # AI flashcard generation
│   │   └── ...           # Other API endpoints
│   ├── admin/            # Admin dashboard
│   ├── dashboard/        # Student dashboard
│   ├── login/           # Authentication pages
│   └── ...              # Various page routes
├── components/           # Shared components
│   ├── ui/              # UI components
│   ├── session-provider.tsx  # NextAuth session provider
│   └── navigation.tsx   # Global navigation
├── hooks/               # Custom React hooks
│   └── use-auth.ts      # Authentication hook
├── lib/                 # Utility functions and configurations
│   ├── auth.ts          # NextAuth.js configuration
│   └── mongodb.ts       # Database connection
├── types/               # TypeScript type definitions
│   └── next-auth.d.ts   # NextAuth type extensions
├── middleware.ts        # Route protection middleware
└── public/              # Static assets
```

## Authentication Features

### Google OAuth
- One-click sign-in with Google account
- Automatic account creation for new users (assigned "student" role)
- Smart linking for existing users (prevents duplicate accounts)

### Traditional Login
- Secure email/password authentication
- Password hashing with bcryptjs
- Role-based access control

### Session Management
- Persistent sessions across browser sessions
- Automatic redirect to appropriate dashboard based on user role
- Secure logout functionality

## AI-Powered Features

### Quiz Generation
- Generate quizzes from uploaded PDFs or text input
- Multiple choice questions with explanations
- Automatic difficulty assessment
- Immediate availability after generation

### Flashcard Generation
- Create study flashcards from learning materials
- Organized flashcard sets
- Easy review and study interface

## Development

### Commands

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

This project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- NextAuth.js for authentication
- Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and maintained by the CSBS community.
