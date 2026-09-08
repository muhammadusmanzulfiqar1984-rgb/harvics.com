import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'

/**
 * Auth.js (next-auth) config for Harvics Meet.
 * Credentials provider for MVP; add Google/Email providers when ready.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        if (!email) return null
        const name = credentials?.name?.trim() || email.split('@')[0]
        const user = await prisma.user.upsert({
          where: { email },
          create: { email, name },
          update: { name },
        })
        return { id: user.id, email: user.email, name: user.name || name }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        ;(session.user as any).id = token.uid
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'harvics-meet-dev-secret',
}
