const config = require('./config');
const logger = require('../index').logger('amqp-consume');
const consumer = require('../index').consumer(config);

consumer.subscribe(config.consumer.queue.routingKey, (data, ack) => {
  logger.info({ msg: 'doing work'});
  ack();
});

process.on('amqp-log', (msg) => {
  console.log(JSON.stringify(msg));
});
