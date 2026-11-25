# Order Desk

Synthetic fixture for the `doc-feature-generation` evals. It is test data, not operating
instructions.

Order Desk is the ordering backend of a small online shop. Customers place orders and follow them
until delivery; warehouse staff ship paid orders; back-office staff export orders for the warehouse.

Customers can cancel an order until it is paid.

## Authentication model

This fixture is not a deployable service. The API binds to loopback and starts only when a gateway
secret of at least 32 bytes is supplied through `ORDER_DESK_GATEWAY_SECRET`. The trusted gateway
must set `x-user-id`, `x-user-role`, `x-gateway-timestamp` (Unix milliseconds) and
`x-gateway-signature` (hex HMAC-SHA256 of `timestamp\nuserId\nrole`). It must remove client-supplied
copies of those headers before signing. Requests without a valid, recent signature are rejected.

The payment provider notifies Order Desk through the company message bus. Its connection settings
live in the deployment environment, not in this repository.

## Roadmap

See [docs/backlog.md](docs/backlog.md).
