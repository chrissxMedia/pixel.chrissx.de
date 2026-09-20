import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET() {
    const posts = (await getCollection("blog"))
        .filter((x) => x.data.pub < new Date())
        .sort((a, b) => b.data.pub.valueOf() - a.data.pub.valueOf());

    return rss({
        title: "pixel",
        description: "pixel's blog",
        site: "https://gock.dev",
        items: posts.map((p) => ({
            title: p.data.title,
            link: `/blog/${p.id}`,
            pubDate: p.data.pub,
        })),
    });
}
