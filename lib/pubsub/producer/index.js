'use strict';

const amqp = require('amqp');

let connection;

function producer(cfg, log) {

  const logger = require('../../logger')('amqp-producer-pubsub', log);

  const publish = (name, payload) => {

    return new Promise((resolve, reject) => {

      const exchangeName = name.replace(/\//g,'.') + '.pubsub';
      const connection = amqp.createConnection(cfg.options, cfg.implOptions);

      connection.on('ready', () => {

        logger.info({ msg: 'connection ready', data: cfg });
        logger.info({ msg: 'exchange', data: exchangeName });

        const exchange = connection.exchange(exchangeName, cfg.producer.exchange.options);

        exchange.on('exchangeDeclareOk', () => {
          logger.info({ msg: 'exchange publishing', data: payload });
         
          exchange.publish('', payload, cfg.producer.publish, (err) => {
            close(connection);
            return (err) ? reject() : resolve();
          });
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
        close();
      });

      connection.on('close', () => {
        logger.info({ msg: 'connection closing' });
      });
    });
  };

  const close = (connection) => {
    try {
      if (connection) {
        connection.disconnect();
      }
    }
    catch (e) {
      logger.error(logName, 'error', { msg: e });
    }
  }

  return { publish }
}

module.exports = producer;
