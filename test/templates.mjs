import { html, raw, render } from "../ccm-ui.mjs";
const results = [];
function check(condition, name) { if (!condition) throw new Error(name); results.push(name); }
try {
  const input = '\"><img src=x onerror=alert(1)>&\'';
  const view = html`<div title="${input}">${input}</div>`;
  check(view.textContent === input && view.title === input && !view.querySelector("img"), "text and quoted attributes remain literal");
  check(html`<p>${"&lt;"}</p>`.textContent === "&lt;", "entities are not decoded twice");
  const node = html`<button>Nested</button>`;
  const list = html`<div>${[node, "<b>", 42, false, null, undefined]}</div>`;
  check(list.firstChild === node && list.textContent === "Nested<b>42", "arrays and node identity");
  check(html`<button ${true && "disabled"}>Save</button>`.disabled, "conditional attributes");
  check(!html`<button ${false && "disabled"}>Save</button>`.disabled, "absent conditional attributes");
  check(html`<span>${raw('<svg viewBox="0 0 24 24"><path /></svg>')}</span>`.firstChild.namespaceURI === "http://www.w3.org/2000/svg", "explicit SVG markup");
  check(html`<p>${{ markup: "<img>" }}</p>`.textContent === "", "ordinary objects cannot opt out of escaping");
  let clicked = 0;
  const target = document.createElement("div");
  render(html`<button data-on-click="go">A</button><button data-on-click="go">B</button>`, target, { events: { go() { clicked++; } } });
  target.querySelectorAll("button").forEach(button => button.click());
  check(clicked === 2, "fragment rendering and event binding");
  document.querySelector("#result").textContent = `PASS: ${results.length} checks`;
} catch (error) {
  document.querySelector("#result").textContent = `FAIL: ${error.stack}`;
  throw error;
}
