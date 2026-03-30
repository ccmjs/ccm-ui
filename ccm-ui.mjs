/**
 * @module ccm-ui
 * @description Minimal UI utilities for ccmjs (templating + rendering)
 *
 * Features:
 * - Template literal HTML creation
 * - DOM rendering helper
 * - Declarative event binding via `data-on-*`
 * - Automatic integration with `instance.events` and `instance.onaction`
 * - No public bind() API (handled internally by render)
 */

/**
 * Creates DOM nodes from a template literal.
 *
 * @param {TemplateStringsArray} strings
 * @param {...any} values
 * @returns {Node|DocumentFragment}
 */
export function html(strings, ...values) {
  const template = document.createElement("template");
  let result = "";

  strings.forEach((str, i) => {
    result += str;

    if (i < values.length) {
      const value = values[i];

      // primitive values
      if (typeof value === "string" || typeof value === "number") {
        result += value;
      }

      // DOM node placeholder
      else if (value instanceof Node) {
        result += `<!--ccm-node-${i}-->`;
      }

      // array support (e.g. lists)
      else if (Array.isArray(value)) {
        result += value
          .map((v) => (typeof v === "string" || typeof v === "number" ? v : ""))
          .join("");
      } else {
        result += "";
      }
    }
  });

  template.innerHTML = result.trim();
  const fragment = template.content;

  // Replace placeholders with actual nodes
  values.forEach((value, i) => {
    if (!(value instanceof Node)) return;

    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_COMMENT);

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue === `ccm-node-${i}`) {
        node.replaceWith(value);
        break;
      }
    }
  });

  return fragment.childNodes.length === 1 ? fragment.firstChild : fragment;
}

/**
 * Renders content into a DOM element and automatically binds events.
 *
 * @param {Node|string|null} content
 * @param {Element} element
 * @param {Object} instance - ccmjs instance
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
 * INTERNAL: Binds declarative DOM events to instance actions.
 *
 * Convention:
 *   data-on-click="next"
 *   data-on-input="typing"
 *
 * Behavior:
 * - Calls instance.events[actionName] (if defined)
 * - Calls instance.onaction (if defined)
 *
 * @private
 */
function bind(root, instance) {
  if (!root || !instance) return;

  const handlers = instance.events || {};

  root.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (!attr.name.startsWith("data-on-")) return;

      const eventType = attr.name.slice(8);
      const actionName = attr.value;

      el.addEventListener(eventType, (event) => {
        const payload = {
          instance,
          type: actionName,
          event,
          element: el,
        };

        // local handler
        if (handlers[actionName]) {
          handlers[actionName](payload);
        }

        // global action
        if (instance.onaction) {
          instance.onaction(payload);
        }
      });
    });
  });
}
