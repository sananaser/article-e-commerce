export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Builds the full URL for product images.
 * If the path is absolute (e.g. starts with http or data:), it returns it as is.
 * Otherwise, it prepends the backend API base URL.
 * @param {string} path - The relative or absolute image path
 * @returns {string} The resolved image URL
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const base = API_BASE_URL.replace(/\/$/, '');
  const relPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${relPath}`;
};
