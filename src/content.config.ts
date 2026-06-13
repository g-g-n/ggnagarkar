import { defineCollection, z } from 'astro:content';

const writing = defineCollection({
  loader: () => [],
  schema: z.object({})
});

export const collections = { writing };
