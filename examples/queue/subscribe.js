const options = {
  exchange: 'my.wq.exchange',
  log: 'my:log'
};

const consumer = require('../../index').queue('amqp://localhost:5672', options).consumer;

consumer.subscribe('build/timeline', (data, ack) => {
  console.log('%j', data);
  ack(false, false);
});

process.on('my:log', (msg) => {
  console.log('%j', msg);
});
