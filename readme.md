# supermyx

supermyx is an oppionated rabbitmq wrapper around node-amqp



## producer
```

const logger = require('../messaging/logger')('amqp-produce');
const config = require('../config');
const p = require('../index').producer(config);

p.publish('andrew')
  .then(() => logger.logInfo({ msg: 'published message to exchange'}))
  .then(() => process.exit())
  .catch(() => logger.logError({ msg: 'error'}));

process.on(config.log, (msg) => {
  console.log(JSON.stringify(msg));
});

```


## consumer
```

const logger = require('../messaging/logger')('amqp-consume');
const config = require('../config');
const c = require('../index').consumer(config);

c.consume(config.subscribe.queue.routingKey, (data, ack) => {
  logger.logInfo({ msg: 'doing work'});
  ack();
})

process.on(config.log, (msg) => {
  console.log(JSON.stringify(msg));
});



```

```
const amqp = {
    log: 'cmd-server:log',
    showInfo: true,
    options: {
        heartbeat: 60,
        url: 'amqp://hmhjqabk:TNg-3lzxdo_xhvZf8NXE1ERrOrTi9Wgp@jaguar.rmq.cloudamqp.com/hmhjqabk'
    },
    implOptions: {
        reconnect: true,
        reconnectBackoffStrategy: 'linear',
        reconnectExponentialLimit: 120000,
        reconnectBackoffTime: 1000
    },
    publish: {
      exchange: {
        name: "yubl.exchange",
        options: {
          type: 'direct',
          durable: true,
          autoDelete: false,
          confirm: true
        }
      },
      queue: {
        name: 'yubl-worker',
        routingKey: 'yubl.key', 
        options: {
          durable: true,
          exclusive: false,
          autoDelete: false 
        }
      }
    },
    subscribe: {
      exchange: {
        name: "yubl.exchange",
        options: {
          type: 'direct',
          durable: true,
          autoDelete: false,
          confirm: true
        }
      },
      queue: {
        name: 'yubl-worker',
        routingKey: 'yubl.key', 
        options: {
          durable: true,
          exclusive: false,
          autoDelete: false 
        }
      },
      consume: {
        ack: true,
        prefetchCount: 1
      }
    }
}

```
