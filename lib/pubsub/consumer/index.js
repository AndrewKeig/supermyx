'use strict';

const amqp = require('amqp');

function consumer(cfg, log) {

  const logger = require('../../logger')('amqp-consumer-pubsub', log);

  const subscribe = (name, callback) => {

    const exchangeName = name.replace(/\//g,'.') + '.pubsub';

    logger.info({ msg: 'connection', data: cfg});
    logger.info({ msg: 'exchange', data: name });

    const connection = amqp.createConnection(cfg.options, cfg.implOptions);

    connection.on('ready', () => {
      logger.info({ msg: 'connection ready' });

      const exchange = connection.exchange(exchangeName, cfg.consumer.exchange.options);

      exchange.on('exchangeDeclareOk', () => {
        logger.info({ msg: 'exchange created'});

        const queue = connection.queue('', cfg.consumer.queue.options);

        queue.on('queueDeclareOk', () => {
          logger.info({ msg: 'queue created'});
          queue.bind(exchangeName, '');

          queue.once('queueBindOk', () => {
            logger.info({ msg: 'queue bound'});

            queue.subscribe((message) => {
              logger.info({ msg: 'subscribe receives message', data: message });
              callback(message);
            });
          });
        });
      });
    });

    connection.on('error', (err) => {
      if (err.code !== 'ECONNRESET') {
        logger.error({ msg: err });
        process.exit();
      }
    });

    connection.on('heartbeat', () => {
      logger.info({ msg: 'heartbeat'});
    });

    connection.on('close', () => {
      logger.info({ msg: 'connection closing'});
      process.exit();
    });
  };

  return { subscribe }
}

module.exports = consumer;
