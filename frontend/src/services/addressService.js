import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/addresses`;

/**
 * Fetch all saved addresses for the authenticated user
 * @param {string} token
 */
export const getAddresses = async (token) => {
  const response = await fetch(BASE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch addresses');
  }
  return data;
};

/**
 * Add a new address
 * @param {string} token
 * @param {object} addressData
 */
export const addAddress = async (token, addressData) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to add address');
  }
  return data;
};

/**
 * Update an existing address
 * @param {string} token
 * @param {string} id
 * @param {object} addressData
 */
export const updateAddress = async (token, id, addressData) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to update address');
  }
  return data;
};

/**
 * Delete an address
 * @param {string} token
 * @param {string} id
 */
export const deleteAddress = async (token, id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to delete address');
  }
  return data;
};

/**
 * Set an address as the default shipping address
 * @param {string} token
 * @param {string} id
 */
export const setDefaultAddress = async (token, id) => {
  const response = await fetch(`${BASE_URL}/${id}/default`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to set default address');
  }
  return data;
};
