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

        const getDetails = await AdminCMSService.list(listParam)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          response.msg = sails.__('msgRecordsFound', 'CMS Page')
          response.data = {
            items: getDetails.rows,
            total: getDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'CMS Pages')
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
        if (req.body.cmsPageName !== undefined && req.body.cmsPageSlug !== undefined && req.body.cmsPageDescription !== undefined) {
          const cmsPageName = req.body.cmsPageName.trim()
          const cmsPageSlug = req.body.cmsPageSlug.trim()
          const cmsPageDescription = req.body.cmsPageDescription.trim()
          const validationFields = [
            {
              field: cmsPageName,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'CMS Page Name'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'cms page name'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'cms page name')
              }
            },
            {
              field: cmsPageSlug,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'CMS Page Description'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'cms page description'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'cms page description')
              }
            },
            {
              field: cmsPageDescription,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'CMS Page Information'),
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminCMSService.isExist([cmsPageName, sails.config.custom.accountStatus.delete], false)
            if (dataExistCheck.rowCount === 0) {
              const addArr = [
                cmsPageName,
                cmsPageSlug,
                cmsPageDescription,
                sails.config.custom.cmsPageStatus.uneditable,
                sails.config.custom.accountStatus.active,
                CustomService.currentDate(),
                CustomService.currentDate()
              ]

              const addDataDetails = await AdminCMSService.add(addArr)
              if (addDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataAdded', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataAddedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'CMS Page name')
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
        if (req.body.cmsId !== undefined && req.body.cmsId) {
          const cmsId = await CustomService.decrypt(req.body.cmsId)
          const fetchDetails = await AdminCMSService.fetch([cmsId, sails.config.custom.accountStatus.active])
          if (fetchDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = sails.__('msgRecordsFound', 'CMS page')
            response.data = fetchDetails.rows[0]
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'cms page')
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
        if (req.body.cmsId !== undefined && req.body.cmsId) {
          const cmsId = await CustomService.decrypt(req.body.cmsId)
          const cmsPageName = req.body.cmsPageName.trim()
          const cmsPageDescription = req.body.cmsPageDescription.trim()

          const validationFields = [
            {
              field: cmsPageName,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'CMS Page Name'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'cms page name'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'cms page name')
              }
            },
            {
              field: cmsPageDescription,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'CMS Page Information'),
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminCMSService.isExist([cmsPageName, sails.config.custom.accountStatus.delete, cmsId], true)
            if (dataExistCheck.rowCount === 0) {
              const editArr = [
                cmsId,
                cmsPageName,
                cmsPageDescription,
                CustomService.currentDate()
              ]

              const editDataDetails = await AdminCMSService.edit(editArr)
              if (editDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataUpdated', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataUpdatedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'CMS page name')
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
        if (req.body.cmsId !== undefined && req.body.cmsId && req.body.status !== undefined && req.body.status) {
          let cmsId = await CustomService.decrypt(req.body.cmsId)
          let status = req.body.status
          let updateStatusDetails = await AdminCMSService.updateStatus([status, CustomService.currentDate(), cmsId])

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
        if (req.body.cmsId !== undefined && req.body.cmsId.length > 0) {
          const cmsId = req.body.cmsId.map((value) => CustomService.decrypt(value))
          let updateStatusDetails = await AdminCMSService.delete([sails.config.custom.accountStatus.delete, CustomService.currentDate(), cmsId])

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
