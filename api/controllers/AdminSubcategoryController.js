/**
 * AdminSubcategoryController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description List all records method.
   * @date 02 Oct 2019
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

        const getSubcategoryDetails = await AdminSubcategoryService.list(listParam)

        response.status = 'success'
        if (getSubcategoryDetails.rowCount > 0) {
          response.msg = sails.__('msgRecordsFound', 'Subcategory')
          response.data = {
            items: getSubcategoryDetails.rows,
            total: getSubcategoryDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'subcategories')
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
   * @description Get all active category list method.
   * @date 02 Oct 2019
   */
  getActiveCategoryList: async function (req, res) {
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
        const fetchSubcategoryDetails = await AdminSubcategoryService.getActiveCategoryList([sails.config.custom.accountStatus.active])
        if (fetchSubcategoryDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__('msgRecordsFound', 'Subcategory')
          response.data = fetchSubcategoryDetails.rows
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'subcategory')
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
   * @date 02 Oct 2019
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
        if (req.body.categoryId !== undefined && req.body.subcategoryName !== undefined && req.body.subcategoryDescription !== undefined && req.body.subcategoryInfo !== undefined) {
          const categoryId = req.body.categoryId
          const subcategoryName = req.body.subcategoryName.trim()
          const subcategoryDescription = req.body.subcategoryDescription.trim()
          const subcategoryInfo = req.body.subcategoryInfo.trim()
          const validationFields = [
            {
              field: categoryId,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Category selection')
              }
            },
            {
              field: subcategoryName,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Subcategory Name'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'subcategory name'),
                'maxLength:100': sails.__('msgFieldMaxLength', '100', 'subcategory name')
              }
            },
            {
              field: subcategoryDescription,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Subcategory description'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'subcategory description'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'subcategory description')
              }
            },
            {
              field: subcategoryInfo,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Subcategory information'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'subcategory information'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'subcategory information')
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminSubcategoryService.isExist([subcategoryName, sails.config.custom.accountStatus.delete], false)
            if (dataExistCheck.rowCount === 0) {
              const addArr = [
                categoryId,
                subcategoryName,
                subcategoryDescription,
                subcategoryInfo,
                sails.config.custom.accountStatus.active,
                CustomService.currentDate(),
                CustomService.currentDate()
              ]

              const addDataDetails = await AdminSubcategoryService.add(addArr)
              if (addDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataAdded', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataAddedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'Subcategory name')
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
        if (req.body.subcategoryId !== undefined && req.body.subcategoryId) {
          const subcategoryId = await CustomService.decrypt(req.body.subcategoryId)
          const fetchSubcategoryDetails = await AdminSubcategoryService.fetch([subcategoryId, sails.config.custom.accountStatus.active])
          if (fetchSubcategoryDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = sails.__('msgRecordsFound', 'Subcategory')
            response.data = fetchSubcategoryDetails.rows[0]
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'subcategory')
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
        if (req.body.subcategoryId !== undefined && req.body.subcategoryId) {
          const subcategoryId = await CustomService.decrypt(req.body.subcategoryId)
          const categoryId = req.body.categoryId
          const subcategoryName = req.body.subcategoryName.trim()
          const subcategoryDescription = req.body.subcategoryDescription.trim()
          const subcategoryInfo = req.body.subcategoryInfo.trim()
          const validationFields = [
            {
              field: categoryId,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Category Selection'),
              }
            },
            {
              field: subcategoryName,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Subcategory Name'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'subcategory name'),
                'maxLength:100': sails.__('msgFieldMaxLength', '100', 'subcategory name')
              }
            },
            {
              field: subcategoryDescription,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Subcategory description'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'subcategory description'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'subcategory description')
              }
            },
            {
              field: subcategoryInfo,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Subcategory information'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'subcategory information'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'subcategory information')
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminSubcategoryService.isExist([subcategoryName, sails.config.custom.accountStatus.delete, subcategoryId], true)
            if (dataExistCheck.rowCount === 0) {
              const addArr = [
                subcategoryId,
                categoryId,
                subcategoryName,
                subcategoryDescription,
                subcategoryInfo,
                CustomService.currentDate()
              ]

              const addDataDetails = await AdminSubcategoryService.edit(addArr)
              if (addDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataUpdated', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataUpdatedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'Subcategory name')
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
        if (req.body.subcategoryId !== undefined && req.body.subcategoryId && req.body.status !== undefined && req.body.status) {
          let subcategoryId = await CustomService.decrypt(req.body.subcategoryId)
          let status = req.body.status
          let updateStatusDetails = await AdminSubcategoryService.updateStatus([status, CustomService.currentDate(), subcategoryId])

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
        if (req.body.subcategoryId !== undefined && req.body.subcategoryId.length > 0) {
          const subcategoryId = req.body.subcategoryId.map((value) => CustomService.decrypt(value))
          let updateStatusDetails = await AdminSubcategoryService.delete([sails.config.custom.accountStatus.delete, CustomService.currentDate(), subcategoryId])

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
