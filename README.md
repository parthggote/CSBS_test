# CSBS Platform

A modern web platform built with Next.js for the Computer Science and Business Systems community. This platform provides resources, events management, forums, and administrative features for CSBS students and faculty.

## Features

- 📚 Resource Management (PYQs, Certifications, Hackathons)
- 🎯 Events Portal
- 💬 Community Forum
- 📰 Newsletter System
- 👤 User Authentication
- 🎨 Modern UI with Radix Components
- 🌙 Dark Mode Support

## Tech Stack

- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Authentication:** JWT
- **Database:** MongoDB
- **Animations:** Lottie, Spline

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/parthggote/CSBS_test.git
cd csbs-platform
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Set up environment variables
Create a `.env` file in the root directory and add:
```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
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
├── app/                # Next.js app directory
│   ├── api/           # API routes
│   ├── components/    # Page-specific components
│   └── ...           # Various page routes
├── components/        # Shared components
│   └── ui/           # UI components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and configurations
└── public/           # Static assets
```

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and maintained by the CSBS community.
