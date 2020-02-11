/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
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

        let getRequestLogDetails = await AdminRequestLogService.list(listParam)

        response.status = 'success'
        if (getRequestLogDetails.rowCount > 0) {
          response.msg = sails.__('msgRecordsFound', 'Request log')
          response.data = {
            items: getRequestLogDetails.rows,
            total: getRequestLogDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'request log')
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
