const options = {
  exchange: 'my.ps.exchange',
  log: 'my:log'
};

const producer = require('../../index').pubsub('amqp://localhost:5672', options).producer;

producer.publish('send/message', 'get me a timeline')
  .then(() => console.log('published message to exchange'))
  .catch((err) => { console.error('error %s', err); process.exit(); });

producer.publish('send/message', 'get me another timeline')
  .then(() => console.log('published message to exchange'))
  .then(() => process.exit())
  .catch(() => { console.error('error'); process.exit(); });

process.on('my:log', (msg) => {
  console.log('%j', msg);
});
