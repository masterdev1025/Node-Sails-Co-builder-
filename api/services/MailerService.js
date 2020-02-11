module.exports = {
  // mailName = 'welcomeEmail'
  // mailParams = {
  //   Name: obj.name,
  //   Email: obj.email,
  //   emailConfirmationLink: obj.emailConfirmationLink
  // };
  // mailOptions = {
  //   to: obj.email,
  //   subject: sails.config.custom.appName + ' - Email Confirmation',
  //   from: sails.config.custom.appName + ' <'+ sails.config.custom.noreplyEmail +'>',
  //   sender: sails.config.custom.noreplyEmail,
  // };
  sendEmail: async function(mailName, mailParams, mailOptions) {
    await sails.hooks.email.send(
      mailName,
      mailParams,
      mailOptions,
      err => {
        console.log(err)
        if (err) {
          console.log('Email not send sucessfully -', err)
        } else {
          console.log('Email send sucessfully.')
        }
      }
      //(err) => {console.log(err || 'Mail Sent!');}
    )
  }
}
