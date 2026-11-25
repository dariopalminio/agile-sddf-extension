const express = require('express');
const { requireRole } = require('../middleware/require-role');
const service = require('./order-service');

const ordersRouter = express.Router();

ordersRouter.post('/', (req, res) => respond(res, () => service.placeOrder(req.user, req.body.items), 201));
ordersRouter.post('/:id/confirm', (req, res) => respond(res, () => service.confirmOrder(req.user, req.params.id)));
ordersRouter.post('/:id/cancel', (req, res) => respond(res, () => service.cancelOrder(req.user, req.params.id)));
ordersRouter.post('/:id/ship', requireRole('warehouse'), (req, res) => respond(res, () => service.shipOrder(req.params.id)));
ordersRouter.get('/:id', (req, res) => respond(res, () => service.getOrderStatus(req.user, req.params.id)));

function respond(res, action, okStatus = 200) {
  try {
    res.status(okStatus).json(action());
  } catch (error) {
    res.status(error.httpStatus || 500).json({ error: error.message });
  }
}

module.exports = { ordersRouter };
