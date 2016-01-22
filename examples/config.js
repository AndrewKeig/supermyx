const exchange = {
  name: "yubl.exchange",
  options: {
    type: 'direct',
    durable: true,
    autoDelete: false,
    confirm: true
  }
};

const queue = {
  name: 'yubl-worker',
  routingKey: 'yubl.key',
  options: {
    durable: true,
    exclusive: false,
    autoDelete: false 
  }
}

const amqp = {
  options: {
    heartbeat: 60,
    url: 'amqp://hmhjqabk:TNg-3lzxdo_xhvZf8NXE1ERrOrTi9Wgp@jaguar.rmq.cloudamqp.com/hmhjqabk'
  },
  implOptions: {
    reconnect: true,
    reconnectBackoffStrategy: 'linear',
    reconnectExponentialLimit: 120000,
    reconnectBackoffTime: 1000
  },
  producer: {
    exchange: exchange,
    queue: queue
  },
  consumer: {
    exchange: exchange,
    queue: queue,
    subscribe: {
      ack: true,
      prefetchCount: 1
    }
  }
}

module.exports = amqp;
