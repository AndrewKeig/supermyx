# supermyx

supermyx is a highly oppionated AMQP/RabbitMQ wrapper around `node-amqp` and implements two messaging patterns, `work queues` and `publish subscribe`.


# Supporting


### publisher confirms

By default supermyx uses the RabbitMQ extension `publisher confirms`, which ensures a message is delivered to RabbitMQ, we will reject on error here.


### acks

supermyx is also configured to use `acks`, which ensure a message when pulled from a queue is acknowledged before removing it from the queue.


### dead letter queue

supermyx will create a dead letter exchange/queue for each exchange configured, called ```<exchange-name>-<queue-name>-dead```, so calling `ack(true)` from a consumer will reject a message and push the message to a dead letter queue.


### Heartbeats

Heartbeats are configured at `60` seconds


### Reconnects

We support reconnects; using a linear strategy, at 120ms second intervals.


### Durability

Everything in supermyx is durable, exchanges, queues and messages.  Messages will expire after 1 hour.


## Install

```
$ npm install supermyx --save
```

## Options

By default supermyx will use the following options, these can be changed via options.

```
const optionsForWorkQueue = {
  exchange: 'queue.exchange',
  log: 'supermyx:log'
};


const optionsForPubSub = {
  exchange: 'pubsub.exchange',
  log: 'supermyx:log'
};

```


## Logs

supermyx will emit log messages at various intervals; so you can setup a handler listening to:

```
process.on('my:log', (msg) => {
  console.log('%j', msg);
});
```

## Work Queue

The following is also included in the examples folder.

The following example configuration is for a work queue.  A work queue contains a single queue.  Each consumer pulls a single message off the queue in a round robin fashion; so load is distributed evenly amongst consumers.


### Producer

Currently each producer creates its own amqp connection. This is not ideal, and we will change this to a connection pool asap.  The connection is closed when the message is published.

The supermyx producer is promise based; so on error this producer will promise `reject`; on success, promise `resolve`.

```
const options = {
  exchange: 'my.wq.exchange',
  log: 'my:log'
};

const producer = require('../../index').queue('amqp://localhost:5672', options).producer;

producer.publish('build/timeline', 'get me a timeline')
  .then(() => console.log('published message to exchange'))
  .catch((err) => { console.error('error %s', err); process.exit(); });

process.on('my:log', (msg) => {
  console.log('%j', msg);
});

```


### Consumer

Each consumer creates its own amqp connection.  The consumer is callback based.  Any errors thown by `node-amqp` and this consumer will `process.exit`, so you will need to use somthing like `pm2` to restart your process.  In order to avoid the process exiting with regard to errors thrown inside the consumer, you should create your own error handling inside the consumer.

```
const options = {
  exchange: 'my.wq.exchange',
  log: 'my:log'
};

const consumer = require('../../index').queue('amqp://localhost:5672', options).consumer;

consumer.subscribe('build/timeline', (data, ack) => {
  console.log('%j', data);

  // Do work here
  const ok = true;

  if (ok) {
    // message processed successfully
    ack(false, false);
  } else {
    // dead letter this message
    ack(true);
  }
});

process.on('my:log', (msg) => {
  console.log('%j', msg);
});

```


## Pub Sub

The following is also included in the examples folder.

The following example configuration is for pubsub.  Each consumer creates its own queue bound to the same exchange.  Messages published to this exchange will to routed to each consumer.


### Producer

Currently each producer creates its own amqp connection. This is not ideal, and we will change this to a connection pool asap.  The connection is closed when the message is published.

On error this producer will promise `reject`; on success, promise `resolve`.

```
const options = {
  exchange: 'my.ps.exchange',
  log: 'my:log'
};

const producer = require('../../index').pubsub('amqp://localhost:5672', options).producer;

producer.publish('send/message', 'get me a timeline')
  .then(() => console.log('published message to exchange'))
  .catch((err) => { console.error('error %s', err); process.exit(); });

process.on('my:log', (msg) => {
  console.log('%j', msg);
});

```


### Consumer

Each consumer creates its own amqp connection.  On error this consumer will `process.exit`, so you will need to use somthing like `pm2` to restart your process.

```
const options = {
  exchange: 'my.ps.exchange',
  log: 'my:log'
};

const consumer = require('../../index').pubsub('amqp://localhost:5672', options).consumer;

consumer.subscribe('send/message', (data, ack) => {
  console.log('%j', data);

  // Do work here
  const ok = true;

  if (ok) {
    // message processed successfully
    ack(false, false);
  } else {
    // dead letter this message
    ack(true);
  }
});

process.on('my:log', (msg) => {
  console.log('%j', msg);
});

```
