import rss from "@astrojs/rss";
import { getCollection, render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

export async function GET() {
    const posts = (await getCollection("blog"))
        .filter((x) => x.data.pub < new Date())
        .sort((a, b) => b.data.pub.valueOf() - a.data.pub.valueOf());

    const container = await AstroContainer.create();

    return rss({
        title: "pixel",
        description: "pixel's blog",
        site: "https://gock.dev",
        items: await Promise.all(
            posts.map(async (p) => {
                const { Content } = await render(p);
                return {
                    title: p.data.title,
                    link: `/blog/${p.id}`,
                    pubDate: p.data.pub,
                    content: await container.renderToString(Content),
                };
            }),
        ),
    });
}
