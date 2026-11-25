const cron = require('node-cron');
const repository = require('../orders/order-repository');

const UNPAID_ORDER_TTL_HOURS = 24;

function startExpireUnpaidOrdersJob() {
  // Every hour, cancel the confirmed orders that are still unpaid after the time limit.
  cron.schedule('0 * * * *', () => {
    const limit = new Date(Date.now() - UNPAID_ORDER_TTL_HOURS * 60 * 60 * 1000);
    for (const order of repository.findUnpaidConfirmedBefore(limit)) {
      repository.update(order.id, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: 'payment timeout',
      });
    }
  });
}

module.exports = { startExpireUnpaidOrdersJob, UNPAID_ORDER_TTL_HOURS };
