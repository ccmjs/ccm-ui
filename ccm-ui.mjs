/**
 * @module ccm-ui
 * @description Minimal UI utilities for ccmjs (templating + rendering)
 * @author André Kless <andre.kless@web.de>
 * @copyright 2026 André Kless
 * @license MIT
 *
 * Features:
 * - Template literal HTML creation
 * - DOM rendering helper
 * - Declarative event binding via `data-on-*`
 * - Automatic integration with `instance.events`
 * - No public bind() API (handled internally by render)
 */

/** Trusted markup explicitly supplied through raw(), never inferred from an object's properties. */
const rawValues = new WeakMap();

/** Declarative listeners owned by this module, indexed by DOM element. */
const boundListeners = new WeakMap();

/**
 * Marks trusted HTML or SVG for insertion without escaping. This does not sanitize markup.
 * @param {string} markup - Developer-controlled markup, never untrusted user input
 * @returns {object} Opaque value to interpolate into html()
 */
export function raw(markup) {
  if (typeof markup !== "string") throw new TypeError("raw() expects a string");
  const value = Object.freeze({});
  rawValues.set(value, markup);
  return value;
}

/**
 * Creates DOM nodes, escaping interpolated strings in text and quoted attributes.
 * Use raw() only for trusted markup; nested templates and DOM nodes retain their identity.
 *
 * @param {TemplateStringsArray} strings
 * @param {...any} values
 * @returns {Node|DocumentFragment}
 */
export function html(strings, ...values) {
  const template = document.createElement("template");
  let result = "";

  const placeholders = new Map();

  function process(value, key) {
    if (typeof value === "string" || typeof value === "number") {
      return String(value).replace(
        /[&<>"']/g,
        (character) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[character],
      );
    }

    if (rawValues.has(value)) return rawValues.get(value);

    if (value instanceof Node) {
      const id = `ccm-node-${key}`;
      placeholders.set(id, value);
      return `<!--${id}-->`;
    }

    if (Array.isArray(value)) {
      return value.map((v, i) => process(v, `${key}-${i}`)).join("");
    }

    return "";
  }

  strings.forEach((str, i) => {
    result += str;

    if (i < values.length) {
      result += process(values[i], i);
    }
  });

  template.innerHTML = result.trim();
  const fragment = template.content;

  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_COMMENT);

  const toReplace = [];

  let node;
  while ((node = walker.nextNode())) {
    const id = node.nodeValue.trim();
    const replacement = placeholders.get(id);

    if (replacement) {
      toReplace.push({ node, replacement });
    }
  }

  toReplace.forEach(({ node, replacement }) => {
    node.replaceWith(replacement);
  });

  return fragment.childNodes.length === 1 ? fragment.firstChild : fragment;
}

/**
 * Renders content into a DOM element and optionally binds events.
 *
 * @param {Node|string|null} content
 * @param {Element} element
 * @param {Object} [instance] - Optional ccmjs instance (enables event binding)
 */
export function render(content, element, instance) {
  if (!element) return;

  element.replaceChildren();

  if (content == null) return;

  if (typeof content === "string") {
    element.innerHTML = content;
    return;
  }

  if (content instanceof Node) {
    // automatic event binding (internal)
    bind(content, instance);

    element.appendChild(content);
  }
}

/**
 * Binds declarative DOM events to instance actions.
 *
 * Convention:
 *   data-on-click="next"
 *   data-on-input="typing"
 *
 * Behavior:
 * - Calls instance.events[actionName] (if defined)
 * - Replaces previous declarative bindings with the current attributes and instance
 * - Preserves listeners registered outside this module
 */
export function bind(root, instance) {
  if (!root || !instance) return;
  // Text and comment nodes have no elements to bind.
  if (typeof root.querySelectorAll !== "function") return;

  const handlers = instance.events || {};

  const elements = [root, ...root.querySelectorAll("*")];
  elements.forEach((el) => {
    for (const { eventType, listener } of boundListeners.get(el) || []) {
      el.removeEventListener(eventType, listener);
    }
    boundListeners.delete(el);

    const listeners = [];
    [...(el.attributes || [])].forEach((attr) => {
      if (!attr.name.startsWith("data-on-")) return;

      const eventType = attr.name.slice(8);
      const actionName = attr.value;

      const listener = (event) => handlers[actionName]?.(event);
      el.addEventListener(eventType, listener);
      listeners.push({ eventType, listener });
    });
    if (listeners.length) boundListeners.set(el, listeners);
  });
}
