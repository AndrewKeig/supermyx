const options = {
  exchange: 'my.ps.exchange',
  log: 'my:log'
};

const consumer = require('../../index').pubsub('amqp://localhost:5672', options).consumer;

consumer.subscribe('send/message', (data, ack) => {
  console.log('%j', data);
  ack(false, false);
});

process.on('my:log', (msg) => {
  console.log('%j', msg);
});
