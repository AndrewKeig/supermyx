# supermyx

supermyx is a highly oppionated AMQP/RabbitMQ wrapper around `node-amqp` and implements two messaging patterns, `work queues` and `publish subscribe`.


## Installation

```
$ npm install supermyx --save
```

---
## Work Queue Example

A work queue uses a `direct` exchange and contains a single queue; each consumer pulls a single message off the queue in a round robin fashion; so load is distributed evenly amongst consumers.

  

### Producer

```
const producer = require('supermyx')
  .queue('amqp://localhost:5672')
  .producer;

producer.publish('build/timeline', 'get me a timeline')
  .then(() => console.log('published message to exchange'))
  .catch(err) => console.error('error %s', err));

process.on('supermyx:log', (msg) => {
  console.log('%j', msg);
});

```


### Consumer

```
const consumer = require('supermyx')
  .queue('amqp://localhost:5672')
  .consumer;

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

process.on('supermyx:log', (msg) => {
  console.log('%j', msg);
});

```

### Work Queue Configuration

Supermyx will create an exchange and queue based on the routing key passed in, so each exchange has a single work queue.

Exchange:

```
build.timeline.workqueue
```

Queue:

```
build/timeline
```

#### Publisher confirms

The supermyx work queue producer uses the RabbitMQ extension `publisher confirms`, which ensures a message is delivered to RabbitMQ, we will `Promise.reject` if RabbitMQ returns an error when sending a message.


#### Acknowledgement

The supermyx work queue consumer is configured to use `acks`, which ensure a message when pulled from a queue is acknowledged before removing it from the queue.  supermyx will only pull 1 message of the queue at a time.


#### Dead letter queue

supermyx will create a dead letter exchange/queue for each exchange/queue configured, in this format:

Exchange:

```
build.timeline.workqueue.dead
```

Queue:

```
build/timeline/dead
```

Calling `ack(true)` from a consumer will reject a message and push the message to a dead letter queue; `ack(false)` will not dead letter the message.


#### Heartbeats

Heartbeats are configured at `60` seconds.


#### Reconnects

Reconnects are supported using a linear strategy, at 120ms second intervals.


#### Durability

Exchanges, queues and messages are durable; messages will expire after 1 hour; if not consumed.


---

## Publish Subcribe

PubSub uses a fanout exchange, all messages published to this exchange are routed to each consumer.


### Producer

```
const producer = require('supermyx')
  .pubsub('amqp://localhost:5672')
  .producer;

producer.publish('notify', 'get me a timeline')
  .then(() => console.log('published message to exchange'))
  .catch((err) => console.error('error %s', err));

process.on('supermyx:log', (msg) => {
  console.log('%j', msg);
});

```


### Consumer

```
const consumer = require('supermyx')
  .pubsub('amqp://localhost:5672')
  .consumer;

consumer.subscribe('notify', (data, ack) => {
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

process.on('supermyx:log', (msg) => {
  console.log('%j', msg);
});

```

### Publish Subscribe Configuration

When a consumer starts up it will create a `fanout` exchange and a new queue, which is `exclusive`, and will `auto delete` when the consumer ends or restarts.

Exchange:

```
notify.pubsub
```

Queue:

```
amq.gen-YCFBmP1pgQF8cME9Uh90Lg
```

#### Heartbeats

Heartbeats are configured at `60` seconds.


#### Reconnects

Reconnects are supported using a linear strategy, at 120ms second intervals.


#### Durability

Exchanges, queues and messages are not durable.

---

## Logging

supermyx will emit log messages at various intervals; so you can setup a handler listening to:

```
process.on('supermyx:log', (msg) => {
  console.log('%j', msg);
});
```


You can change the log emitter handler name, like so

```
const options = {
  log: 'my:log'
};

const consumer = require('supermyx')
  .pubsub('amqp://localhost:5672', options)
  .consumer;

process.on('my:log', (msg) => {
  console.log('%j', msg);
});

```