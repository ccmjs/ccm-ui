# 🎨 ccm-ui

Minimal, declarative HTML templating and event binding for ccmjs with zero framework overhead.

## ✨ Overview

ccm-ui is a tiny helper module that provides:

- template literal based HTML rendering
- declarative event binding
- seamless integration with ccmjs instance conventions

It is **optional** and does not replace or extend the ccmjs core.
Instead, it follows the same philosophy:

> Keep the core minimal and move patterns into conventions.

ccm-ui works standalone, but unlocks its full power when used with ccmjs.

## 🧩 Basic Example (Standalone)

ccm-ui can be used independently of ccmjs for simple HTML templating.

### Simple Template

```js
import { html, render } from "././libs/ccm-ui/ccm-ui.mjs";

const name = "Mika";

const view = html`
  <div>
    <h1>Hello ${name}</h1>
    <p>This is a simple template.</p>
  </div>
`;

render(view, document.body);  // Renders template inside <body>
```

### Rendering Lists

```js
const items = ["A", "B", "C"];

const view = html`
  <ul>
    ${items.map(item => html`<li>${item}</li>`)}
  </ul>
`;

render(view, document.body);
```

### Injecting DOM Nodes

```js
const button = html`<button>Click me</button>`;
button.onclick = () => alert("Hello!");

const view = html`
  <div>
    <h2>Interactive Element</h2>
    ${button}
  </div>
`;

render(view, document.body);
```

In this mode, ccm-ui is just a lightweight alternative to manual DOM creation or string concatenation.

No framework, no event system — just declarative HTML.

## ⚡ Using with ccmjs (Event Binding)

When used with a ccmjs instance, ccm-ui automatically connects DOM events to instance logic based on conventions.

Instead of attaching event listeners manually, events are declared directly in HTML.

Example:

```js
/* ./views.mjs */
export function main(instance) {
  return html`
    <div>
      <h1>Hello ${instance.name}</h1>
      <button data-on-click="next">Next</button>
    </div>
  `;
}
```

The `render()` function then automatically binds these events to the instance:

```js
/* ./ccm.example.mjs */
export const component = {
  name: "example",
  config: {
    ui: [ "ccm.load", "././libs/ccm-ui/ccm-ui.mjs" ],
    name: "Mika",
    views: [ "ccm.load", "././resources/views.mjs" ]
  },
  Instance: function () {

    this.start = async () => {
      const view = this.views.main(this);
      this.ui.render(view, this.element, this);
    };
  
    this.events = {
      next: event => {
        console.log("Next clicked", event.currentTarget);
      }
    };
  }
};
```

Each handler receives the original, unchanged DOM event. During the handler,
`event.currentTarget` refers to the element with the `data-on-*` attribute;
`event.target` refers to the element where the event originated.

Event flow:

```
DOM Event → instance.events[action]
```

For components using extensions with `emit()`, the handler decides whether and when
to call `this.emit(...)`. ccm-ui does not emit extension events automatically.

Key idea:

> Templates describe **what happens**, not **how it happens**.

The template only contains action names:

```html
data-on-<event>="<action>"
```

The actual logic is defined separately:

```js
events: {
  <action>: event => { ... }
}
```

This keeps UI and behavior loosely coupled and highly reusable.

## 📦 API

### html(strings, ...values)

Creates DOM nodes from a template literal.

### render(content, element, [instance])

Renders content and automatically binds events if an instance is provided.

## 🧭 Philosophy

> Start with HTML and JavaScript.  
> Add patterns only when they are truly needed.

Instead of introducing a rendering engine, virtual DOM, or reactivity system,
ccm-ui focuses on:

* declarative structure
* explicit behavior
* minimal abstraction

## 📄 License

MIT License

## Safe interpolation

`html` escapes interpolated strings and numbers automatically. Keep source data unchanged;
remove manual HTML escaping when migrating existing templates to avoid double escaping.

```js
html`<input value="${username}"><span>${username}</span>`;
html`<button ${busy && "disabled"}>Save</button>`;
html`<span>${raw(trustedSvg)}</span>`;
```

Import `raw` alongside `html`. Use `raw()` only for developer-controlled HTML/SVG, never
for user input. Nested templates, DOM nodes and arrays remain supported; null, undefined
and booleans insert nothing. Quote every dynamic attribute value. Interpolations are for
text and quoted attributes, not tag/attribute names, scripts, styles or event-handler code.
Escaping does not validate URLs: applications must restrict URL schemes where needed.
`render(string, ...)` still accepts trusted HTML; use a template passed to `render` for dynamic text.

### raw(markup)

Returns an opaque trusted-markup value for interpolation into `html`. Does not sanitize it.

## Tests

Serve this repository with a static HTTP server and open `test/index.html` in a browser.
It checks escaping, quoted attributes, nested nodes, arrays, conditional attributes,
explicit SVG markup and fragment event binding, without additional dependencies.
