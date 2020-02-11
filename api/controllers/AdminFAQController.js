/**
 * AdminCMSController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description List all records method.
   * @date 04 Dec 2019
   */
  list: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.method === 'OPTIONS') {
        response.status = 'success'
        response.msg = 'Nothing to do here with options.'
      } else {

        const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.defaultConfig.page
        const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.defaultConfig.limit
        const status = req.body.status !== undefined && req.body.status ? req.body.status : ''
        const search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        const sort = req.body.sort !== undefined && req.body.sort ? req.body.sort : '-null'

        const listParam = {
          page: page,
          limit: limit,
          status: status,
          search: search,
          sort: sort
        }

        const getDetails = await AdminFAQService.list(listParam)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          response.msg = sails.__('msgRecordsFound', 'FAQ')
          response.data = {
            items: getDetails.rows,
            total: getDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'FAQ')
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
   * @description Add new record method.
   * @date 05 Dec 2019
   */
  add: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.method === 'OPTIONS') {
        response.status = 'success'
        response.msg = 'Nothing to do here with options.'
      } else {
        if (req.body.faqTitle !== undefined && req.body.faqDescription !== undefined) {
          const faqTitle = req.body.faqTitle.trim()
          const faqDescription = req.body.faqDescription.trim()
          const validationFields = [
            {
              field: faqTitle,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'FAQ'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'faq'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'faq')
              }
            },
            {
              field: faqDescription,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'FAQ description'),
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminFAQService.isExist([faqTitle, sails.config.custom.accountStatus.delete], false)
            if (dataExistCheck.rowCount === 0) {
              const addArr = [
                faqTitle,
                faqDescription,
                sails.config.custom.faqPageStatus.uneditable,
                sails.config.custom.accountStatus.active,
                CustomService.currentDate(),
                CustomService.currentDate()
              ]

              const addDataDetails = await AdminFAQService.add(addArr)
              if (addDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataAdded', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataAddedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'FAQ title')
            }
          } else {
            response.msg = validate.error
          }
        } else {
          response.msg = sails.__('msgRequiredParamMissing')
        }
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return res.json(response)
    }
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch record method.
   * @date 02 Oct 2019
   */
  fetch: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.method === 'OPTIONS') {
        response.status = 'success'
        response.msg = 'Nothing to do here with options.'
      } else {
        if (req.body.faqId !== undefined && req.body.faqId) {
          const faqId = await CustomService.decrypt(req.body.faqId)
          const fetchDetails = await AdminFAQService.fetch([faqId, sails.config.custom.accountStatus.active])
          if (fetchDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = sails.__('msgRecordsFound', 'FAQ')
            response.data = fetchDetails.rows[0]
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'faq')
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
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Edit record method.
   * @date 02 Oct 2019
   */
  edit: async function (req, res) {
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
        if (req.body.faqId !== undefined && req.body.faqId) {
          const faqId = await CustomService.decrypt(req.body.faqId)
          const faqTitle = req.body.faqTitle.trim()
          const faqDescription = req.body.faqDescription.trim()

          const validationFields = [
            {
              field: faqTitle,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'FAQ'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'faq'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'faq')
              }
            },
            {
              field: faqDescription,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'FAQ description'),
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminFAQService.isExist([faqTitle, sails.config.custom.accountStatus.delete, faqId], true)
            if (dataExistCheck.rowCount === 0) {
              const editArr = [
                faqId,
                faqTitle,
                faqDescription,
                CustomService.currentDate()
              ]

              const editDataDetails = await AdminFAQService.edit(editArr)
              if (editDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataUpdated', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataUpdatedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'FAQ title')
            }
          } else {
            response.msg = validate.error
          }
        } else {
          response.msg = sails.__('msgRequiredParamMissing')
        }
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return res.json(response)
    }
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update status record method.
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
        if (req.body.faqId !== undefined && req.body.faqId && req.body.status !== undefined && req.body.status) {
          let faqId = await CustomService.decrypt(req.body.faqId)
          let status = req.body.status
          let updateStatusDetails = await AdminFAQService.updateStatus([status, CustomService.currentDate(), faqId])

          let successMsg = ''
          let errorMsg = ''
          if (status === 'active') {
            successMsg = sails.__('msgDataActivated', 'Record')
            errorMsg = sails.__('msgDataActivatedError')
          } else {
            successMsg = sails.__('msgDataInactivated', 'Record')
            errorMsg = sails.__('msgDataInactivatedError')
          }

          if (updateStatusDetails.rowCount > 0) {
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
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Delete record method.
   * @date 02 Oct 2019
   */
  delete: async function (req, res) {
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
        if (req.body.faqId !== undefined && req.body.faqId.length > 0) {
          const faqId = req.body.faqId.map((value) => CustomService.decrypt(value))
          let updateStatusDetails = await AdminFAQService.delete([sails.config.custom.accountStatus.delete, CustomService.currentDate(), faqId])

          if (updateStatusDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = sails.__('msgDataDeleted', 'Record(s)')
          } else {
            response.msg = sails.__('msgDataDeletedError')
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
