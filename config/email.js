let config = require('./custom.js')

// let serviceName = ''
// if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'stage') {
//   serviceName = 'SES'
// } else {
//   serviceName = 'Gmail'
// }

module.exports.email = {
  service: 'Gmail',
  auth: {
    user: config.custom.appEmailUsername,
    pass: config.custom.appEmailPassword
  },
  //templateDir: 'api/emailTemplates',
  from: config.custom.noreplyEmail,
  testMode: false,
  ssl: false
}
