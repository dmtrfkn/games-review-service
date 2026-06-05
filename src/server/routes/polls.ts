import { turnstileGuard } from '@server/middleware/turnstile'
import { and, eq, sql } from 'drizzle-orm'
import Elysia from 'elysia'
import { db } from '../db/client'
import { polls, pollVotes } from '../db/schema'
import { getClientIp, hashIp } from '../lib/utils'

export const pollRoutes = new Elysia({ prefix: '/api/polls' })
  .get('/', async () => {
    return db.query.polls.findMany({
      where: eq(polls.isActive, true)
    })
  })
  .use(
    new Elysia().guard(turnstileGuard, app =>
      app.post('/:id/vote', async ({ params, request, set }) => {
        const pollId = parseInt(params.id)
        const ipHash = hashIp(getClientIp(request))

        const poll = await db.query.polls.findFirst({
          where: eq(polls.id, pollId)
        })

        if (!poll) {
          set.status = 404
          return { message: 'Poll not found' }
        }

        const existing = await db.query.pollVotes.findFirst({
          where: and(eq(pollVotes.pollId, pollId), eq(pollVotes.ipHash, ipHash))
        })

        if (existing) {
          set.status = 409
          return { message: 'Already voted' }
        }

        await db.insert(pollVotes).values({ pollId, ipHash })

        await db
          .update(polls)
          .set({ votesCount: sql`${polls.votesCount} + 1` })
          .where(eq(polls.id, pollId))

        return { success: true }
      })
    )
  )
