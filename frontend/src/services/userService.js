const BASE_URL = '/api/admin/users';

/**
 * Fetch all users from the backend (admin only)
 * @param {string} token
 */
export const getUsers = async (token) => {
  const response = await fetch(BASE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch users');
  }
  return data; // { success: true, data: [...] }
};

/**
 * Toggle the block/unblock status of a user
 * @param {string} id
 * @param {string} token
 */
export const toggleUserBlock = async (id, token) => {
  const response = await fetch(`${BASE_URL}/${id}/toggle-block`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to toggle user status');
  }
  return data; // { success: true, message: ..., data: ... }
};
