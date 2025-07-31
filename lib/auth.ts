import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDb } from "./mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        type: { label: "Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const db = await getDb();
        const users = db.collection("users");
        
        // Find user by email
        const user = await users.findOne({ email: credentials.email });
        
        if (!user) {
          return null;
        }

        // Check if user has a password (traditional user)
        if (!user.password) {
          return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValidPassword) {
          return null;
        }

        // Check if user type matches (student/admin)
        if (credentials.type && user.role !== credentials.type) {
          return null;
        }

        // Update last login
        await users.updateOne(
          { email: credentials.email },
          {
            $set: {
              lastLogin: new Date(),
              loginMethod: "credentials"
            }
          }
        );

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image
        };
      }
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Log for debugging
      console.log('Redirect callback:', { url, baseUrl });
      
      // If we're already on the dashboard, don't redirect
      if (url.includes('/dashboard')) {
        return url;
      }
      
      // Always redirect to dashboard for successful logins
      const redirectUrl = '/dashboard';
      console.log('Redirecting to:', redirectUrl);
      return redirectUrl;
    },
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        const db = await getDb();
        const users = db.collection("users");
        
        // Check if user already exists by email
        const existingUser = await users.findOne({ email: user.email });
        
        if (existingUser) {
          // User exists, update their Google OAuth info and return true
          await users.updateOne(
            { email: user.email },
            {
              $set: {
                googleId: profile.sub,
                image: user.image,
                lastLogin: new Date(),
                loginMethod: "google"
              }
            }
          );
          return true;
        } else {
          // New user, create account with student role
          const newUser = {
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: profile.sub,
            role: "student", // Default to student role
            createdAt: new Date(),
            lastLogin: new Date(),
            loginMethod: "google",
            // Add any other default fields for new users
            isActive: true,
            preferences: {}
          };
          
          await users.insertOne(newUser);
          return true;
        }
      }
      return true;
    },
    async session({ session, user, token }: any) {
      if (session?.user?.email) {
        const db = await getDb();
        const users = db.collection("users");
        const dbUser = await users.findOne({ email: session.user.email });
        
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.role = dbUser.role;
          session.user.name = dbUser.name;
          session.user.image = dbUser.image;
        } else {
          // If user not found in database, set default role
          session.user.role = "student";
        }
      }
      return session;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      } else if (token?.email) {
        // For Google OAuth, fetch user role from database
        const db = await getDb();
        const users = db.collection("users");
        const dbUser = await users.findOne({ email: token.email });
        
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id.toString();
        } else {
          // Default to student role if user not found
          token.role = "student";
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development',
};

export default NextAuth(authOptions); 