const fs = require('fs');
const path = require('path');


if (!process.env.IS_VERCEL) load_env();
generate_site();

async function load_user() {
  const target_url = `https://api.are.na/v2/me`;

  try {
    const response = await fetch(target_url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.DANGER_ARENA_TOKEN}`,
      },
    });

    const user = await response.json();

    console.log("Found user:", user.full_name);
    return user;

  } catch (e) {
    console.error("FUCK, FAILED TO GET USER DATA.", e);
  }
}

async function get_channel_contents(id) {
  const endpoint = `https://api.are.na/v2/channels/${id}/contents?page=1&per=100&direction=desc`;
  return await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.DANGER_ARENA_TOKEN}`,
    },
  });
}

async function get_channel_info(id) {
  const endpoint = `https://api.are.na/v2/channels/${id}/thumb`;
  return await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.DANGER_ARENA_TOKEN}`,
    },
  });
}

async function generate_site() {
  try {
    const user_session = await load_user();

    const site_channel = await get_channel_info("fergarram-online");
    const site_details = await site_channel.json();

    const response = await get_channel_contents("fergarram-online");
    const { contents } = await response.json();

    const global_placeholders = {
      site_title: "fergarram.online",
      site_arena: `https://are.na/${user_session.slug}/${site_details.slug}/`,
      site_description: `${user_session.full_name}'s generated are.na site.`,
      site_author: user_session.full_name,
      site_author_url: `https://are.na/${user_session.slug}/`,
    };
    
    const channels = contents.filter(b => b.class === "Channel");

    const generate_posts_for_page = (contents, parent) => {
      let article_list = contents.length === 0 ? `<p class="empty-state">Nothing yet.</p>` : "";
      contents.forEach(block => {
        if (block.class !== "Text" && block.class !== "Image") return;

        const placeholders = {
          ...global_placeholders,
          url: block.title ? `/${slugify(block.title)}.html` : '',
          title: block.title || "untitled block",
          author: block.user.full_name,
          author_url: `https://are.na/${block.user.slug}/`,
          description: block.description,
          content: block.content_html,
          image: block.class === "Image" ? block.image.display.url : "",
          created_at: format_date(block.created_at),
          updated_at: format_date(block.updated_at),
          nav_links: channels.reduce((acc, b) => {
            const tag = `<a href="${slugify(b.title)}.html" class="${parent === b.slug ? 'active' : ''}">${b.title}</a>`;
            return acc + tag;
          }, `<a href="/" class="${parent === "index" ? 'active' : ''}">About</a>`),
        }

        if (placeholders.title && placeholders.description) {
          if (!placeholders.image) create_page("post.html", placeholders, `public${placeholders.url}`);
          article_list += `
            <article class="full-post">
              <header>
                <h1>${placeholders.title}</h1>
                <p>Last updated: ${placeholders.updated_at}</p>
              </header>
              ${placeholders.image ? `<img alt="" src="${placeholders.image}" />` : ""}
              ${placeholders.description}
              ${!placeholders.image ? `<a href="${placeholders.url}">READ NOW</a>` : ""}
              <p style="font-style: italic; opacity: 0.5;">
                — Connected by <a href="${placeholders.author_url}">${placeholders.author}</a>, ${placeholders.created_at}.
              </p>
            </article>
          `;
        } else {
          article_list += `
            <article class="little-post">
              ${placeholders.image ? `<img alt="" src="${placeholders.image}" />` : placeholders.content}
              <p style="font-style: italic; opacity: 0.5;">
                — Connected by <a href="${placeholders.author_url}">${placeholders.author}</a>, ${placeholders.created_at}.
              </p>
            </article>
          `;
        }
      });

      return article_list;
    };

    // Create timeline page
    create_page(
      "index.html",
      {
        ...global_placeholders,
        page_description: site_details.metadata.description ? `<div class="page-description"><p>${site_details.metadata.description}</p><a href="https://are.na/${site_details.owner_slug}/${site_details.slug}">subscribe 🔔</a></div>` : "",
        nav_links: channels.reduce((acc, b) => {
          const tag = `<a href="${slugify(b.title)}.html">${b.title}</a>`;
          return acc + tag;
        }, `<a href="/" class="active">About</a>`),
        articles: generate_posts_for_page(contents, "index")
      },
      "public/index.html"
    );

    // Create all other pages
    channels.forEach(async (channel) => {
      const response = await get_channel_contents(channel.id);
      const { contents } = await response.json();
      const details_response = await get_channel_info(channel.id);
      const details = await details_response.json();
      create_page(
        "index.html",
        {
          ...global_placeholders,
          articles: generate_posts_for_page(contents, channel.slug),
          page_description: details.metadata.description ? `<div class="page-description"><p>${details.metadata.description}</p><a href="https://are.na/${details.owner_slug}/${details.slug}">subscribe 🔔</a></div>` : "",
          nav_links: channels.reduce((acc, b) => {
            const tag = `<a href="${slugify(b.title)}.html" class="${channel.slug === b.slug ? 'active' : ''}">${b.title}</a>`;
            return acc + tag;
          }, `<a href="/">About</a>`)
        },
        `public/${slugify(channel.title)}.html`
      );
    });

  } catch (e) {
    console.error("FUCK, FAILED TO GET ARENA CONTENT.", e);
  }
}

async function create_page(template, placeholders, out) {
  let html = await fs.promises.readFile(template, 'utf8');

  Object.keys(placeholders).forEach(key => {
    const placeholder = `{{{${key}}}}`;
    html = html.replaceAll(placeholder, placeholders[key]);
  });

  await fs.promises.writeFile(out, html);
  console.log(`"${out}" was created.`);
}

function format_date(str) {
  const date = new Date(str);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const day_of_week = days[date.getDay()];
  const month = months[date.getMonth()];
  const day_of_month = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day_of_week} ${month} ${day_of_month} ${year} at ${hours}:${minutes}`;
}

function slugify(str) {
  str = str.replace(/^\s+|\s+$/g, "");

  // Make the string lowercase
  str = str.toLowerCase();

  str = str.replace("'", "");

  // Remove accents, swap ñ for n, etc
  const from =
    "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
  const to =
    "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  // Remove invalid chars
  str = str
    .replace(/[^a-z0-9 -]/g, "")
    // Collapse whitespace and replace by -
    .replace(/\s+/g, "-")
    // Collapse dashes
    .replace(/-+/g, "-");

  return str;
}

function load_env() {
  try {
    // Read the .env file content
    const envFilePath = path.resolve(__dirname, '.env');
    const envFileContent = fs.readFileSync(envFilePath, { encoding: 'utf-8' });

    // Split the content into lines
    const envVariables = envFileContent.split('\n');

    // Iterate over each line
    envVariables.forEach((line) => {
      // Ignore lines that are empty or start with a hash (#)
      if (line && !line.startsWith('#')) {
        // Split line by first occurrence of "=" to separate key and value
        const [key, ...values] = line.split('=');
        const value = values.join('=').trim(); // Re-join in case value contains "="
        // Set the environment variable if key is not empty
        if (key) {
          process.env[key.trim()] = value;
        }
      }
    });
  } catch (e) {
    console.error('Failed to load .env file', e);
  }
}