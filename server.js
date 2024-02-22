const fs = require('fs');
const {
  load_user,
  get_channel_contents,
  get_channel_info
} = require('./api');
const {
  load_env,
  clean_public,
  truncate_text,
  format_date,
  slugify,
  read_file,
  write_file,
  replace_placeholders
} = require('./utils');

if (!process.env.IS_VERCEL) load_env();

(async () => {
  await clean_public();
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
    site_arena_url: `https://are.na/${user_session.slug}/${site_details.slug}/`,
    site_description: `${user_session.full_name}'s generated are.na site.`,
    site_author: user_session.full_name,
    site_author_url: `https://are.na/${user_session.slug}/`,
    site_clock: process.env.UTC_OFFSET === undefined ? "" : generate_clock_html(process.env.UTC_OFFSET),
  };

  // Generate the main timeline first.
  const main_timeline_placeholders = {
    ...global_placeholders,
    local_nav: generate_nav_html(site_details.title, other_timelines),
    local_author: site_details.user.full_name,
    local_author_slug: site_details.user.slug,
    local_author_url: `https://are.na/${site_details.user.slug}/`,
    local_title: site_details.title,
    local_slug: site_details.slug,
    local_show_description: !site_details.metadata || !site_details.metadata.description
      ? `style="display: none;"`
      : "",
    local_description: site_details.metadata ? site_details.metadata.description : "",
    local_created_at: format_date(site_details.created_at),
    local_updated_at: format_date(site_details.updated_at),
    local_content: generate_timeline_html(site_details, main_timeline_contents),
  };

  write_file("public/index.html", replace_placeholders(templates.TIMELINE, main_timeline_placeholders));

  // Generate all the other timelines.
  other_timelines.forEach(async (timeline) => {
    const timeline_details = await get_timeline_details(timeline.id);
    const timeline_contents = await get_timeline_contents(timeline.id);
    const placeholders = {
      ...global_placeholders,
      local_nav: generate_nav_html(timeline.title, other_timelines),
      local_author: timeline.user.full_name,
      local_author_slug: timeline.user.slug,
      local_author_url: `https://are.na/${timeline.user.slug}/`,
      local_title: timeline.title,
      local_slug: timeline.slug,
      local_show_description: !timeline_details.metadata || !timeline_details.metadata.description
        ? `style="display: none;"`
        : "",
      local_description: timeline_details.metadata ? timeline_details.metadata.description : "",
      local_created_at: format_date(timeline.created_at),
      local_updated_at: format_date(timeline.updated_at),
      local_content: generate_timeline_html(timeline, timeline_contents),
    }
    write_file(`public/${slugify(timeline.title)}.html`, replace_placeholders(templates.TIMELINE, placeholders));
  });

  function generate_timeline_html(timeline, blocks) {
    let timeline_html = "";

    blocks.forEach(block => {
      let generate_page = false;
      let template = "";

      if (block.title && block.description && block.class !== "Link") {
        generate_page = true;
        template = templates.ARTICLE;
      } else if (
          // @TODO: Handle "Attachment"
          // @TODO: Handle "Media"
          block.class === "Text" ||
          block.class === "Image" ||
          block.class === "Link"
      ) {
        template = templates[block.class.toUpperCase()];
      }

      let content = block.content_html || "";
      
      if (block.class === "Link") {
        content = block.source.url;
      }

      if (block.class === "Image") {
       content = block.description_html || "";
      }

      // @TODO: Make this object blob more readable.
      const placeholders = {
        ...global_placeholders,
        local_nav: generate_nav_html(timeline.title, other_timelines),
        local_author: block.user.full_name,
        local_author_url: `https://are.na/${block.user.slug}/`,
        local_title: block.title || "",
        local_slug: block.title ? slugify(block.title) : block.id.toString(),
        local_url: block.title
          ? `${slugify(block.title)}-${block.id}.html`
          : `${block.id.toString()}.html`,
        local_description: block.class === "Image" && generate_page
          ? ""
          : block.description_html || "",
        local_sanatized_description: block.description, // @FIXME: Actually remove markdown syntax.
        local_created_at: format_date(block.created_at),
        local_updated_at: format_date(block.updated_at),
        local_image_thumbnail: block.image ? block.image.thumb.url : "",
        local_image_display: block.image ? block.image.display.url : "",
        local_image_original: block.image ? block.image.original.url : "",
        local_content: content,
      };

      placeholders.local_thumbnail = block.image
          ? generate_img_html(placeholders.local_url, placeholders.local_image_thumbnail)
          : "";
      placeholders.local_img = block.image
          ? generate_img_html(placeholders.local_image_original, placeholders.local_image_display)
          : "";

      timeline_html += replace_placeholders(template, placeholders);

      if (generate_page) {
        write_file(`public/${placeholders.local_url}`, replace_placeholders(templates.PAGE, placeholders));
      }
    });

    return timeline_html;
  }

  function generate_img_html(link, src, alt="") {
    return `<a href="${link}"><img src="${src}" alt="${alt}"/></a>`;
  }

  function generate_nav_html(active_name, items) {
    return items.reduce((acc, item) => {
      const tag = 
        `<a href="${slugify(item.title)}.html"
            class="${active_name === item.title ? 'active' : ''}">
          ${item.title}
        </a>`;
      return acc + tag;
    }, `<a href="index.html" class="${active_name === site_details.title ? 'active' : ''}">About</a>`)
  }

  function generate_clock_html(offset) {
    const sign = Number(offset) === 0 || Number(offset) < 0 ? "-" : "+";
    const abs_offset = Math.abs(Number(offset));
    return `
      <p id="clock" data-offset="${offset}">
        <span class="nowrap">TIMEZONE</span>
        <span class="nowrap">[UTC${sign}${abs_offset}]</span>
      </p>
    `;
  }

  async function get_timeline_details(channel_id) {
    return await get_channel_info(channel_id);
  }

  async function get_timeline_contents(channel_id) {
    const { contents } = await get_channel_contents(channel_id);
    return contents;
  }
})();