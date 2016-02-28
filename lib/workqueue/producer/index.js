'use strict';

const amqp = require('amqp');

function producer(cfg, log) {

  const logger = require('../../logger')('amqp-producer-workqueue', log);

  const publish = (routingKey, payload) => {

    logger.info({ msg: 'connection', data: cfg});

    const exchangeName = routingKey.replace(/\//g,'.') + '.workqueue';
    const connection = amqp.createConnection(cfg.options, cfg.implOptions);
    const deadExchangeName = exchangeName + '.dead';

    return new Promise((resolve, reject) => {
      connection.on('ready', () => {
        logger.info({ msg: 'connection ready'});

        const exchange = connection.exchange(exchangeName, cfg.producer.exchange.options);

        exchange.on('exchangeDeclareOk', () => {
          logger.info({ msg: 'exchange created'});
          logger.info({ msg: 'routing key:', data: routingKey});

          const queueOptions = Object.assign({}, cfg.producer.queue.options, { arguments: { "x-dead-letter-exchange": deadExchangeName }});
          const queue = connection.queue(routingKey, queueOptions);

          queue.on('queueDeclareOk', () => {
            logger.info({ msg: 'queue created'});
            queue.bind(exchangeName, routingKey);
            logger.info({ msg: 'binding queue'});

            queue.once('queueBindOk', () => {
              logger.info({ msg: 'queue bound'});
              logger.info({ msg: 'payload:', data: payload});

              exchange.publish(routingKey, payload, cfg.producer.publish, (err) => {
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
          reject(err);
        }
      });

      connection.on('heartbeat', () => {
        logger.info({ msg: 'heartbeat closing connection'});
        close();
      });

      connection.on('close', () => {
        logger.info({ msg: 'connection closing'});
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
