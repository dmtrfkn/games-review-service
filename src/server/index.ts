import Elysia from 'elysia'
import { authRoutes } from './routes/auth'
import { genresRoutes } from './routes/genres'
import { gameRoutes } from './routes/games'
import { pollRoutes } from './routes/polls'
import { suggestionRoutes } from './routes/suggestions'
import { rawgRoutes } from './routes/rawg'

const app = new Elysia()

app.use(authRoutes)
app.use(genresRoutes)
app.use(gameRoutes)
app.use(pollRoutes)
app.use(suggestionRoutes)
app.use(rawgRoutes)

app.listen(4200, () => {
  console.log('Server running on http://localhost:4200')
})
