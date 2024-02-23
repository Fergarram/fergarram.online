# Are.na blog maker thing

So this tool kinda just appeared on my mind one night as a vision.

As I chased this vision I realized that god wanted me to blog like when I was 13.

And this is it. It's a simple static site genertor.

I like to see it as an are.na blog maker.

Or a feed/timeline/log/journal that works based on are.na channels and blocks.

See it as you will.

Just deploy it here:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFergarram%2Ffergarram.online&env=DANGER_ARENA_TOKEN,SITE_CHANNEL_ID,IS_VERCEL,THEME&envDescription=Click%20the%20%22Learn%20More%22%20button%20to%20see%20available%20themes%20and%20other%20instructions.&envLink=https%3A%2F%2Fgithub.com%2FFergarram%2Ffergarram.online&project-name=arena-blog&repository-name=arena-blog&demo-url=https%3A%2F%2Ffergarram.online)

## Env Variables

### `DANGER_ARENA_TOKEN`
You can [get your auth token here](https://arena-token-gen.vercel.app/).

### `SITE_CHANNEL_ID`
Simple. It's the last part of your channel url. In my case I'm using `are.na/fergarram/fergarram-online` so I would use `fergarram-online`.

### `IS_VERCEL`
Just set it to `true`.

### `THEME`
Choose a theme. There are 5 options currently avaialbe:

- `default` like fergarram.online
- `emo-kitty`
- `olive`
- `dark-olive`
- `not-hacker-news`

You can change all these variables after deployment by going to the [vercel enviroment settings](https://vercel.com/docs/projects/environment-variables)

### Optional `UTC_OFFSET`
There is an optional little clock on the top right of the page. To get the UTC offset of your city you can use [this tool](https://www.timeanddate.com/time/zone/mexico/mexico-city). Find the part that says `Current Offset: UTC/GMT -6 hours`. The offset is `-6` in my case for Mexico City.


## Local Development

Copy the `.env.sample` into `.env` and replace with your values as shown above.

```
DANGER_ARENA_TOKEN=XXXXXXX
IS_VERCEL=false
SITE_CHANNEL_ID=unique-slug-or-id-number
UTC_OFFSET=-6
```

Note that `IS_VERCEL` is set to `false` here.

You'll need the latest LTS version of node. Specifically because I use `fetch`.

If you don't have node installed you can [download it here](https://nodejs.org/en/download).

If you have `nvm` installed than you can use that instead (`nvm install --lts`).

Once installed just run:

```bash
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
