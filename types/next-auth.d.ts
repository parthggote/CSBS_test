import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: "student" | "admin";
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: "student" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "student" | "admin";
  }
} 