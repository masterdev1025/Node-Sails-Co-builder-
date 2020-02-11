/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Check whether email id exists or not.
   * @date 11 July 2019
   */
  getData: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.method === 'OPTIONS') {
        response.status = 'success'
        response.msg = 'Nothing to do here with options.'
      } else {
        let getDashboardDetails = await AdminDashboardService.getData()

        response.status = 'success'
        response.msg = sails.__('msgRecordsFound', 'Dashboard')
        response.data = {
          totalUsersCount: getDashboardDetails.totalUsersCount,
          totalActiveUsersCount: getDashboardDetails.totalActiveUsersCount
        }
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      return res.json(response)
    }
  }
}
