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

        const getDetails = await AdminBlogCategoryService.list(listParam)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          response.msg = sails.__('msgRecordsFound', 'Blog Category')
          response.data = {
            items: getDetails.rows,
            total: getDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'blog categories')
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
        if (req.body.blogCategoryName !== undefined) {
          const blogCategoryName = req.body.blogCategoryName.trim()
          const validationFields = [
            {
              field: blogCategoryName,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Category Name'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'category name'),
                'maxLength:100': sails.__('msgFieldMaxLength', '100', 'category name')
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminBlogCategoryService.isExist([blogCategoryName, sails.config.custom.accountStatus.delete], false)
            if (dataExistCheck.rowCount === 0) {
              const addArr = [
                blogCategoryName,
                sails.config.custom.accountStatus.active,
                CustomService.currentDate(),
                CustomService.currentDate()
              ]

              const addDataDetails = await AdminBlogCategoryService.add(addArr)
              if (addDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataAdded', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataAddedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'Blog Category')
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
        if (req.body.blogCategoryId !== undefined && req.body.blogCategoryId) {
          const blogCategoryId = await CustomService.decrypt(req.body.blogCategoryId)
          const fetchDetails = await AdminBlogCategoryService.fetch([blogCategoryId, sails.config.custom.accountStatus.active])
          if (fetchDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = sails.__('msgRecordsFound', 'Blog Category')
            response.data = fetchDetails.rows[0]
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'blog category')
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
        if (req.body.blogCategoryId !== undefined && req.body.blogCategoryId && req.body.blogCategoryName !== undefined) {
          const blogCategoryId = await CustomService.decrypt(req.body.blogCategoryId)
          const blogCategoryName = req.body.blogCategoryName.trim()
          const validationFields = [
            {
              field: blogCategoryName,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Blog Category Name'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'blog category'),
                'maxLength:100': sails.__('msgFieldMaxLength', '100', 'blog category')
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminBlogCategoryService.isExist([blogCategoryName, sails.config.custom.accountStatus.delete, blogCategoryId], true)
            if (dataExistCheck.rowCount === 0) {
              const addArr = [
                blogCategoryId,
                blogCategoryName,
                CustomService.currentDate()
              ]

              const editDataDetails = await AdminBlogCategoryService.edit(addArr)
              if (editDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataUpdated', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataUpdatedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'Blog Category')
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
        if (req.body.blogCategoryId !== undefined && req.body.blogCategoryId && req.body.status !== undefined && req.body.status) {
          let blogCategoryId = await CustomService.decrypt(req.body.blogCategoryId)
          let status = req.body.status
          let updateStatusDetails = await AdminBlogCategoryService.updateStatus([status, CustomService.currentDate(), blogCategoryId])

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
        if (req.body.blogCategoryId !== undefined && req.body.blogCategoryId.length > 0) {
          const blogCategoryId = req.body.blogCategoryId.map((value) => CustomService.decrypt(value))

          let totalCategory = blogCategoryId.length
          let deletableFlag = false
          let newCategory = []

          for (let index = 0; index < totalCategory; index++) {
            let isCategoryDeletable = await AdminBlogCategoryService.isBlogCatgoryDeletable([blogCategoryId[index], [sails.config.custom.accountStatus.active, sails.config.custom.accountStatus.inactive]])

            if (isCategoryDeletable.rows[0].count > 0) {
              deletableFlag = true
            } else {
              newCategory.push(blogCategoryId[index])
            }
          }

          if (newCategory.length > 0) {
            let updateStatusDetails = await AdminBlogCategoryService.delete([sails.config.custom.accountStatus.delete, CustomService.currentDate(), newCategory])

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
