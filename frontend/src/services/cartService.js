const BASE_URL = '/api/cart';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

/** Get the user's cart */
export const getCart = async (token) => {
  const res = await fetch(BASE_URL, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch cart');
  return data;
};

/** Add item to cart */
export const addToCart = async (token, productId, quantity = 1) => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ productId, quantity }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add to cart');
  return data;
};

/** Update cart item quantity */
export const updateCartItem = async (token, productId, quantity) => {
  const res = await fetch(`${BASE_URL}/quantity`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ productId, quantity }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update cart');
  return data;
};

/** Remove item from cart */
export const removeFromCart = async (token, productId) => {
  const res = await fetch(`${BASE_URL}/item/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to remove from cart');
  return data;
};

/** Clear entire cart */
export const clearCart = async (token) => {
  const res = await fetch(BASE_URL, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to clear cart');
  return data;
};
