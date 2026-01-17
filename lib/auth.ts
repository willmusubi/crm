import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { username: credentials.username as string },
          include: { staff: true }
        })

        if (!user) {
          return null
        }

        if (user.status !== "active") {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        // 更新最后登录时间
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          name: user.name,
          email: user.username,
          username: user.username,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        token.role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string
        (session.user as any).username = token.username as string
        (session.user as any).role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
})
