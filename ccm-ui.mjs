/**
 * @module ccm-ui
 * @description Minimal UI utilities for ccmjs (templating + rendering + event binding)
 *
 * Features:
 * - Template literal HTML creation
 * - DOM rendering helper
 * - Declarative event binding via `data-on-*`
 *
 * Design Goals:
 * - No framework lock-in
 * - Declarative UI
 * - Full separation of structure and behavior
 * - Seamless integration with ccmjs `onaction`
 */

/**
 * Creates DOM nodes from a template literal.
 *
 * Supports:
 * - strings and numbers
 * - DOM nodes (via placeholder replacement)
 * - arrays (flattened into strings)
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

  // Replace node placeholders with actual DOM nodes
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
 * Renders content into a DOM element.
 *
 * @param {Node|string|null} content
 * @param {Element} element
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
    // 🔥 AUTO-BIND
    if (instance?.ui?.bind) {
      instance.ui.bind(content, instance, instance.events);
    }

    element.appendChild(content);
  }
}

/**
 * Binds declarative DOM events to instance actions.
 *
 * Recognizes attributes of the form:
 *
 *   data-on-click="next"
 *   data-on-input="typing"
 *
 * Behavior:
 * - Extracts event type from attribute name
 * - Extracts action name from attribute value
 * - Attaches DOM event listener
 * - Triggers:
 *     1. optional local handler (instance.events)
 *     2. global instance.onaction
 *
 * @param {Element} root - Root element to scan
 * @param {Object} instance - ccmjs instance
 * @param {Object} [handlers={}] - Optional local event handlers (instance.events)
 * @returns {Element}
 */
export function bind(root, instance, handlers = {}) {
  if (!root) return root;

  root.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      // only process data-on-* attributes
      if (!attr.name.startsWith("data-on-")) return;

      const eventType = attr.name.slice(8); // e.g. "click"
      const actionName = attr.value; // e.g. "next"

      el.addEventListener(eventType, (event) => {
        const payload = {
          instance,
          type: actionName,
          event,
          element: el,
        };

        // 1. local handler (optional)
        if (handlers[actionName]) {
          handlers[actionName](payload);
        }

        // 2. global action (ccmjs convention)
        if (instance.onaction) {
          instance.onaction(payload);
        }
      });
    });
  });

  return root;
}
