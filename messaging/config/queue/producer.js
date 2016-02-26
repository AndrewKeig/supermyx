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
      name: 'queue.exchange',
      options: {
        type: 'direct',
        durable: true,
        autoDelete: false,
        confirm: true
      }
    },
    queue: {
      options: {
        durable: true,
        exclusive: false,
        autoDelete: false
      }
    },
    publish: {
      deliveryMode: 2,
      expiration: "600000" //60 minutes
    }
  }
};
