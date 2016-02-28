'use strict';

function logger(event, logName) {
  logName = logName || 'supermyx:log';

  const error = (data) => {
    log(event, 'error', data);
  }

  const info = (data) => {
    log(event, 'info', data);
  }

  const log = (event, level, data) => {
    let logMsg = { level: level, event: event, data: data };
    process.emit(logName, logMsg);
  }

  return { info, error, log };
}

module.exports = logger;
