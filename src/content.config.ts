import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const courses = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/courses" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    longDescription: z.string().optional(),
    price: z.number(),
    originalPrice: z.number().optional(),
    currency: z.string().default("USD"),
    duration: z.string(),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    modules: z.number(),
    lessons: z.number(),
    image: z.string(),
    instructor: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    comingSoon: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/testimonials" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    avatar: z.string().optional(),
    quote: z.string(),
    rating: z.number().min(1).max(5),
    course: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
});

export const collections = { courses, testimonials, blog };
