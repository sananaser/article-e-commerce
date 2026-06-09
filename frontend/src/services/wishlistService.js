const BASE_URL = '/api/wishlist';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const getWishlist = async (token) => {
  const res = await fetch(BASE_URL, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch wishlist');
  return data;
};

export const addToWishlist = async (productId, token) => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ productId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add to wishlist');
  return data;
};

export const removeFromWishlist = async (productId, token) => {
  const res = await fetch(`${BASE_URL}/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to remove from wishlist');
  return data;
};
