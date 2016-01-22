# supermyx

supermyx is an oppionated rabbitmq wrapper around node-amqp.



## producer
```
const config = require('./config');
const producer = require('../index').producer(config);

producer.publish('andrew')
  .then(() => console.log({ msg: 'published message to exchange'}))
  .then(() => process.exit())
  .catch(() => { console.log({ msg: 'error'}); process.exit(); });

process.on('amqp-log', (msg) => {
  console.log(JSON.stringify(msg));
});

```


## consumer
```

const config = require('./config');
const consumer = require('../index').consumer(config);

consumer.subscribe(config.consumer.queue.routingKey, (data, ack) => {
  console.log({ msg: 'doing work'});
  ack();
});

process.on('amqp-log', (msg) => {
  console.log(JSON.stringify(msg));
});


```

## configuration

```
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


```
