/**
 * ProjectController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get all project category list method.
   * @date 18 Oct 2019
   */
  fetch: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      const pageSlug = req.body.pageName !== undefined && req.body.pageName ? req.body.pageName : ''

      if (pageSlug) {
        const getDetails = await PageService.fetch([pageSlug, sails.config.custom.accountStatus.active])

        if (getDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__('msgRecordsFound', 'Page')
          response.data = {
            items: getDetails.rows[0],
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'page')
        }
      } else {
        response.msg = sails.__('msgNoRecordsFound', 'page')
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      return res.json(response)
    }
  },
}
