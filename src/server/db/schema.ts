import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  score: text('score').notNull(),
  platform: text('platform'),
});
