import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { tags } from './tag';

export const users = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  nickname: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});

export const userInterests = pgTable('user_interests', {
  id: uuid().defaultRandom().primaryKey(),

  userId: uuid()
    .notNull()
    .references(() => users.id),
  tagId: uuid()
    .notNull()
    .references(() => tags.id),
});
