const { load_env } = require('./utils');

if (!process.env.IS_VERCEL) load_env();

const BASE_URL = 'https://api.are.na/v2';

async function fetch_json(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DANGER_ARENA_TOKEN}`
    }
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

async function load_user() {
  return fetch_json(`${BASE_URL}/me`);
}

async function get_channel_contents(id) {
  return fetch_json(`${BASE_URL}/channels/${id}/contents?page=1&per=100&direction=desc`);
}

async function get_channel_info(id) {
  return fetch_json(`${BASE_URL}/channels/${id}/thumb`);
}

module.exports = { fetch_json, load_user, get_channel_contents, get_channel_info };