#!/usr/bin/env node
const { program } = require('commander');
const repository = require('../src/orders/order-repository');

program.name('order-desk-admin').description('Back-office tools for Order Desk staff');

program
  .command('export-orders')
  .description('Print orders as CSV for the warehouse')
  .option('--status <status>', 'only orders in this status', 'paid')
  .action(({ status }) => {
    const rows = repository
      .list({ status })
      .map((order) => [order.id, order.customerId, order.status, order.items.length].join(','));
    console.log(['id,customer,status,items', ...rows].join('\n'));
  });

program.parse();
