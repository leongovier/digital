import { defineCollection, z } from 'astro:content';

const projectRef = z.object({
  title: z.string(),
  slug: z.string(),
});

const phase = z.object({
  name: z.string(),
  pct: z.number(),
  accent: z.boolean().optional(),
});

const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleAccents: z.array(z.string()).optional(),
    lede: z.string(),
    role: z.string(),
    year: z.string(),
    team: z.string(),
    scope: z.string(),
    tag: z.string(),
    tags: z.array(z.string()).optional(),
    phases: z.array(phase).length(4).optional(),
    cardDescription: z.string(),
    cardArt: z.enum(['laptop', 'mobile', 'grid', 'type']).default('laptop'),
    eyebrow: z.string().optional(),
    order: z.number().optional(),
    draft: z.boolean().optional().default(false),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    heroBrowserUrl: z.string().optional(),
    heroBrowserUrlAccent: z.string().optional(),
    heroCaption: z.string().optional(),
    heroCaptionLabel: z.string().optional(),
    prevProject: projectRef.optional(),
    nextProject: projectRef.optional(),
  }),
});

export const collections = { work };
