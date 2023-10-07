export class ExponentialThrottler {
  constructor(callback, should_run_code, initial_delay) {
    this.callback = callback;
    this.should_run_code = should_run_code;
    this.current_delay = initial_delay;
    this.initial_delay = initial_delay;
  }

  run() {
    const run = () => {
      if (!this.should_run_code()) {
        this.current_delay *= 2;
      } else {
        this.current_delay = this.initial_delay;
      }

      this.callback();

      setTimeout(run, this.current_delay);
    };

    setTimeout(run, this.current_delay);
  }
}

export function make_id(length = 8) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const characters_length = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters_length));
  }

  return result;
}

export function get_elements_children(element, map_function) {
  if (!element) return [];
  return [...element.children].map((child) => {
    return map_function(child);
  });
}

export function get_bounds_from_boxes(boxes, opts = {}) {
  if (!boxes) return { x: 0, y: 0, width: 0, height: 0 };
  let padding =
    opts && opts.padding
      ? opts && opts.padding
      : {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        };

  let children_x_positions = [];
  let children_y_positions = [];
  let children_widths = [];
  let children_heights = [];

  boxes.forEach(({ x, y, width, height }) => {
    children_x_positions.push(x);
    children_y_positions.push(y);
    children_widths.push(width);
    children_heights.push(height);
  });

  const min_x = Math.min(...children_x_positions);
  const max_x = Math.max(...children_x_positions);
  const min_y = Math.min(...children_y_positions);
  const max_y = Math.max(...children_y_positions);

  const x = min_x - padding.left;
  const y = min_y - padding.top;

  const width =
    Math.abs(min_x - max_x) +
    Math.max(...children_widths) +
    (padding.left + padding.right);
  const height =
    Math.abs(min_y - max_y) +
    Math.max(...children_heights) +
    (padding.top + padding.bottom);

  return { x, y, width, height };
}

export function throttle(callback, limit) {
  let waiting = false;
  return function () {
    if (!waiting) {
      callback.apply(this, arguments);
      waiting = true;
      setTimeout(function () {
        waiting = false;
      }, limit);
    }
  };
}

export function findEmoji(str) {
  if (!str) return null;
  else
    return str.match(
      /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/
    );
}

export function slugify(str) {
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

class SoundPlayer {
  constructor() {
    this.audio_context = null;
    this.loaded_sounds = new Map();
    this.current_source = null;
    this.current_sound = null;
    this.playback_time = 0; // For maintaining playback position
    this.is_mute = false;
  }

  initialize() {
    if (this.audio_context === null)
      this.audio_context = new (window.AudioContext ||
        window.webkitAudioContext)();
  }

  async load_files(files_array) {
    for (const { name, file } of files_array) {
      try {
        const response = await fetch(file);
        const buffer = await response.arrayBuffer();
        const decoded_data = await this.audio_context.decodeAudioData(buffer);
        this.loaded_sounds.set(name, decoded_data);
      } catch (error) {
        console.error(`Failed to load sound "${name}": ${error.message}`);
      }
    }
  }

  stop_current_source() {
    if (this.current_source) {
      this.current_source.disconnect();
      this.current_source.stop();
      this.current_source = null;
    }
  }

  seek(position_ms) {
    if (!this.current_sound) {
      console.error("No sound has been played yet.");
      return;
    }
    this.playback_time = position_ms / 1000; // Convert ms to seconds
    this.play(this.current_sound, this.playback_time);
  }

  play(name, start_time_s = 0) {
    if (this.is_mute) return;
    const sound = this.loaded_sounds.get(name);
    if (!sound) {
      console.error(`Sound "${name}" not found.`);
      return;
    }

    this.stop_current_source();

    const source = this.audio_context.createBufferSource();
    source.buffer = sound;
    source.connect(this.audio_context.destination);
    source.start(0, start_time_s);

    this.current_sound = name;
    this.current_source = source;
    this.playback_time = start_time_s;

    source.onended = () => {
      this.playback_time = 0;
    };
  }

  pause() {
    if (!this.current_source) {
      return;
    }
    this.playback_time +=
      this.audio_context.currentTime - this.current_source.startTime;
    this.stop_current_source();
  }

  stop() {
    this.playback_time = 0;
    this.stop_current_source();
  }
}

export const sound_player = new SoundPlayer();

export function set_caret_position(element, position) {
  const range = document.createRange();
  const sel = window.getSelection();

  let char_count = 0;
  let target_node = null;
  let last_text_node = null;

  (function find_target_node(node) {
    if (char_count > position && position !== -1) {
      // Stop recursive function when position is found
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const node_length = node.nodeValue.length;

      // Track the last text node found
      last_text_node = node;

      if (char_count + node_length >= position) {
        target_node = node;
      } else {
        char_count += node_length;
      }
    } else {
      // Dive into child nodes if it's not a text node
      for (let i = 0; i < node.childNodes.length; i++) {
        find_target_node(node.childNodes[i]);
      }
    }
  })(element);

  if (position === -1 && last_text_node) {
    target_node = last_text_node;
    position = target_node.nodeValue.length; // Move to the end of the last text node
  }

  if (target_node) {
    range.setStart(
      target_node,
      position !== -1 ? position - char_count : position
    );
    range.collapse(true);

    sel.removeAllRanges();
    sel.addRange(range);
  }
}
