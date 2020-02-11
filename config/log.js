/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * https://sailsjs.com/docs/concepts/logging
 */

var winston = require('winston')
let commonSettings = {
  colorize: false,
  maxsize: 10000000,
  maxfiles: 10,
  json: false
}

let settings = [
  {
    filename: `logs/error.log`,
    level: 'error',
    colorize: false,
    format: winston.format.simple()
  }
  // {filename: `logs/warn.log`, level: 'warn', colorize: false, format: winston.format.simple()},
  // {filename: `logs/debug.log`, level: 'debug'},
  // {filename: `logs/info.log`, level: 'info'}
]

let { transports, createLogger, format } = winston
let { combine, timestamp, label, printf } = format

let myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})

let loggerSettings = {
  format: combine(myFormat, label({ label: 'Right!' }), timestamp()),
  transports: [
    ...settings.map(
      s =>
        new transports.File({
          ...s,
          ...commonSettings
        })
    ),
    new transports.Console({
      format: format.simple()
    })
  ],
  exitOnError: false
}

// This is the workaround
let winstonLogger = createLogger(loggerSettings)
let logger = {
  // 'info': function () {
  //   winstonLogger.info(...arguments);
  // },
  // 'debug': function () {
  //   winstonLogger.debug(...arguments);
  // },
  // 'warn': function () {
  //   winstonLogger.warn(...arguments);
  // },
  error: function() {
    winstonLogger.error(...arguments)
  },
  log: function() {
    winstonLogger.log(...arguments)
  }
}
// End of workaround

module.exports.log = {
  /***************************************************************************
   *                                                                          *
   * Valid `level` configs: i.e. the minimum log level to capture with        *
   * sails.log.*()                                                            *
   *                                                                          *
   * The order of precedence for log levels from lowest to highest is:        *
   * silly, verbose, info, debug, warn, error                                 *
   *                                                                          *
   * You may also set the level to "silent" to suppress all logs.             *
   *                                                                          *
   ***************************************************************************/
  level: 'warn',
  colors: false, // To get clean logs without prefixes or color codings
  custom: logger
}
