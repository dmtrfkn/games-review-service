import Elysia from 'elysia'
import { db } from '../db/client'

export const genresRoutes = new Elysia({ prefix: '/api/genres' }).get(
  '/',
  () => {
    db.query.genres.findMany()
  }
)
