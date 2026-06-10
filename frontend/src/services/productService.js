import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/products`;

/**
 * Fetch all products with optional filters
 * @param {object} params - { search, categorySlug, sort, page, limit }
 * @param {string} token
 */
export const getProducts = async (params = {}, token) => {
  const query = new URLSearchParams();
  if (params.search)       query.set('search', params.search);
  if (params.categorySlug) query.set('categorySlug', params.categorySlug);
  if (params.sort)         query.set('sort', params.sort);
  if (params.page)         query.set('page', params.page);
  if (params.limit)        query.set('limit', params.limit);

  const response = await fetch(`${BASE_URL}?${query.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch products');
  return data; // { success, count, total, pagination, data: [...] }
};

/**
 * Fetch a single product by ID
 * @param {string} id
 * @param {string} token
 */
export const getProductById = async (id, token) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.message || 'Failed to fetch product');
  return data; // { success, data: product }
};

export const uploadProductImages = async (files, token) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to upload images');
  }
  return data;
};

export const createProduct = async (productData, token) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to create product');
  }
  return data;
};

export const updateProduct = async (id, productData, token) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to update product');
  }
  return data;
};

export const deleteProduct = async (id, token) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to delete product');
  }
  return data;
};
