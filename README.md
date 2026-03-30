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

## 🧠 Design Principles

- **Minimal** — no unnecessary abstraction
- **Declarative** — structure describes behavior
- **Framework-free** — no runtime dependencies
- **Composable** — works with any ccmjs component
- **Convention-based** — integrates with `instance.events` and `onaction`

## 🚀 Installation

Use it as a module dependency in ccmjs:

```js
ui: [ "ccm.load", "./ccm-ui.js" ]
```

## 🧩 Basic Usage

```js
const view = this.ui.html`
  <div>
    <h1>Hello ${this.name}</h1>
    <button data-on-click="next">Next</button>
  </div>
`;

this.ui.render(view, this.element, this);
```

## 🎯 Template Syntax

```js
this.ui.html`
  <h1>Hello ${name}</h1>
`
```

Supported values:

* strings
* numbers
* DOM nodes
* arrays

## 🔁 Rendering Lists

```js
const items = ["A", "B", "C"];

const view = this.ui.html`
  <ul>
    ${items.map(item => this.ui.html`<li>${item}</li>`)}
  </ul>
`;
```

## 🧩 Injecting DOM Nodes

```js
const button = document.createElement("button");
button.textContent = "Click";

const view = this.ui.html`
  <div>
    ${button}
  </div>
`;
```

## ⚡ Declarative Event Binding

Events are defined directly in HTML using:

```js
data-on-<event>="action"
```

Example:

```html
<button data-on-click="next">Next</button>
<input data-on-input="typing">
<form data-on-submit="submit"></form>
```

## 🔄 Event Flow

```
DOM Event → instance.events → instance.onaction
```

## 🧩 Local Event Handlers

```js
this.events = {
  next: ({ instance }) => {
    instance.step++;
  }
};
```

## 🧩 Global Event Handling (onaction)

```js
onaction: event => {
  switch (event.type) {
    case "next":
      console.log("Next clicked");
      break;
  }
}
```

## 🧩 Event Object

Each event contains:

* instance — component instance
* type — action name
* event — original DOM event
* element — source DOM element

Additional data can be attached via `data-*` attributes.

## 🧩 Templates as Modules

Templates can be externalized:

```js
export function main(instance) {
  return instance.ui.html`
    <button data-on-click="next">Next</button>
  `;
}
```

## 🧩 Usage in Component

```js
this.start = async () => {

  const view = this.html.main(this);

  this.ui.render(view, this.element, this);

};
```

## 🔥 Key Features

* automatic event binding (no manual wiring)
* no template runtime or virtual DOM
* full separation of UI and logic
* integrates with ccmjs lifecycle and conventions

## ⚖️ Comparison

...

## 🧭 Philosophy

ccm-ui is not a framework.

It is a pattern extraction:

* Templates describe structure
* Actions describe behavior
* Components orchestrate everything

## 📦 API

`html(strings, ...values)`

Creates DOM nodes from a template literal.

`render(content, element, instance)`

Renders content and automatically binds events.

## 🪶 Why ccm-ui?

Because sometimes you only need:

* HTML
* Events
* Composition

...and nothing else.

## 📄 License

MIT License

## 🔗 Related

* ccmjs framework
* declarative dependencies
* component-based web architecture
