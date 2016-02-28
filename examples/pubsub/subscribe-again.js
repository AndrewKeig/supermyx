const options = {
  log: 'my:log'
};

const consumer = require('../../index')
  .pubsub('amqp://localhost:5672', options)
  .consumer;

consumer.subscribe('notification.fanout', (data) => {
  console.log('%j', data);
});

process.on('my:log', (msg) => {
  console.log('%j', msg);
});
