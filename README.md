# JSTS - Time Tracking & Activity Management Platform

<div align="center">

**Track your time, achieve your goals, and connect with others on their productivity journey.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)](https://www.postgresql.org/)

</div>

---

## 🎯 Introduction

**JSTS** is a modern, full-stack time tracking and activity management application designed to help users monitor their activities, set and achieve goals, and stay motivated through gamification and social features.

Whether you're a student tracking study sessions, a professional managing work hours, or anyone looking to build better habits, JSTS provides an intuitive and engaging platform to visualize your progress and stay accountable.

### ✨ Key Features

- ⏱️ **Smart Timer**: Start, pause, and track activities in real-time with customizable activity templates
- 🎯 **Goal Management**: Set daily, weekly, and monthly goals and track your progress automatically
- 📊 **Visual Statistics**: View your productivity through heatmaps, charts, and streak tracking
- 🏆 **Gamification**: Earn points and unlock badges as you complete activities and achieve milestones
- 👥 **Social Features**: Share your achievements, connect with friends, and stay motivated together
- 📝 **Activity Records**: Manually add past activities or let the timer track them automatically
- 🎨 **Beautiful UI**: Modern, responsive design with dark mode support built with Radix UI and Tailwind CSS
- 🔒 **Secure Authentication**: Multiple sign-in options including email/password, GitHub, and Google OAuth

---

## 🏗️ Architecture

JSTS is built with a modern tech stack focused on performance, type safety, and developer experience:

### Frontend
- **Next.js 14** with App Router for server-side rendering and optimal performance
- **React 18** for building interactive user interfaces
- **TypeScript 5** for type-safe development
- **TanStack Query (React Query)** for efficient data fetching and caching
- **Radix UI** for accessible, unstyled UI components
- **Tailwind CSS** for utility-first styling
- **React Hook Form + Zod** for form management and validation

### Backend
- **Next.js API Routes** for RESTful endpoints
- **Server Actions** for optimized server-side operations
- **NextAuth.js v5** for authentication with JWT sessions
- **Prisma ORM** for type-safe database access
- **PostgreSQL** as the primary database

### Infrastructure
- **Cloudinary** for image hosting and optimization
- **Vercel** (deployment ready)
- **GitHub Actions** (CI/CD ready)

---

## 📦 Core Entities

### Activity Management
- **Phase**: Time-based activity sessions with start/end times, status tracking, and segments
- **ActivityTemplate**: Reusable templates for common activities (study, work, exercise, etc.)
- **Segment**: Individual time intervals within a phase for pause/resume functionality

### User Progress
- **Goal**: Daily, weekly, or monthly targets with automatic progress tracking
- **Point**: Gamification system rewarding activity completion, goal achievement, and social engagement
- **UserBadge**: Achievement system with various badge types

### Social Features
- **Post**: Share your achievements with optional phase attachments and images
- **Comment**: Engage with other users' posts
- **Like**: Show appreciation for others' progress
- **Friend**: Connect with other users

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- PostgreSQL database
- Cloudinary account (for image uploads)
- OAuth credentials (optional, for GitHub/Google login)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jsts.git
   cd jsts
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/jsts"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # OAuth Providers (Optional)
   AUTH_GITHUB_CLIENT_ID="your-github-client-id"
   AUTH_GITHUB_CLIENT_SECRET="your-github-client-secret"
   AUTH_GOOGLE_CLIENT_ID="your-google-client-id"
   AUTH_GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   # or for migrations
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📁 Project Structure

```
jsts/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (pages)/           # Page routes
│   │   │   ├── home/          # Dashboard
│   │   │   ├── timer/         # Timer functionality
│   │   │   ├── record/        # Manual activity recording
│   │   │   ├── profile/       # User profile & goals
│   │   │   ├── social/        # Social networking
│   │   │   ├── stats/         # Statistics & analytics
│   │   │   └── auth/          # Authentication pages
│   │   └── api/               # API routes
│   ├── features/              # Feature-based modules
│   │   ├── timer/
│   │   ├── record/
│   │   ├── profile/
│   │   ├── feed/
│   │   └── ...
│   ├── shared/                # Shared resources
│   │   ├── components/        # UI components
│   │   │   ├── ui/           # Radix UI components
│   │   │   └── commons/      # Shared components
│   │   ├── lib/              # Utilities & Prisma
│   │   ├── actions/          # Server Actions
│   │   ├── providers/        # React providers
│   │   └── layout/           # Layout components
│   ├── auth.ts               # NextAuth configuration
│   ├── auth.config.ts        # NextAuth callbacks
│   └── middleware.ts         # Route protection
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                    # Static assets
└── ...config files
```

---

## 🧪 Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run storybook        # Run Storybook
npm run build-storybook  # Build Storybook
```

### Testing

```bash
# Run unit tests with Vitest
npm run test

# Run E2E tests with Playwright
npm run test:e2e
```

### Database Management

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Create and apply migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio
```

---

## 🎨 Design System

JSTS uses a modern design system built on:
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **CVA (Class Variance Authority)**: Component variants
- **next-themes**: Seamless dark/light mode switching
- **Lucide Icons**: Beautiful, consistent iconography

View component documentation in Storybook:
```bash
npm run storybook
```

---

## 🔐 Authentication Flow

JSTS supports multiple authentication methods:

1. **Email/Password**: Traditional credentials-based authentication with bcrypt hashing
2. **GitHub OAuth**: Sign in with your GitHub account
3. **Google OAuth**: Sign in with your Google account
4. **Guest Mode**: Try the app without signing up

All authentication is handled by NextAuth.js with JWT session strategy, and routes are protected via Next.js middleware.

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Calendar view for activities
- [ ] Team/organization support
- [ ] Export data (CSV, PDF reports)
- [ ] Integration with third-party tools (Google Calendar, Notion, etc.)
- [ ] AI-powered insights and recommendations
- [ ] Public profiles and leaderboards
- [ ] Advanced analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Vercel](https://vercel.com/) for hosting and deployment
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Prisma](https://www.prisma.io/) for the excellent ORM
- All the open-source contributors who made this project possible

---

<div align="center">

**Built with ❤️ using Next.js, React, and TypeScript**

[Report Bug](https://github.com/yourusername/jsts/issues) · [Request Feature](https://github.com/yourusername/jsts/issues)

</div>
