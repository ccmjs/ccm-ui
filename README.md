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

## 🧩 Basic Example (Standalone)

ccm-ui can be used independently of ccmjs for simple HTML templating.

### Simple Template

```js
import { html, render } from "https://ccmjs.github.io/ccm-ui/ccm-ui.js";

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

When used with a ccmjs instance, ccm-ui automatically connects DOM events to instance logic via conventions.

Instead of attaching event listeners manually, events are declared directly in HTML.

Example:

```js
/* ./templates.mjs */
export function view(instance) {
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
    ui: [ "ccm.load", "./ccm-ui.js" ],
    name: "Mika",
    html: [ "ccm.load", "./resources/templates.mjs" ],
    onaction: event => {
      switch (event.action) {
        case "next":
          console.log("Next clicked");
          break;
      }
    }
  },
  Instance: function () {

    this.start = async () => {
      const view = this.html.view(this);
      this.ui.render(view, this.element, this);
    };
  
    this.events = {
      next: event => {
        console.log("Next clicked");
      }
    };
  }
};
```

Each event is the original DOM event extended with additional properties:

* `action` — action name (from `data-on-*`)
* `instance` — component instance  
* `element` — source DOM element  

The DOM event is passed through unchanged and enriched with ccm-ui specific properties.

Event flow:

```
DOM Event (extended) → instance.events → instance.onaction
```

Key idea:

> Templates describe **what happens**, not **how it happens**.

The template only contains action names:

```html
data-on-<event>="action"
```

The actual logic is defined separately:

```js
events: {
  action: event => { ... }
}
```

This keeps UI and behavior loosely coupled and highly reusable.

## 📦 API

### html(strings, ...values)

Creates DOM nodes from a template literal.

### render(content, element, instance)

Renders content and automatically binds events (if an instance is provided).

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
