'use strict';

const amqp = require('amqp');

function consumer(cfg, log) {

  const logger = require('../../logger')('amqp-consumer-workqueue', log);

  const subscribe = (routingKey, callback) => {

    logger.info({ msg: 'connection', data: cfg});

    const exchangeName = routingKey.replace(/\//g,'.') + '.workqueue';
    const connection = amqp.createConnection(cfg.options, cfg.implOptions);
    const deadExchangeName = exchangeName + '.dead';

    connection.on('ready', () => {
      logger.info({ msg: 'connection ready'});

      connection.exchange(deadExchangeName, { durable: true, autoDelete: false, type: 'topic' }, (ex) => {
        connection.queue(routingKey + '/dead', {durable: true, autoDelete: false}, (q) => {
          q.bind(ex, '#');
        });
      });

      const exchange = connection.exchange(exchangeName, cfg.consumer.exchange.options);

      exchange.on('exchangeDeclareOk', () => {
        logger.info({ msg: 'exchange created'});
        logger.info({ msg: 'routing key:', data: routingKey});

        const queueOptions = Object.assign({}, cfg.consumer.queue.options, { arguments: { "x-dead-letter-exchange": deadExchangeName }});
        const queue = connection.queue(routingKey, queueOptions);

        queue.on('queueDeclareOk', () => {
          logger.info({ msg: 'queue created'});
          queue.bind(exchangeName, routingKey);
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
      console.log(err);
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
