export function make_id(length = 8) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const characters_length = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters_length)
        );
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
