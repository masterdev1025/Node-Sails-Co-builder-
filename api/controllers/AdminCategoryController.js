/**
 * UserController
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

        const getDetails = await AdminCategoryService.list(listParam)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          response.msg = sails.__('msgRecordsFound', 'Category')
          response.data = {
            items: getDetails.rows,
            total: getDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'categories')
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
        if (req.body.categoryName !== undefined && req.body.categoryDescription !== undefined && req.body.categoryInfo !== undefined) {
          const categoryName = req.body.categoryName.trim()
          const categoryDescription = req.body.categoryDescription.trim()
          const categoryInfo = req.body.categoryInfo.trim()
          const validationFields = [
            {
              field: categoryName,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Category Name'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'category name'),
                'maxLength:100': sails.__('msgFieldMaxLength', '100', 'category name')
              }
            },
            {
              field: categoryDescription,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Category description'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'category description'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'category description')
              }
            },
            {
              field: categoryInfo,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Category information'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'category information'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'category information')
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminCategoryService.isExist([categoryName, sails.config.custom.accountStatus.delete], false)
            if (dataExistCheck.rowCount === 0) {
              const addArr = [
                categoryName,
                categoryDescription,
                categoryInfo,
                sails.config.custom.accountStatus.active,
                CustomService.currentDate(),
                CustomService.currentDate()
              ]

              const addDataDetails = await AdminCategoryService.add(addArr)
              if (addDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataAdded', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataAddedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'Category name')
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
        if (req.body.categoryId !== undefined && req.body.categoryId) {
          const categoryId = await CustomService.decrypt(req.body.categoryId)
          const fetchDetails = await AdminCategoryService.fetch([categoryId, sails.config.custom.accountStatus.active])
          if (fetchDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = sails.__('msgRecordsFound', 'Category')
            response.data = fetchDetails.rows[0]
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'category')
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
        if (req.body.categoryId !== undefined && req.body.categoryId) {
          const categoryId = await CustomService.decrypt(req.body.categoryId)
          const categoryName = req.body.categoryName.trim()
          const categoryDescription = req.body.categoryDescription.trim()
          const categoryInfo = req.body.categoryInfo.trim()
          const validationFields = [
            {
              field: categoryName,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Category Name'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'category name'),
                'maxLength:100': sails.__('msgFieldMaxLength', '100', 'category name')
              }
            },
            {
              field: categoryDescription,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Category description'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'category description'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'category description')
              }
            },
            {
              field: categoryInfo,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Category information'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'category information'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'category information')
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminCategoryService.isExist([categoryName, sails.config.custom.accountStatus.delete, categoryId], true)
            if (dataExistCheck.rowCount === 0) {
              const addArr = [
                categoryId,
                categoryName,
                categoryDescription,
                categoryInfo,
                CustomService.currentDate()
              ]

              const editDataDetails = await AdminCategoryService.edit(addArr)
              if (editDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataUpdated', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataUpdatedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'Category name')
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
        if (req.body.categoryId !== undefined && req.body.categoryId && req.body.status !== undefined && req.body.status) {
          let categoryId = await CustomService.decrypt(req.body.categoryId)
          let status = req.body.status
          let updateStatusDetails = await AdminCategoryService.updateStatus([status, CustomService.currentDate(), categoryId])

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
        if (req.body.categoryId !== undefined && req.body.categoryId.length > 0) {
          const categoryId = req.body.categoryId.map((value) => CustomService.decrypt(value))

          let totalCategory = categoryId.length
          let deletableFlag = false
          let newCategory = []

          for (let index = 0; index < totalCategory; index++) {
            let isCategoryDeletable = await AdminCategoryService.isCategoryDeletable([categoryId[index], [sails.config.custom.accountStatus.active, sails.config.custom.accountStatus.inactive]])

            if (isCategoryDeletable.rows[0].count > 0) {
              deletableFlag = true

            } else {
              newCategory.push(categoryId[index])
            }
          }

          if (newCategory.length > 0) {
            let updateStatusDetails = await AdminCategoryService.delete([sails.config.custom.accountStatus.delete, CustomService.currentDate(), newCategory])

            if (updateStatusDetails.rowCount > 0) {
              response.status = 'success'
              response.msg = (deletableFlag) ? sails.__('msgDataDeletedMultiError', 'Record(s)') : sails.__('msgDataDeleted', 'Record(s)')
            } else {
              response.msg = sails.__('msgDataDeletedError')
            }
          } else {
            response.msg = sails.__('msgDataDeletedableFalse', 'Record(s)')
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
