(function renderBriefing() {
  const data = window.BRIEFING;
  if (!data || !Array.isArray(data.sections)) {
    document.body.textContent = "早报数据缺失。";
    return;
  }

  const dateNode = document.querySelector("[data-briefing-date]");
  if (dateNode) dateNode.textContent = data.date;

  const root = document.querySelector("[data-sections]");
  if (!root) return;

  const search = document.querySelector("[data-search]");
  const empty = document.querySelector("[data-empty]");

  const paint = () => {
    const query = (search?.value || "").trim().toLowerCase();
    const fragment = document.createDocumentFragment();
    let count = 0;
    data.sections.forEach((section) => {
      const items = section.items.filter((item) => matches(item, query));
      count += items.length;
      if (items.length === 0) return;
      fragment.appendChild(renderSection({ ...section, items }));
    });
    root.replaceChildren(fragment);
    if (empty) empty.hidden = count > 0;
  };

  paint();
  search?.addEventListener("input", paint);

  const tabs = document.querySelector("[data-tabs]");
  if (tabs) {
    tabs.replaceChildren(
      ...data.sections.map((section, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tab";
        button.textContent = section.kicker;
        button.setAttribute("aria-controls", section.id);
        if (index === 0) button.classList.add("is-active");
        button.addEventListener("click", () => {
          document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          tabs.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("is-active"));
          button.classList.add("is-active");
        });
        return button;
      })
    );
  }
})();

function matches(item, query) {
  if (!query) return true;
  return [item.title, item.body, item.source].some((field) =>
    String(field || "").toLowerCase().includes(query)
  );
}

function renderSection(section) {
  const sectionNode = document.createElement("section");
  sectionNode.className = "module";
  sectionNode.id = section.id;

  const head = document.createElement("header");
  head.className = "module-head";
  head.innerHTML = `<p class="kicker"></p><h2></h2><p class="module-summary"></p>`;
  head.querySelector(".kicker").textContent = section.kicker;
  head.querySelector("h2").textContent = section.title;
  head.querySelector(".module-summary").textContent = section.summary;

  const list = document.createElement("ol");
  list.className = "stories";
  section.items.forEach((item, index) => {
    list.appendChild(renderStory(item, index + 1));
  });

  sectionNode.append(head, list);
  return sectionNode;
}

function renderStory(item, index) {
  const story = document.createElement("li");
  story.className = "story";

  const indexNode = document.createElement("span");
  indexNode.className = "index";
  indexNode.textContent = String(index).padStart(2, "0");

  const body = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = item.title;
  const text = document.createElement("p");
  text.textContent = item.body;
  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `来源：${item.source} ｜ ${item.time}`;

  body.append(title, text, meta);
  story.append(indexNode, body);
  return story;
}
