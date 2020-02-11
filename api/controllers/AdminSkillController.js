/**
 * AdminSkillController
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

        const getDetails = await AdminSkillService.list(listParam)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          response.msg = sails.__('msgRecordsFound', 'Skill')
          response.data = {
            items: getDetails.rows,
            total: getDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'skills')
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
        if (req.body.skillName !== undefined && req.body.skillDescription !== undefined && req.body.skillInfo !== undefined) {
          const skillName = req.body.skillName.trim()
          const skillDescription = req.body.skillDescription.trim()
          const skillInfo = req.body.skillInfo.trim()
          const validationFields = [
            {
              field: skillName,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Skill Name'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'skill name'),
                'maxLength:100': sails.__('msgFieldMaxLength', '100', 'skill name')
              }
            },
            {
              field: skillDescription,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Skill description'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'skill description'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'skill description')
              }
            },
            {
              field: skillInfo,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Skill information'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'skill information'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'skill information')
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminSkillService.isExist([skillName, sails.config.custom.accountStatus.delete], false)
            if (dataExistCheck.rowCount === 0) {
              const addArr = [
                skillName,
                skillDescription,
                skillInfo,
                sails.config.custom.accountStatus.active,
                CustomService.currentDate(),
                CustomService.currentDate()
              ]

              const addDataDetails = await AdminSkillService.add(addArr)
              if (addDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataAdded', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataAddedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'Skill name')
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
        if (req.body.skillId !== undefined && req.body.skillId) {
          const skillId = await CustomService.decrypt(req.body.skillId)
          const fetchDetails = await AdminSkillService.fetch([skillId, sails.config.custom.accountStatus.active])
          if (fetchDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = sails.__('msgRecordsFound', 'Skill')
            response.data = fetchDetails.rows[0]
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'skill')
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
        if (req.body.skillId !== undefined && req.body.skillId) {
          const skillId = await CustomService.decrypt(req.body.skillId)
          const skillName = req.body.skillName.trim()
          const skillDescription = req.body.skillDescription.trim()
          const skillInfo = req.body.skillInfo.trim()
          const validationFields = [
            {
              field: skillName,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Skill Name'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'skill name'),
                'maxLength:100': sails.__('msgFieldMaxLength', '100', 'skill name')
              }
            },
            {
              field: skillDescription,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Skill description'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'skill description'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'skill description')
              }
            },
            {
              field: skillInfo,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Skill information'),
                'minLength:2': sails.__('msgFieldMinLength', '2', 'skill information'),
                'maxLength:255': sails.__('msgFieldMaxLength', '255', 'skill information')
              }
            }
          ]

          // Custom validation.
          const validate = await ValidationService.validate(validationFields)
          if (validate.status) {
            const dataExistCheck = await AdminSkillService.isExist([skillName, sails.config.custom.accountStatus.delete, skillId], true)
            if (dataExistCheck.rowCount === 0) {
              const addArr = [
                skillId,
                skillName,
                skillDescription,
                skillInfo,
                CustomService.currentDate()
              ]

              const editDataDetails = await AdminSkillService.edit(addArr)
              if (editDataDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataUpdated', 'Record')
                response.data = ''
              } else {
                response.msg = sails.__('msgDataUpdatedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'Skill name')
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
        if (req.body.skillId !== undefined && req.body.skillId && req.body.status !== undefined && req.body.status) {
          let skillId = await CustomService.decrypt(req.body.skillId)
          let status = req.body.status
          let updateStatusDetails = await AdminSkillService.updateStatus([status, CustomService.currentDate(), skillId])

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
        if (req.body.skillId !== undefined && req.body.skillId.length > 0) {
          const skillId = req.body.skillId.map((value) => CustomService.decrypt(value))
          let updateStatusDetails = await AdminSkillService.delete([sails.config.custom.accountStatus.delete, CustomService.currentDate(), skillId])

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
