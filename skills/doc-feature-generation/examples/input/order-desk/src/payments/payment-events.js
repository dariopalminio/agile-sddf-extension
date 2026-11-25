const { subscribe } = require('./message-bus-client');
const repository = require('../orders/order-repository');
const { orderTotal } = require('../orders/order-service');

// The payment provider publishes a notification on the message bus for every captured payment.
function subscribePaymentEvents() {
  subscribe('payment.received', (event) => {
    const order = repository.findById(event.orderId);
    if (!order || order.status !== 'confirmed') {
      return; // unknown order, or not awaiting payment: ignored
    }
    if (event.amount < orderTotal(order)) {
      repository.update(order.id, { paymentIssue: 'underpaid' });
      return;
    }
    repository.update(order.id, { status: 'paid', paidAt: new Date(event.paidAt) });
  });
}

module.exports = { subscribePaymentEvents };
