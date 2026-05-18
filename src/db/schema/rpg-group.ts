import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';
import { tags } from './tag';
import { users } from './user';

export const nivelEnum = pgEnum('nivel', ['novato', 'experiente']);

export const platformEnum = pgEnum('platform', [
  'presencial',
  'online',
  'hibrido',
]);

export const rpgGroups = pgTable('rpg_groups', {
  id: uuid().defaultRandom().primaryKey(),

  name: varchar({ length: 255 }).notNull().unique(),
  description: text().notNull(),

  genre: varchar({ length: 100 }).notNull(),

  nivel: nivelEnum('nivel').notNull(),

  maxPlayers: integer().notNull(),
  currentPlayers: integer().notNull(),

  schedule: varchar({ length: 255 }).notNull(),
  platform: platformEnum('platform').notNull(),

  location: varchar({ length: 255 }),

  image: varchar({ length: 255 }),

  masterId: uuid().notNull(),

  createdAt: timestamp().defaultNow().notNull(),
});

export const rpgGroupTags = pgTable('rpg_group_tags', {
  id: uuid().defaultRandom().primaryKey(),

  groupId: uuid()
    .notNull()
    .references(() => rpgGroups.id),
  tagId: uuid()
    .notNull()
    .references(() => tags.id),
});

export const rpgMembers = pgTable('rpg_members', {
  id: uuid().defaultRandom().primaryKey(),

  rpgGroupId: uuid()
    .notNull()
    .references(() => rpgGroups.id),
  memberId: uuid()
    .notNull()
    .references(() => users.id),
});
