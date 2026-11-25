// Thin wrapper around the company message bus SDK. In production the SDK connection is configured
// by the deployment environment; this module only keeps the handlers registered by the API.
const handlers = new Map();

function subscribe(topic, handler) {
  handlers.set(topic, handler);
}

function publishForTesting(topic, event) {
  const handler = handlers.get(topic);
  if (handler) {
    handler(event);
  }
}

module.exports = { subscribe, publishForTesting };
