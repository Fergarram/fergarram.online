const fs = require('fs');
const { load_user, get_channel_contents, get_channel_info } = require('./api');
const { load_env, format_date, slugify, read_file, write_file, replace_placeholders } = require('./utils');

if (!process.env.IS_VERCEL) load_env();

(async () => {
  try {
    const templates = {
      TIMELINE: await read_file("templates/timeline.html"),
      PAGE: await read_file("templates/page.html"), 
      TEXT: await read_file("templates/text.html"), 
      ARTICLE: await read_file("templates/article.html"), 
      LINK: await read_file("templates/link.html"), 
      IMAGE: await read_file("templates/image.html"), 
    };

    const user_session = await load_user();
    const site_details = await get_timeline_details(process.env.SITE_CHANNEL_ID);
    const site_contents = await get_timeline_contents(process.env.SITE_CHANNEL_ID);
    const other_timelines = site_contents.filter(b => b.class === "Channel");
    const main_timeline_contents = site_contents.filter(b => b.class !== "Channel");

    const global_placeholders = {
      site_title: site_details.title,
      site_arena: `https://are.na/${user_session.slug}/${site_details.slug}/`,
      site_description: `${user_session.full_name}'s generated are.na site.`,
      site_author: user_session.full_name,
      site_author_url: `https://are.na/${user_session.slug}/`,
    };

    // Generate the main timeline first.
    const main_timeline_placeholders = {
      ...global_placeholders,
      local_nav: generate_nav_html(site_details.title, [site_details, ...other_timelines]),
      local_author: site_details.user.full_name,
      local_author_url: `https://are.na/${site_details.user.slug}/`,
      local_title: site_details.title,
      local_slug: site_details.slug,
      local_description: site_details.metadata.description,
      local_created_at: site_details.created_at,
      local_updated_at: site_details.updated_at,
      local_content: generate_timeline_html(site_details, main_timeline_contents),
    };

    write_file("public/index.html", replace_placeholders(templates.TIMELINE, main_timeline_placeholders));

    // Generate all the other timelines.
    other_timelines.forEach(async (timeline) => {
      const timeline_details = await get_timeline_details(timeline.id);
      const timeline_contents = await get_timeline_contents(timeline.id);
      const placeholders = {
        local_nav: generate_nav_html(timeline.title, [site_details, ...other_timelines]),
        local_author: timeline.user.full_name,
        local_author_url: `https://are.na/${timeline.user.slug}/`,
        local_title: timeline.title,
        local_slug: timeline.slug,
        local_description: timeline_details.metadata.description,
        local_created_at: timeline.created_at,
        local_updated_at: timeline.updated_at,
        local_content: generate_timeline_html(timeline, timeline_contents),
      }
      write_file(`public/${slugify(timeline.title)}.html`, replace_placeholders(templates.TIMELINE, placeholders));
    });

  } catch (e) {
    console.error("Error generating site:", e.message);
  }
})()

function generate_timeline_html(timeline, blocks) {
  let timeline_html = "";

  blocks.forEach(block => {
    let generate_page = false;
    let template = "";

    if (block.title && block.description) {
      generate_page = true;
      template = templates.ARTICLE;
    } else if (
        block.class.includes("Text") ||
        block.class.includes("Image") ||
        block.class.includes("Link")
    ) {
      template = tempates[block.class.toUpperCase()];
    }

    const placeholders = {
      local_nav: generate_nav_html(timeline.title, [site_details, ...other_timelines]),
      local_author: block.user.full_name,
      local_author_url: `https://are.na/${block.user.slug}/`,
      local_title: block.title || "",
      local_slug: block.title ? slugify(block.title) : block.id.toString(),
      local_url: block.title ? `/${slugify(block.title)}-${block.id}.html` : `/${block.id.toString()}.html`,
      local_description: block.description || "",
      local_created_at: block.created_at,
      local_updated_at: block.updated_at,
      local_image_thumbnail: block.image ? block.image.thumb.url : "",
      local_image_display: block.image ? block.image.display.url : "",
      local_image_original: block.image ? block.image.original.url : "",
      local_content: block.class.includes("Link") ? block.source.url : block.content_html || "",
    };

    timeline_html += replace_placeholders(template, placeholders);

    if (generate_page && !block.class.includes("Link")) {
      write_file(`public${placeholders.local_url}`, replace_placeholders(templates.PAGE, placeholders));
    }
  });

  return timeline_html;
}

function generate_nav_html(active_name, items) {
  return items.reduce((acc, item) => {
    const tag = 
      `<a href="${slugify(item.title)}.html"
          class="${active_name === item.title ? 'active' : ''}">
        ${item.title}
      </a>`;
    return acc + tag;
  }, `<a href="/">About</a>`)
}

async function get_timeline_details(channel_id) {
  const response = await get_channel_info(channel_id);
  return response.json();
}

async function get_timeline_contents(channel_id) {
  const response = await get_channel_contents(channel_id);
  const { contents } = await response.json();
  return contents;
}
