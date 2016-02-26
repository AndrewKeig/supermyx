const options = {
  exchange: 'my.wq.exchange',
  log: 'my:log'
};

const producer = require('../../index').queue('amqp://localhost:5672', options).producer;

producer.publish('build/timeline', 'get me a timeline')
  .then(() => console.log('published message to exchange'))
  .catch((err) => { console.error('error %s', err); process.exit(); });

producer.publish('build/timeline', 'get me another timeline')
  .then(() => console.log('published message to exchange'))
  .then(() => process.exit())
  .catch(() => { console.error('error'); process.exit(); });

process.on('my:log', (msg) => {
  console.log('%j', msg);
});
