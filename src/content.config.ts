import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "blog" }),
    schema: z.object({
        title: z.string(),
        pub: z.coerce.date(),
        lang: z.enum(["en", "de"]),
    }),
});
export const collections = { blog };
