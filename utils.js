const fs = require('fs');
const path = require('path');

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

function truncate_text(text, words) {
  return text.split(" ").slice(0, words).join(" ") + "...";
}

function replace_placeholders(template, placeholders) {
  return Object.keys(placeholders).reduce((html, key) => {
    const placeholder = `{{{${key}}}}`;
    return html.replaceAll(placeholder, placeholders[key]);
  }, template);
}

async function read_file(file_path) {
  try {
    const content = await fs.promises.readFile(file_path, 'utf8');
    return content;
  } catch (e) {
    throw new Error(`Failed to read template: ${e.message}`);
  }
}

async function write_file(file_path, content) {
  try {
    await fs.promises.writeFile(file_path, content);
    console.log(`"${file_path}" was created.`);
  } catch (e) {
    throw new Error(`Failed to write output: ${e.message}`);
  }
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

module.exports = { load_env, truncate_text, replace_placeholders, read_file, write_file, format_date, slugify };
