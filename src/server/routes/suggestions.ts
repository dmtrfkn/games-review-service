import { turnstileGuard } from '@server/middleware/turnstile'
import { and, desc, eq, sql } from 'drizzle-orm'
import Elysia, { t } from 'elysia'
import { db } from '../db/client'
import { suggestions, suggestionVotes } from '../db/schema'
import { getClientIp, hashIp } from '../lib/utils'

export const suggestionRoutes = new Elysia({ prefix: '/api/suggestions' })
  .get('/', async () => {
    return db.query.suggestions.findMany({
      orderBy: desc(suggestions.votesCount)
    })
  })
  .use(
    new Elysia().guard(turnstileGuard, app =>
      app
        .post(
          '/',
          async ({ body }) => {
            const [created] = await db
              .insert(suggestions)
              .values({
                gameName: body.gameName,
                externalId: body.externalId,
                posterUrl: body.posterUrl,
                votesCount: 1
              })
              .returning()

            return created
          },
          {
            body: t.Object({
              gameName: t.String(),
              externalId: t.String(),
              posterUrl: t.Optional(t.String())
            })
          }
        )
        .post('/:id/vote', async ({ params, request, set }) => {
          const suggestionId = parseInt(params.id)
          const ipHash = hashIp(getClientIp(request))

          const suggestion = await db.query.suggestions.findFirst({
            where: eq(suggestions.id, suggestionId)
          })

          if (!suggestion) {
            set.status = 404
            return { message: 'Suggestion not found' }
          }

          const existing = await db.query.suggestionVotes.findFirst({
            where: and(
              eq(suggestionVotes.suggestionId, suggestionId),
              eq(suggestionVotes.ipHash, ipHash)
            )
          })

          if (existing) {
            set.status = 409
            return { message: 'Already voted' }
          }

          await db.insert(suggestionVotes).values({ suggestionId, ipHash })

          await db
            .update(suggestions)
            .set({ votesCount: sql`${suggestions.votesCount} + 1` })
            .where(eq(suggestions.id, suggestionId))

          return { success: true }
        })
    )
  )
