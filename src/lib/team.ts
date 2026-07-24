/** Two-letter initials from a full name, for avatar fallbacks. */
export const getInitials = (fullName: string) =>
  fullName
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Turns a full GitHub profile URL into an `@handle` for display.
 *  Social links are stored as full URLs (see the Employee type). */
export const githubHandle = (url: string) => {
  const handle = url
    .replace(/^https?:\/\//, '')
    .replace(/^(www\.)?github\.com\//, '')
    .replace(/\/+$/, '');
  return handle ? `@${handle}` : url;
};
