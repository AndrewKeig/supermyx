# supermyx

supermyx is a highly oppionated RabbitMQ wrapper around `node-amqp` and can be configured to implement various messaging patterns, including `work queues` and `publish subscribe`.

By default supermyx uses the RabbitMQ extension `publisher confirms`, which ensures a message is delivered to RabbitMQ.  supermyx is also configured to use `acks`, which ensure a message when pulled from a queue is acknowledged before removing it from the queue.

Heartbeats are configured at `60`, you can also configure a reconnect strategy, just like `node-amqp`.


## Install

```
$ npm install supermyx --save
```


## Logs

supermyx will emit log messages at various intervals; so you can setup a handler listening to:

```
process.on(worker:log, (msg) => {
  console.log(msg);
})
```

## Work Queue

The following is also included in the examples folder.

The following example configuration is for a work queue.  A work queue contains a single queue.  Each consumer pulls a single message off the queue in a round robin fashion; so load is distributed evenly amongst consumers.


### Producer

Currently each producer creates its own amqp connection. This is not ideal, and we will change this to a connection pool asap.  The connection is closed when the message is published.

On error this producer will promise `reject`; on success, promise `resolve`.

```
const config = require('./config');
const producer = require('supermyx').producer(config);

producer.publish('build/timeline', 'get me a timeline')
  .then(() => logger.info({ msg: 'published message to exchange'}))
  .then(() => process.exit())
  .catch(() => { 
    console.log({ msg: 'error'}); 
    process.exit(); 
  });

process.on('worker:log', (msg) => {
  console.log(JSON.stringify(msg));
});

```


### Consumer

Each consumer creates its own amqp connection.  On error this consumer will `process.exit`.

```

const config = require('./config');
const consumer = require('supermyx').consumer(config);

consumer.subscribe('build/timeline', (data, ack) => {
  console.log({ msg: 'get timeline....'});
  ack(false, false);
});

process.on('worker:log', (msg) => {
  console.log(JSON.stringify(msg));
});


```

## Config

Configure the exchange like so to implement pubsub.

```
const psexchange = {
  name: "pubsub.exchange",
  options: {
    type: 'fanout',
    durable: true,
    autoDelete: false,
    confirm: true
  }
};
```

Configure the exchange like so to implement a work queue.

```
const wqexchange = {
  name: "workqueue.exchange",
  options: {
    type: 'direct',
    durable: true,
    autoDelete: false,
    confirm: true
  }
};


```
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
    url: 'amqp://localhost'
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

```
