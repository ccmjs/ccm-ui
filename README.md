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

Place `ccm-ui.mjs` next to your HTML file and run this example in a `<script type="module">`:

```js
import { html, render } from "./ccm-ui.mjs";

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

### Recommended Structure for a ccmjs Component

For a ccmjs component, place the UI module in `libs/ccm-ui/`, the ccmjs framework
in `libs/framework/`, and the component's templates in `resources/views.mjs`:

```text
example/
├── index.html
├── ccm.example.mjs
├── libs/
│   ├── ccm-ui/
│   │   └── ccm-ui.mjs
│   └── framework/
│       └── ccm.js
└── resources/
    └── views.mjs
```

The following ccmjs component example uses `././libs/ccm-ui/ccm-ui.mjs` for the UI
module and `././resources/views.mjs` for its templates.

### Component Templates and Event Handlers

```js
/* ./resources/views.mjs */
export function main(app) {
  return app.ui.html`
    <div>
      <h1>Hello ${app.name}</h1>
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
  ccm: "././libs/framework/ccm.js",
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

### bind(root, instance)

Binds `data-on-<event>="<action>"` attributes on existing DOM elements to
`instance.events[action]`. Use it for content inserted outside `render()` or to
refresh bindings after changes. It does not insert or replace DOM content.

- `root`: An element, document or document fragment. The root itself (if it is an
  element) and all descendant elements are inspected. Text and comment nodes are ignored.
- `instance`: A ccmjs instance, or an object with an `events` object whose action
  names map to handler functions. Missing or null handlers are ignored.
- Returns `undefined`.

```js
import { bind } from "./ccm-ui.mjs";

const button = document.createElement("button");
button.textContent = "Next";
button.setAttribute("data-on-click", "next");
const app = {
  events: {
    next: event => console.log("Next clicked", event.currentTarget)
  }
};

document.body.append(button);
bind(button, app);
```

Handlers receive the unchanged DOM event. Listeners are attached directly to each
element using the default `addEventListener()` options. Browser bubbling and default
actions remain unchanged unless the handler explicitly changes them. Handler return
values are ignored, and asynchronous handlers are not awaited. `bind()` does not set
`this` to the instance; use an arrow function defined in the instance scope when needed.

Each call replaces this module's previous listeners on the inspected elements using
the current attributes and instance. Repeated `bind()` or `render()` calls therefore
do not accumulate listeners. Changed action names and removed attributes take effect
on rebinding; listeners registered manually are preserved. This also applies when
rebinding an ancestor of an already bound element.

Bindings are not observed automatically: call `bind()` again after adding elements,
changing attributes or replacing the `instance.events` object. Without a root or
instance, the call does nothing and does not remove existing bindings. Traversal does
not enter shadow roots or the separate `.content` of native `<template>` elements;
pass such a root explicitly when needed. Calling `bind()` on a fragment after its
children have been inserted elsewhere only inspects the now-empty fragment.

`render(content, element, instance)` calls `bind()` for the rendered content, including
HTML strings, but does not bind the destination container itself. Neither function
automatically calls extension `emit()` methods.

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

### Native `<template>` elements

Static `<template>` markup is supported, but interpolating DOM nodes inside a native
`<template>` element is not supported. This also applies to nested `html` calls inside
that element, since they return DOM nodes. Its separate `.content` fragment is not
traversed when replacing node placeholders.

Use a template function to create reusable content instead:

```js
const row = (item) => html`<li>${item.name}</li>`;
const list = html`<ul>${items.map(row)}</ul>`;
```

Nested `html` calls in ordinary elements remain supported.

### raw(markup)

Returns an opaque trusted-markup value for interpolation into `html`. Does not sanitize it.
