import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "./prisma";
import { resolveCollegeForEmail } from "./college-domain";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Email & Password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase(),
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!valid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          collegeId: user.collegeId,
        };
      },
    }),
  ],

  callbacks: {
    async signIn() {
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as any).role;
        token.collegeId = (user as any).collegeId;
      }

      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: token.email,
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.collegeId = dbUser.collegeId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).collegeId = token.collegeId;
      }

      return session;
    },
  },

  events: {
    async createUser({ user }) {
      if (!user.email) return;

      const { role, collegeId } = await resolveCollegeForEmail(user.email);

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          role,
          collegeId,
        },
      });
    },
  },

  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },

  secret: process.env.NEXTAUTH_SECRET,
};