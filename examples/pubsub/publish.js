const options = {
  log: 'my:log'
};

const producer = require('../../index')
  .pubsub('amqp://localhost:5672', options)
  .producer;

producer.publish('notify', { payload: 'send a notification'})
  .then(() => console.log('published message to exchange'))
  .catch((err) => { console.error('error %s', err); process.exit(); });

producer.publish('notify', { payload: 'send a notification'})
  .then(() => console.log('published message to exchange'))
  .catch((err) => { console.error('error %s', err); process.exit(); });

process.on('my:log', (msg) => {
  console.log('%j', msg);
});
