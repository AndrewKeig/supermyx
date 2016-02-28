'use strict';

const amqp = require('amqp');

function producer(cfg, log) {

  let connection;

  if (!connection) {
    connection = amqp.createConnection(cfg.options, cfg.implOptions);
  }

  const logger = require('../../logger')('amqp-producer-pubsub', log);

  const publish = (name, payload) => {

    return new Promise((resolve, reject) => {

      const exchangeName = name.replace(/\//g,'.') + '.pubsub';

      connection.on('ready', () => {

        logger.info({ msg: 'connection ready', data: cfg });
        logger.info({ msg: 'exchange', data: exchangeName });

        const exchange = connection.exchange(exchangeName, cfg.producer.exchange.options);

        exchange.on('exchangeDeclareOk', () => {
          logger.info({ msg: 'exchange publishing', data: payload });
          exchange.publish('', payload, cfg.producer.publish);
          resolve();
        });
      });

      connection.on('error', (err) => {
        if (err.code !== 'ECONNRESET') {
          logger.error({ msg: err });
          reject(err);
        }
      });

      connection.on('heartbeat', () => {
        logger.info({ msg: 'heartbeat closing connection' });
      });

      connection.on('close', () => {
        logger.info({ msg: 'connection closing' });
      });
    });
  };

  return { publish }
}

module.exports = producer;
