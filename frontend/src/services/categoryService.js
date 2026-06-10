import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/categories`;

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const getCategories = async () => {
  const response = await fetch(BASE_URL, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch categories');
  }
  return data;
};

export const createCategory = async (name, token) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to create category');
  }
  return data;
};

export const updateCategory = async (id, name, token) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to update category');
  }
  return data;
};

export const deleteCategory = async (id, token) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to delete category');
  }
  return data;
};
