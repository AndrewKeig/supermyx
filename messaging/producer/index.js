'use strict';

const amqp = require('amqp');
const logger = require('../logger')('amqp-producer');

function producer(cfg) {

  const publish = (payload) => {
    const connection = amqp.createConnection(cfg.options, cfg.implOptions);

    return new Promise((resolve, reject) => {      
      connection.on('ready', () => {
        logger.info({ msg: 'connection ready'});
        info(cfg);

        const exchange = connection.exchange(cfg.producer.exchange.name, cfg.producer.exchange.options);

        exchange.on('exchangeDeclareOk', () => {
          logger.info({ msg: 'exchange created'});

          const queue = connection.queue(cfg.producer.queue.name, cfg.producer.queue.options);

          queue.on('queueDeclareOk', () => {
            logger.info({ msg: 'queue created'});
            queue.bind(cfg.producer.exchange.name, cfg.producer.queue.routingKey);
            logger.info({ msg: 'binding queue'});

            queue.once('queueBindOk', () => {
              logger.info({ msg: 'queue bound'});
              logger.info({ msg: 'payload:', data: payload});

              exchange.publish(cfg.producer.queue.routingKey, payload, {}, (err) => {
                close(connection);
                return (err) ? reject() : resolve();
              });
            });
          });
        });
      });

      connection.on('error', (err) => {
        if (err.code !== 'ECONNRESET') {
          logger.error({ msg: err });
          reject();
        }
      });

      connection.on('heartbeat', () => {
        close();
      });

      connection.on('close', () => {
        logger.info({ msg: 'connection closing'});
      });
    });
  };

  const info = () => {
    logger.info({ msg: 'options: ', data: cfg.options});
    logger.info({ msg: 'impl options: ', data: cfg.implOptions});
    logger.info({ msg: 'exchange: ', data: cfg.producer.exchange});
    logger.info({ msg: 'queue: ', data: cfg.producer.queue});
    logger.info({ msg: 'routing key:', data: cfg.producer.queue.routingKey});
  }

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