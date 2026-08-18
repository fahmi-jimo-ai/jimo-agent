/**
 * The one way into the live simulator. Shared so the "Open the live widget"
 * footer link and the post-send toast's "Open widget" button cannot drift —
 * the widget is a second Vite entry, not a route, so the path is literal.
 */
export const WIDGET_URL = '/widget.html';

export function openWidget() {
  window.open(WIDGET_URL, '_blank', 'noopener');
}
