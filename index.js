'use strict';

const producer = require('./messaging/producer');
const consumer = require('./messaging/consumer');

const queue = (url, options) => {
  const producerCfg = require('./messaging/config/queue/producer');
  const consumerCfg = require('./messaging/config/queue/consumer');

  producerCfg.options.url = url;
  consumerCfg.options.url = url;
  producerCfg.producer.exchange.name = options.exchange;
  consumerCfg.consumer.exchange.name = options.exchange;

  return {
    producer: producer(producerCfg, options.log),
    consumer: consumer(consumerCfg, options.log)
  }
}

const pubsub = (url, options) => {
  const producerCfg = require('./messaging/config/pubsub/producer');
  const consumerCfg = require('./messaging/config/pubsub/consumer');

  producerCfg.options.url = url;
  consumerCfg.options.url = url;
  producerCfg.producer.exchange.name = options.exchange;
  consumerCfg.consumer.exchange.name = options.exchange;

  return {
    producer: producer(producerCfg, options.log),
    consumer: consumer(consumerCfg, options.log)
  }
}

module.exports = {
  queue: queue,
  pubsub: pubsub
}
