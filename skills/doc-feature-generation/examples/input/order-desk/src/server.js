const express = require('express');
const { authenticate } = require('./middleware/authenticate');
const { ordersRouter } = require('./orders/orders.routes');
const { startExpireUnpaidOrdersJob } = require('./jobs/expire-unpaid-orders');
const { subscribePaymentEvents } = require('./payments/payment-events');

const app = express();
app.use(express.json());
app.use(authenticate);
app.use('/orders', ordersRouter);

startExpireUnpaidOrdersJob();
subscribePaymentEvents();

app.listen(3000);
