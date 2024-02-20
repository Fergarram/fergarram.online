const fetch = require("node-fetch");

const target_url = `https://api.are.na/v2/channels/fergarram-online/contents?page=1&per=100`;

async function load_posts() {
  try {
    const response = await fetch(target_url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.DANGER_ARENA_TOKEN}`,
      },
    });

    const data = await proxy_response.json();
    console.log("I should create html files from here.", data);

  } catch (e) {
    console.error("FUCK, FAILED TO GET ARENA CONTENT.", e);
  }
}

load_posts();