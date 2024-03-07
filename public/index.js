const clock_el = document.getElementById('clock');
const theme_switch_el = document.getElementById('theme-switch');
const sort_button_el = document.getElementById("sort-button");
const list_el = document.getElementById("article-list");

if (theme_switch_el) {
	const themes = ["", "calm", "emo-kitty", "olive", "dark-olive", "not-hacker-news"];
	let current_theme_index = window.theme !== null && themes.includes(window.theme)
		? themes.indexOf(window.theme)
		: 0;

	theme_switch_el.addEventListener("click", () => {
        current_theme_index = (current_theme_index + 1) % themes.length;
        document.documentElement.className = themes[current_theme_index];
        localStorage.setItem("feed_site_theme", themes[current_theme_index]);
	});
}

if (sort_button_el && list_el) {
	sort_button_el.addEventListener("click", () => {
		if (sort_button_el.dataset.flow === "old") {
			sort_button_el.innerText = "oldest first 🔻";
			sort_button_el.dataset.flow = "new";
		} else {
			sort_button_el.innerText = "newest first 🔺";
			sort_button_el.dataset.flow = "old";
		}
		const children = Array.from(list_el.children);
		children.reverse().forEach(child => {
			list_el.appendChild(child);
		});
	});
}

if (clock_el) {
	setInterval(() => {
	    const utc_offset = Number(clock_el.dataset.offset);
	    const now = new Date();
	    const local_time = new Date(now.getTime() + utc_offset * 3600 * 1000);

	    let hours = local_time.getUTCHours();
	    let sleeping = (hours >= 19 || hours < 7) ? "it's late" : "my time";

	    hours = hours.toString().padStart(2, '0');
	    const minutes = local_time.getUTCMinutes().toString().padStart(2, '0');
	    const seconds = local_time.getUTCSeconds().toString().padStart(2, '0');

	    clock_el.firstElementChild.innerText = `${sleeping}`;
	    clock_el.lastElementChild.innerText = `${hours}:${minutes}:${seconds}`;
	}, 1000);
}