import 'dotenv/config'
import type { Context } from 'elysia'
import { t } from 'elysia'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export const turnstileGuard = {
  headers: t.Object({
    'cf-turnstile-token': t.String()
  }),

  async beforeHandle(ctx: Context) {
    const token = ctx.headers['cf-turnstile-token']

    console.log('Token received:', token?.slice(0, 20) + '...')
    console.log(
      'Secret key:',
      process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY?.slice(0, 10) + '...'
    )

    if (!token) {
      return ctx.status(400)
    }

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY!,
        response: token
      })
    })

    const data = (await res.json()) as { success: boolean }

    console.log('Turnstile response:', data)

    if (!data.success) {
      return ctx.status(403, { error: 'Invalid captcha', details: data })
    }
  }
}
