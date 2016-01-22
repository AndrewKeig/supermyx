const psexchange = {
  name: "yubl.pubsub.exchange",
  options: {
    type: 'fanout',
    durable: true,
    autoDelete: false,
    confirm: true
  }
};

const wqexchange = {
  name: "yubl.workqueue.exchange",
  options: {
    type: 'direct',
    durable: true,
    autoDelete: false,
    confirm: true
  }
};

const queue = {
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
    exchange: wqexchange,
    queue: queue
  },
  consumer: {
    exchange: wqexchange,
    queue: queue,
    subscribe: {
      ack: true,
      prefetchCount: 1
    }
  }
}

module.exports = amqp;
