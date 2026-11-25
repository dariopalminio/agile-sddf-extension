const repository = require('./order-repository');
const { OrderError } = require('./order-error');

const MAX_ITEMS_PER_ORDER = 20;

function placeOrder(customer, items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderError(422, 'an order needs at least one item');
  }
  if (items.length > MAX_ITEMS_PER_ORDER) {
    throw new OrderError(422, `an order cannot have more than ${MAX_ITEMS_PER_ORDER} items`);
  }
  return repository.save({ customerId: customer.id, items, status: 'pending', createdAt: new Date() });
}

function confirmOrder(customer, orderId) {
  const order = findOwnedOrder(customer, orderId);
  if (order.status !== 'pending') {
    throw new OrderError(409, 'only pending orders can be confirmed');
  }
  return repository.update(orderId, { status: 'confirmed', confirmedAt: new Date() });
}

function cancelOrder(customer, orderId) {
  const order = findOwnedOrder(customer, orderId);
  if (order.status === 'shipped' || order.status === 'cancelled') {
    throw new OrderError(409, `a ${order.status} order cannot be cancelled`);
  }
  return repository.update(orderId, { status: 'cancelled', cancelledAt: new Date() });
}

function shipOrder(orderId) {
  const order = repository.findById(orderId);
  if (!order) {
    throw new OrderError(404, 'order not found');
  }
  if (order.status !== 'paid') {
    throw new OrderError(409, 'only paid orders can be shipped');
  }
  return repository.update(orderId, { status: 'shipped', shippedAt: new Date() });
}

function getOrderStatus(customer, orderId) {
  const order = findOwnedOrder(customer, orderId);
  return { id: order.id, status: order.status };
}

// Customers act only on their own orders; support staff can act on any order.
function findOwnedOrder(customer, orderId) {
  const order = repository.findById(orderId);
  if (!order) {
    throw new OrderError(404, 'order not found');
  }
  if (order.customerId !== customer.id && customer.role !== 'support') {
    throw new OrderError(403, 'the order belongs to another customer');
  }
  return order;
}

function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

module.exports = {
  placeOrder,
  confirmOrder,
  cancelOrder,
  shipOrder,
  getOrderStatus,
  orderTotal,
  MAX_ITEMS_PER_ORDER,
};
