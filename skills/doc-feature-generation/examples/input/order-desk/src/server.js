const express = require('express');
const { authenticate } = require('./middleware/authenticate');
const { ordersRouter } = require('./orders/orders.routes');
const { startExpireUnpaidOrdersJob } = require('./jobs/expire-unpaid-orders');
const { subscribePaymentEvents } = require('./payments/payment-events');

const app = express();
app.use(express.json());
app.use(authenticate);
app.use('/orders', ordersRouter);

if (!process.env.ORDER_DESK_GATEWAY_SECRET || Buffer.byteLength(process.env.ORDER_DESK_GATEWAY_SECRET) < 32) {
  process.stderr.write('ORDER_DESK_GATEWAY_SECRET must be configured with at least 32 bytes.\n');
  process.exitCode = 1;
} else {
  startExpireUnpaidOrdersJob();
  subscribePaymentEvents();
  app.listen(3000, '127.0.0.1');
}
