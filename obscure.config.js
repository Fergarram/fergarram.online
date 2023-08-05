module.exports = {
    useTableOfContents: true,
    useSyntaxHighlighting: {
        theme: "css-variables", // available themes: https://github.com/shikijs/shiki/
    },
    routes: [
        {
            name: "default", // route name
            title: "Obscurity.Wiki", // Used as a base for the site title when needed.
            description:
                "A public Obsidian vault with all my independent research on Cognitive Engineering, OS Development and Design, and Complexity.", // Used as a base for the site description when needed.
            author: "Fernando Garcia", // When frontmatter has no author this is used.
            prefix: "", // Default
            home: "readme", // Default
            folderIndex: "same-as-parent", // Default is 'index'
            mediaFolder: "/Media", // Default ?
            locale: "en_US", // Used for meta prop for SEO
        },
    ],
};
