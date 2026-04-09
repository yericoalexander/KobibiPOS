import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Role } from "@prisma/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !(await bcrypt.compare(credentials.password as string, user.password as string))) {
          throw new Error("Invalid email or password");
        }

        if (!user.active) {
          throw new Error("User account is inactive");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeId: user.storeId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.storeId = (user as any).storeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as Role;
        (session.user as any).storeId = token.storeId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})
