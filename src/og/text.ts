/**
 * Cuts text to a number of characters on a word boundary, with an
 * ellipsis. Every text on an image also has a line clamp; this keeps very
 * long names from depending on it alone.
 */
export function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > maxChars * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}
