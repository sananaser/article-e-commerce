const ADMIN_ORDERS_URL = '/api/admin/orders';
const ORDERS_URL = '/api/orders';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const createOrder = async (token, { shippingAddress, paymentMethod }) => {
  const response = await fetch(ORDERS_URL, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ shippingAddress, paymentMethod }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to place order');
  }
  return data;
};

export const getMyOrders = async (token) => {
  const response = await fetch(`${ORDERS_URL}/myorders`, {
    method: 'GET',
    headers: authHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch orders');
  }
  return data;
};

export const getOrders = async (token) => {
  const response = await fetch(ADMIN_ORDERS_URL, {
    method: 'GET',
    headers: authHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch orders');
  }
  return data;
};

export const getOrderById = async (id, token) => {
  const response = await fetch(`${ORDERS_URL}/${id}`, {
    method: 'GET',
    headers: authHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch order');
  }
  return data;
};

export const updateOrderStatus = async (id, status, token) => {
  const response = await fetch(`${ORDERS_URL}/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to update order status');
  }
  return data;
};
