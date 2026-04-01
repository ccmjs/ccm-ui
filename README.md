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
```

In this mode, ccm-ui is just a lightweight alternative to manual DOM creation or string concatenation.

No framework, no event system — just declarative HTML.


## ⚡ Using with ccmjs (Event Binding)

When used with a ccmjs instance, ccm-ui automatically connects DOM events to instance logic using conventions.

Instead of attaching event listeners manually, events are declared directly in HTML:

```html
<button data-on-click="next">Next</button>
```

The `render()` function then automatically binds these events to the instance.

Example:

```js
export const component = {
  name: "example",
  config: {
    ui: [ "ccm.load", "https://ccmjs.github.io/ccm-ui/ccm-ui.js" ],
    name: "Mika",
    onaction: event => {
      switch (event.type) {
        case "next":
          console.log("Next clicked");
          break;
      }
    }
  },
  Instance: function () {

    start: async () => {
  
      const view = this.ui.html`
        <div>
          <h1>Hello ${this.name}</h1>
          <button data-on-click="next">Next</button>
        </div>
      `;
  
      this.ui.render(view, this.element, this);
    },
  
    events: {
      next: event => {
        console.log("Next clicked");
      }
    }
  }
};
```

Each event contains:

* `instance` — component instance
* `type` — action name
* `event` — original DOM event
* `element` — source DOM element

Additional data can be attached via `data-*` attributes.

Event flow:

```
DOM Event → instance.events → instance.onaction
```

Key idea:

Templates describe **what happens**, not **how it happens**.

The template only contains action names:

```html
data-on-<event>="action"
```

The actual logic is defined separately:

```js
events: {
  <event>: event => { ... }
}
```

This keeps UI and behavior loosely coupled and highly reusable.

## 📦 API

`html(strings, ...values)`

Creates DOM nodes from a template literal.

`render(content, element, instance)`

Renders content and automatically binds events.

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
