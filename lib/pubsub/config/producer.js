'use strict';

module.exports = {
  type: 'amqp',
  options: {
    heartbeat: 60,
    url: ''
  },
  implOptions: {
    reconnect: true,
    reconnectBackoffStrategy: 'linear',
    reconnectExponentialLimit: 120000,
    reconnectBackoffTime: 1000
  },
  producer: {
    exchange: {
      options: {
        type: 'fanout',
        durable: false,
        autoDelete: false,
        confirm: false
      }
    },
    publish: {
      deliveryMode: 1
    }
  }
};
