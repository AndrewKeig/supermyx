const options = {
  log: 'my:log'
};

const consumer = require('../../index').workqueue('amqp://localhost:5672', options).consumer;

consumer.subscribe('build/timeline', (data, ack) => {
  console.log('%j', data);
  ack(false, false);
});

process.on('my:log', (msg) => {
  console.log('%j', msg);
});
