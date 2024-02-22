# Are.na blog maker thing

So this tool kinda just appeared on my mind one night as a vision.

As I chased this vision I realized that god wanted me to blog like when I was 13.

And this is it. It's a simple static site genertor.

I like to see it as an are.na blog maker.

Or a feed/timeline/log/journal that works based on are.na channels and blocks.

See it as you will.

## Automated Setup

Just click the button below and configure the corresponding enviroment variables. You'll need to have your personal [arena auth token](https://dev.are.na/), your are.na channel slug, and set the `IS_VERCEL` variable to `true`.

If you're unsure about how to get the channel slug just look at the last part of the channel url. i.e. In my case I'm using `are.na/fergarram/fergarram-online` so I would use `fergarram-online`.


## Local Development

### 1. Create `.env` file

You can use the `.env.sample`.

```
DANGER_ARENA_TOKEN=XXXXXXX
IS_VERCEL=false
SITE_CHANNEL_ID=unique-slug-or-id-number
```

Replace the arena token with your app token in [dev.are.na](https://dev.are.na/).

For the channel id you can just copy the last part of the channel you want to use as a website. In my case I'm using `are.na/fergarram/fergarram-online` so I would use `fergarram-online`.

You'll need the latest LTS version of node. Specifically because I use `fetch`.

If you don't have node installed you can [download it here](https://nodejs.org/en/download).

If you have `nvm` installed than you can use that instead.

```bash
nvm install --lts
node server.js
```

Running that will generate html files in the `public` directory.

Just open the `public/index.html` with your browser.

And that's it.

There aren't really any dependencies, it's just a node script that you run to build the html pages.

If you don't want to be running `node server.js` everytime you can use `nodemon`:

```bash
npm i -g nodemon
nodemon server.js
```

Hopefully this is simple enough.