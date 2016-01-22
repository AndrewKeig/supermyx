const config = require('./config');
const logger = require('../index').logger('amqp-publish');
const producer = require('../index').producer(config);

producer.publish('andrew')
  .then(() => logger.info({ msg: 'published message to exchange'}))
  .then(() => process.exit())
  .catch(() => { logger.error({ msg: 'error'}); process.exit(); });

process.on('amqp-log', (msg) => {
  console.log(JSON.stringify(msg));
});
