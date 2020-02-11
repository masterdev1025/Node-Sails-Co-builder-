/**
 * ProjectController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fs = require('fs')

module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get all images list method.
   * @date 02 Dec 2019
   */
  image: function (req, res) {
    // res.sendfile('assets/' + req.path.substr(1))
    let path = __dirname + '/../../assets/' + req.path.substr(1)
    if (fs.existsSync(path)) {
      res.sendfile('assets/' + req.path.substr(1))
    } else {
      res.sendfile('assets/uploads/no-image.png')
    }
  },
  static: function (req, res) {
    // res.sendfile('assets/' + req.path.substr(1))
    let path = __dirname + '/../../assets/' + req.path.substr(1)
    if (fs.existsSync(path)) {
      res.sendfile('assets/' + req.path.substr(1))
    } else {
      res.sendfile('assets/uploads/no-image.png')
    }
  }
}
