'use strict';

function logger(event) {
  const error = (data) => {
    log(event, 'error', data);
  }

  const info = (data) => {
    log(event, 'info', data);
  }

  const log = (event, level, data) => {
    let logMsg = { level: level, event: event, data: data };
    process.emit('amqp-log', logMsg);
  }

  return { info, error, log };
}

module.exports = logger;