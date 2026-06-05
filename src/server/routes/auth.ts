import jwt from '@elysiajs/jwt'
import Elysia, { t } from 'elysia'
import { db } from '../db/client'
import { eq } from 'drizzle-orm'
import { admins } from '../db/schema'

export const authRoutes = new Elysia({ prefix: '/api/auth' }).use(
  jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET!
  })
    .post(
      '/login',
      async ({ body, jwt, cookie: { accessToken } }) => {
        const admin = await db.query.admins.findFirst({
          where: eq(admins.username, body.username)
        })

        if (!admin || !Bun.password.verify(body.password, admin.passwordHash)) {
          throw new Error('Invalid credentials')
        }

        const token = await jwt.sign({ id: admin.id })

        accessToken.set({
          value: token,
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 3,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
        return { success: true }
      },
      {
        body: t.Object({
          username: t.String(),
          password: t.String()
        })
      }
    )
    .post('/logout', async ({ cookie: { accessToken } }) => {
      accessToken.remove()
      return { success: true }
    })
)
