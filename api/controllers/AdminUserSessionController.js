/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description List all user sessions method.
   * @date 02 Oct 2019
   */
  list: async function (req, res) {
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
        let page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.defaultConfig.page
        let limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.defaultConfig.limit
        let status = req.body.status !== undefined && req.body.status ? req.body.status : ''
        let search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        let sort = req.body.sort !== undefined && req.body.sort ? req.body.sort : '-null'

        let listParam = {
          page: page,
          limit: limit,
          status: status,
          search: search,
          sort: sort
        }

        let getUserSessionsDetails = await AdminUserSessionService.list(listParam)

        response.status = 'success'
        if (getUserSessionsDetails.rowCount > 0) {
          response.msg = sails.__('msgRecordsFound', 'User sessions')
          response.data = {
            items: getUserSessionsDetails.rows,
            total: getUserSessionsDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'users')
        }
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      return res.json(response)
    }
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update status of user session method.
   * @date 02 Oct 2019
   */
  updateStatus: async function (req, res) {
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
        if (req.body.userSessionId !== undefined && req.body.userSessionId && req.body.status !== undefined && req.body.status) {
          let userSessionId = req.body.userSessionId
          let status = req.body.status
          let updateUserSessionStatusDetails = await AdminUserSessionService.updateStatus(
            [status, CustomService.currentDate(), userSessionId]
          )

          let successMsg = ''
          let errorMsg = ''
          if (status === 'active') {
            successMsg = sails.__('msgDataActivated', 'Record')
            errorMsg = sails.__('msgDataActivatedError')
          } else {
            successMsg = sails.__('msgDataInactivated', 'Record')
            errorMsg = sails.__('msgDataInactivatedError')
          }

          if (updateUserSessionStatusDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = successMsg
          } else {
            response.msg = errorMsg
          }
        } else {
          response.msg = sails.__('msgRequiredParamMissing')
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
