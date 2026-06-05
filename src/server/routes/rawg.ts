import Elysia, { t } from 'elysia'

import { db } from '@server/db/client'
import { authGuard } from '../middleware/auth'
import jwt from '@elysiajs/jwt'

const RAWG_URL = 'https://api.rawg.io/api'
const RAWG_KEY = process.env.RAWG_API_KEY!

const PS4_ID = 18
const PS5_ID = 187
const SWITCH_ID = 7

const PLATFORM_IDS = [PS4_ID, PS5_ID, SWITCH_ID].join(',')

const cache = new Map<string, { data: any[]; updatedAt: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

export const rawgRoutes = new Elysia({ prefix: '/api/rawg' })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET! }))

  .use(
    new Elysia().guard(authGuard, app =>
      app
        .get(
          '/search',
          async ({ query }) => {
            const url = new URL(`${RAWG_URL}/games`)
            url.searchParams.set('key', RAWG_KEY)
            url.searchParams.set('search', query.q)
            url.searchParams.set('page_size', '5')
            url.searchParams.set('platforms', PLATFORM_IDS)

            const res = await fetch(url.toString())
            return res.json()
          },
          {
            query: t.Object({
              q: t.String()
            })
          }
        )
        .get('/game/:id', async ({ params }) => {
          const res = await fetch(
            `${RAWG_URL}/games/${params.id}?key=${RAWG_KEY}`
          )
          return res.json()
        })
        .get(
          '/top',
          async ({ query }) => {
            const genre = query.genre || 'all'

            const cacheKey = `top_${genre}`
            const now = Date.now()

            const cached = cache.get(cacheKey)
            if (cached && now - cached.updatedAt < CACHE_TTL) {
              return cached.data
            }

            const params = new URLSearchParams({
              key: RAWG_KEY,
              ordering: '-metacritic',
              page_size: '8',
              metacritic: '70,100',
              platforms: PLATFORM_IDS,
              dates: `2013-01-01,2026-12-31`
            })

            if (genre !== 'all') params.set('genres', genre)

            const res = await fetch(`${RAWG_URL}/games?${params}`)
            const data = (await res.json()) as { results?: any[] }
            const results = data.results || []

            const completed = await db.query.games.findMany({
              columns: { externalId: true }
            })
            const completedIds = new Set(completed.map(g => g.externalId))

            const filtered = results.filter(
              (g: any) => !completedIds.has(String(g.id))
            )

            cache.set(cacheKey, { data: filtered, updatedAt: now })

            return filtered
          },
          {
            query: t.Object({
              genre: t.Optional(t.String())
            })
          }
        )
    )
  )
