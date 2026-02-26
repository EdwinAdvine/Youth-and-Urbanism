/**
 * useScreenContext — captures the visible text content of the main dashboard area.
 *
 * The AI tutor uses this text so students can ask questions like
 * "What am I looking at?" and get contextual explanations of whatever
 * is currently displayed between the left sidebar and the CoPilot panel.
 *
 * Usage:
 *   const getScreenContext = useScreenContext();
 *   const text = getScreenContext();  // call when needed
 */

const MAX_CONTEXT_CHARS = 2000;

/**
 * Extract readable text from a DOM element, skipping hidden elements,
 * scripts, and style nodes.
 */
function extractText(el: Element): string {
  const parts: string[] = [];

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) parts.push(text);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const elem = node as Element;
    const tag = elem.tagName.toLowerCase();

    // Skip non-visible and irrelevant elements
    if (['script', 'style', 'noscript', 'svg', 'head'].includes(tag)) return;

    const style = window.getComputedStyle(elem);
    if (style.display === 'none' || style.visibility === 'hidden') return;

    for (const child of Array.from(node.childNodes)) {
      walk(child);
    }
  };

  walk(el);

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function useScreenContext(): () => string {
  return () => {
    // Primary target: element tagged with data-main-content
    let container = document.querySelector<Element>('[data-main-content]');

    // Fallback: look for a <main> element
    if (!container) {
      container = document.querySelector('main');
    }

    // Last fallback: the document body
    if (!container) {
      container = document.body;
    }

    const text = extractText(container);

    // Trim to avoid overloading the AI context window
    if (text.length > MAX_CONTEXT_CHARS) {
      return text.slice(0, MAX_CONTEXT_CHARS) + '…';
    }

    return text;
  };
}
