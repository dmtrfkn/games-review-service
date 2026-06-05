import { and, desc, eq, ilike } from 'drizzle-orm'
import Elysia, { t } from 'elysia'
import { db } from '../db/client'
import { games, genres } from '../db/schema'
import { authGuard } from '../middleware/auth'
import jwt from '@elysiajs/jwt'

export const gameRoutes = new Elysia({ prefix: '/api/games' })
  .get(
    '/',
    async ({ query }) => {
      const conditions = []

      if (query.genreSlug) {
        const genre = await db.query.genres.findFirst({
          where: eq(genres.slug, query.genreSlug)
        })
        if (genre?.id) {
          conditions.push(eq(games.genreId, genre.id))
        }
      }

      if (query.search) {
        conditions.push(ilike(games.title, `%${query.search}%`))
      }

      return db.query.games.findMany({
        with: { genre: true },
        where: conditions.length ? and(...conditions) : undefined,
        orderBy: desc(games.completedAt)
      })
    },
    {
      query: t.Object({
        genreSlug: t.Optional(t.String()),
        search: t.Optional(t.String())
      })
    }
  )

  .get('/:slug', async ({ params, set }) => {
    const game = await db.query.games.findFirst({
      with: { genre: true },
      where: eq(games.slug, params.slug)
    })

    if (!game) {
      set.status = 404
      return { message: 'Game not found' }
    }

    return game
  })

  .use(
    new Elysia()
      .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))
      .guard(authGuard, app =>
        app
          .post(
            '/',
            async ({ body, set }) => {
              try {
                const existingByExternalId = await db.query.games.findFirst({
                  where: eq(games.externalId, body.externalId),
                  columns: {
                    id: true,
                    title: true,
                    slug: true
                  }
                })

                if (existingByExternalId) {
                  set.status = 409
                  return {
                    error: `Игра уже добавлена: ${existingByExternalId.title}`,
                    existingGameId: existingByExternalId.id,
                    existingGameSlug: existingByExternalId.slug
                  }
                }

                const [created] = await db
                  .insert(games)
                  .values({
                    ...body,
                    completedAt: new Date(body.completedAt)
                  })
                  .returning()

                return created
              } catch (e: any) {
                console.log('DB Error:', e.cause?.message || e.message)
                set.status = 500
                return { error: 'Не удалось добавить игру' }
              }
            },
            {
              body: t.Object({
                externalId: t.String(),
                title: t.String(),
                slug: t.String(),
                posterUrl: t.Optional(t.String()),
                subjectiveScore: t.String(),
                metaScore: t.Optional(t.Number()),
                review: t.Optional(t.String()),
                platform: t.Optional(t.String()),
                genreId: t.Number(),
                completedAt: t.String({ format: 'date-time' })
              })
            }
          )

          .delete('/:id', async ({ params, set }) => {
            const id = parseInt(params.id)

            if (isNaN(id)) {
              set.status = 400
              return { message: 'Invalid id' }
            }

            await db.delete(games).where(eq(games.id, id))

            return { success: true }
          })
      )
  )
