const config = require('./config');
const logger = require('../index').logger('amqp-publish');
const producer = require('../index').producer(config);

producer.publish('build/timeline', 'get me a timeline')
  .then(() => logger.info({ msg: 'published message to exchange'}))
  .catch(() => { logger.error({ msg: 'error'}); process.exit(); });

producer.publish('build/timeline', 'get me a timeline')
  .then(() => logger.info({ msg: 'published message to exchange'}))
  .then(() => process.exit())
  .catch(() => { logger.error({ msg: 'error'}); process.exit(); });

process.on('cmd-server:log', (msg) => {
  console.log(JSON.stringify(msg));
});
