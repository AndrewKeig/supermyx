'use strict';

const workqueue = (url, options) => {

  const producer = require('./lib/workqueue/producer');
  const consumer = require('./lib/workqueue/consumer');
  const producerCfg = require('./lib/workqueue/config/producer');
  const consumerCfg = require('./lib/workqueue/config/consumer');

  producerCfg.options.url = url;
  consumerCfg.options.url = url;

  return {
    producer: producer(producerCfg, options.log),
    consumer: consumer(consumerCfg, options.log)
  }
}

const pubsub = (url, options) => {

  const producer = require('./lib/pubsub/producer');
  const consumer = require('./lib/pubsub/consumer');
  const producerCfg = require('./lib/pubsub/config/producer');
  const consumerCfg = require('./lib/pubsub/config/consumer');

  producerCfg.options.url = url;
  consumerCfg.options.url = url;

  return {
    producer: producer(producerCfg, options.log),
    consumer: consumer(consumerCfg, options.log)
  }
}

module.exports = {
  workqueue: workqueue,
  pubsub: pubsub
}
