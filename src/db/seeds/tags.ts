import { db } from '../client';
import { tags } from '../schema/rpg-group';

export async function seedTags() {
  await db
    .insert(tags)
    .values([
      { name: 'fantasia' },
      { name: 'terror' },
      { name: 'vampiro' },
      { name: 'investigacao' },
      { name: 'medieval' },
    ])
    .onConflictDoNothing();
}
