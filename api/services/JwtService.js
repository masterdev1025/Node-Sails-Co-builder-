var jwt = require('jsonwebtoken')
var jwtSecret = sails.config.secrets.jwtSecret

module.exports = {
  issue: function(payload) {
    token = jwt.sign(payload, jwtSecret, {
      expiresIn: sails.config.custom.tokenSeconds
    }) // 30 Days Time.
    return token
  },

  verify: function(token, callback) {
    return jwt.verify(token, jwtSecret, callback)
  },

  /**
   * @author Khushang M. Bhavnagarwala
   * @description Generate bearer at a time of login.
   * @date 11 July 2019
   */
  generateBearer: async function(userId, firstName, lastName, email) {
    return await this.issue({
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      email: email
    })
  }
}
