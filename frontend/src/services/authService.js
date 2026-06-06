const BASE_URL = '/api/auth';

/**
 * Register a new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 */
export const registerUser = async (name, email, password) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Registration failed');
  }
  return data; // { success, message, token, user }
};

/**
 * Login an existing user
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Login failed');
  }
  return data; // { success, message, token, user }
};

/**
 * Get the currently authenticated user profile
 * @param {string} token
 */
export const getMe = async (token) => {
  const response = await fetch(`${BASE_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch user');
  }
  return data; // { success, user }
};

/**
 * Logout (server-side cleanup if needed)
 * @param {string} token
 */
export const logoutUser = async (token) => {
  await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};
