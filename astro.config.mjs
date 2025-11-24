import { transformerColorizedBrackets } from '@shikijs/colorized-brackets';
import { defineConfig } from 'astro/config';

const scad = await fetch("https://raw.githubusercontent.com/shikijs/textmate-grammars-themes/ad2ae3ffd1196e80c68834ed167710f42aee66a7/packages/tm-grammars/grammars/openscad.json")
.then(r => r.text().then(JSON.parse));

export default defineConfig({
    markdown: {
        shikiConfig: {
            theme: "github-dark",
            langs: [scad],
            wrap: true,
            transformers: [transformerColorizedBrackets()],
        },
    },
});
