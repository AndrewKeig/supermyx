const config = require('./config');
const logger = require('../index').logger('amqp-consume');
const consumer = require('../index').consumer(config);


consumer.subscribe('build/timeline', (data, ack) => {
  logger.info({ msg: 'get timeline....again'});
  ack(false, false);
});

process.on('worker:log', (msg) => {
  console.log(JSON.stringify(msg));
});
