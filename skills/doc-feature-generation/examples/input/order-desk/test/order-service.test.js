const test = require('node:test');
const assert = require('node:assert');
const service = require('../src/orders/order-service');
const repository = require('../src/orders/order-repository');

const customer = { id: 'c-1', role: 'customer' };
const item = { sku: 'BOOK-1', quantity: 1, unitPrice: 12.5 };

test('places a pending order', () => {
  const order = service.placeOrder(customer, [item]);
  assert.strictEqual(order.status, 'pending');
});

test('rejects an order without items', () => {
  assert.throws(() => service.placeOrder(customer, []), /at least one item/);
});

test('cancels a pending order', () => {
  const order = service.placeOrder(customer, [item]);
  assert.strictEqual(service.cancelOrder(customer, order.id).status, 'cancelled');
});

test('does not cancel a shipped order', () => {
  const order = service.placeOrder(customer, [item]);
  repository.update(order.id, { status: 'shipped' });
  assert.throws(() => service.cancelOrder(customer, order.id), /cannot be cancelled/);
});

test('does not let a customer cancel the order of another customer', () => {
  const order = service.placeOrder({ id: 'c-2', role: 'customer' }, [item]);
  assert.throws(() => service.cancelOrder(customer, order.id), /another customer/);
});
