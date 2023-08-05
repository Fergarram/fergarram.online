# Obscure - A static site generator for Obsidian vaults based on Elder.js 

[Live Demo](https://obscurity.wiki)

I needed a way to publish my exsiting Obsidian research vault so that new readers could explore it. I considered the existing [Obsidian publishing service](https://obsidian.md/publish) but I don't like how limited in terms of customizability it is.

Here's a list of essential features for me:

- Blazing fast
- SEO first
- No client-side routing
- Highly customizable
- Custom shortcodes

## Installation

```bash
# Download template with degit
degit git@github.com:Fergarram/obscure.git my-vault-site

# Create a symlink of your vault into the route folder
# NOTE: For some reason if the link is created outside the current folder it doesn't work. At least on MacOS.
cd my-vault-site/src/routes/default
ln -s /path/to/your/vault vault
cd ../../../

# Install dependencies and run watch server on localhost:3000
npm install
npm run dev
```

Currently, Obscure is still a WIP and should not be used in any serious way yet. I do plan to make this as accesible as possible, even for non-technical users. So here is a roadmap of how that may look:

## Roadmap to V1

If you don't see a feature you'd expect from Obsidian it means I already implemented it or I will not do it. Also, I marked with a "‼️" all the must features or all the features that the MVP needs which will allow me to push my research vault to obscurity.wiki; and I'm using "🗳" for all the needed features for [nuestro.voto](//fernando.works/projects/nuestro-voto).

- [ ] Cover most of [Obsidian MD specs](https://help.obsidian.md/How+to/Format+your+notes).
	- [x] ‼️ Strike through with `~~x~~` (fixed with [remark-gfm](https://github.com/remarkjs/remark-gfm))
	- [ ] Highlighting with `==x==` or `::x::`
	- [ ] Image resizing
	- [x] Automatic links (fixed with [remark-gfm](https://github.com/remarkjs/remark-gfm))
	- [x] Tables (fixed with [remark-gfm](https://github.com/remarkjs/remark-gfm))
	- [x] 🗳 Footnotes (fixed with [remark-gfm](https://github.com/remarkjs/remark-gfm))
	- [ ] Math
	- [ ] 🗳 Callouts
- [ ] Handle empty files
	- [x] ‼️ Show message instead of empty content.
	- [ ] Have the message be an option in `obscure.config.js`.
- [ ] Handle [embedded files](https://help.obsidian.md/How+to/Embed+files).
	- [ ] Markdown files: md;
	- [ ] Image files: png, jpg, jpeg, gif, bmp, svg;
		- [x] ‼️ Render img tag
		- [ ] 🗳 Render optional captions
		- [ ] 🗳 Use [Elder.js Images Plugin](https://github.com/Elderjs/plugins/tree/master/packages/images) to process embedded images.
	- [ ] Audio files: mp3, webm, wav, m4a, ogg, 3gp, flac;
	- [ ] 🗳 Video files: mp4, webm, ogv, mov, mkv;
	- [ ] 🗳 PDF files: pdf.
		- [ ] 🗳 Page index support
- [x] ‼️ Fix all critical bugs and @FIXME comments.
- [x] ‼️ Finish mobile styles.
- [x] ‼️ Implement search.
- [ ] 🗳 Show backlinks.
- [ ] 🗳 Add DRAFT prefix support.
- [ ] Obsidian notes (`%%`)
	- [x] ‼️ Toggle for user to show/hide notes.
	- [ ] Save user decision on local storage.
	- [ ] 🗳 Have that be an option in `obscure.config.js`.
	- [ ] 🗳 Parse notes content as markdown.
- [ ] 🗳 List generator shortcodes, render lists based on a query string, similar to the search bar in Obsidian.
- [ ] 🗳 General clean up, formalize project setup and make it easy to configure.
- [ ] 🗳 Generate tag pages which list all the files using the tag.
- [ ] ‼️ Add schema for breadcrumbs
- [ ] Highlight current file and collapse other folders to keep a nice view
	- [ ] Add an option in config to see how to deal with the sidebar auto-collapsing
- [ ] Use the search palette to suggest reading paths or related files - experiment first.

> ⚠️ Know in advance that I will NOT implement a graph view.

One of my personal uses for Obscure besides my personal research vault is to generate a wiki for [nuestro.voto](//fernando.works/projects/nuestro-voto). This means you can expect me to complete the roadmap above before the year 2022 ends.

I also intend this repository to be a template rather than a library. The reason behind this is that I like having full control of how it works for each site I'll use this for. Although, since I do plan to make this as open and friendly as it makes sense, I'll need to have an approach for upgradability. Here are some ideas for users who don't modify the actual UI components:

- Separate colors and theming into a config file
- Create a script that automatically pulls the latests components into your repository without overriding config files.
- Create a base set of components from which developers can create customized ones. I'll have to do some POCs for this.


## Further goals

As I mentioned, I intend to make this usable by programming-impaired users. To do so, I want to create either an Obsidian plugin or a "native" app that allows these users to pick a vault, customize their site settings, and have the app generate either a git repository that can be used to push this to netlify or any static web hosting service or something similar.

Here's the [Figma file](https://www.figma.com/file/S1H33ONKWWWsGL2n6zFTUc/Documentation-Template?node-id=0%3A1) where it all started.

It would also be cool to implement a sort of dashboard that allows people to suscribe to changes to a specific query. For exmaple, suscribe to all changes in notes that have a `📎` and are within 'x' directory. This would generate a list of links widget for the dashboard.
