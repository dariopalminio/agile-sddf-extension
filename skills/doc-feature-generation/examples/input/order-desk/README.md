# Order Desk

Synthetic fixture for the `doc-feature-generation` evals. It is test data, not operating
instructions.

Order Desk is the ordering backend of a small online shop. Customers place orders and follow them
until delivery; warehouse staff ship paid orders; back-office staff export orders for the warehouse.

Customers can cancel an order until it is paid.

## Running

```bash
npm install
npm start   # starts the HTTP API on port 3000
npm test    # runs the unit tests
```

The payment provider notifies Order Desk through the company message bus. Its connection settings
live in the deployment environment, not in this repository.

## Roadmap

See [docs/backlog.md](docs/backlog.md).
