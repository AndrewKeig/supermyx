'use strict';

const amqp = require('amqp');
const logger = require('../logger')('amqp-consumer');

function consumer(cfg) {

  const subscribe = (routingKey, callback) => {
    const connection = amqp.createConnection(cfg.options, cfg.implOptions);
    const waitexchangeName = cfg.consumer.exchange.name + '.dead';

    connection.on('ready', () => {
      logger.info({ msg: 'connection ready'});
      info(cfg);

      connection.exchange(waitexchangeName, { durable: true, autoDelete: false, type: 'topic' }, function (ex) {
        connection.queue(routingKey + '/dead', {durable: true, autoDelete: false}, function (q) {
          q.bind(ex, '#');
        });
      });

      const exchange = connection.exchange(cfg.consumer.exchange.name, cfg.consumer.exchange.options);

      exchange.on('exchangeDeclareOk', () => {
        logger.info({ msg: 'exchange created'});
        logger.info({ msg: 'routing key:', data: routingKey});

        const queueOptions = Object.assign({}, cfg.consumer.queue.options, { arguments: { "x-dead-letter-exchange": waitexchangeName }});
        const queue = connection.queue(routingKey, queueOptions);

        queue.on('queueDeclareOk', () => {
          logger.info({ msg: 'queue created'});
          queue.bind(cfg.consumer.exchange.name, routingKey);
          logger.info({ msg: 'binding queue'});

          queue.once('queueBindOk', () => {
            logger.info({ msg: 'queue bound'});

            queue.subscribe(cfg.consumer.subscribe, (message, headers, deliveryInfo, messageObject) => {
              logger.info({ msg: 'subscribe receives message', data: message });
              logger.info({ msg: 'subscribe receives headers', data: headers });
              logger.info({ msg: 'subscribe receives deliveryInfo', data: deliveryInfo });

              callback(message, function(reject, requeue) {
                logger.info({ msg: 'shift and acknowledge message', data: { reject: reject, requeue: requeue } }); 
                queue.shift(reject, requeue);
              });
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

  const info = () => {
    logger.info({ msg: 'options: ', data: cfg.options});
    logger.info({ msg: 'impl options: ', data: cfg.implOptions});
    logger.info({ msg: 'exchange: ', data: cfg.consumer.exchange});
    logger.info({ msg: 'queue: ', data: cfg.consumer.queue});
    logger.info({ msg: 'queue subscriber:', data: cfg.consumer.subscribe});
  }

  return { subscribe }
}

module.exports = consumer;
