import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean
} from 'drizzle-orm/pg-core'

export const genres = pgTable('genres', {
  id: serial('id').primaryKey(),

  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').notNull().unique(),

  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  posterUrl: text('poster_url'),
  platform: text('platform'),

  subjectiveScore: text('subjective_score').notNull(),
  metaScore: integer('meta_score'),
  review: text('review'),

  completedAt: timestamp('completed_at').notNull().defaultNow(),

  genreId: integer('genre_id')
    .notNull()
    .references(() => genres.id, {
      onDelete: 'cascade'
    }),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// Предложка

export const suggestions = pgTable('suggestions', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').notNull().unique(),

  gameName: text('game_name').notNull(),
  posterUrl: text('poster_url'),

  votesCount: integer('votesCount').notNull().default(0),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const suggestionVotes = pgTable('suggestions_votes', {
  id: serial('id').primaryKey(),
  suggestionId: integer('suggestion_id')
    .notNull()
    .references(() => suggestions.id, {
      onDelete: 'cascade'
    }),

  ipHash: text('ip_hash').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const polls = pgTable('polls', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),

  votesCount: integer('votes_count').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const pollVotes = pgTable('poll_votes', {
  id: serial('id').primaryKey(),
  pollId: integer('poll_id')
    .notNull()
    .references(() => polls.id, {
      onDelete: 'cascade'
    }),

  ipHash: text('ip_hash').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),

  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
