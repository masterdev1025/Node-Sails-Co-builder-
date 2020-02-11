/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const crypto = require('crypto')

module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Sign In method.
   * @date 11 July 2019
   */
  signIn: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.username !== undefined && req.body.password !== undefined) {
        let email = req.body.username.toLocaleLowerCase()
        let password = req.body.password.trim()

        let validationFields = [
          {
            field: email,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Email address')
            }
          },
          {
            field: password,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Password')
            }
          }
        ]

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)

        if (validate.status) {
          // Check captcha.
          let captchaFlag = await CustomService.checkReCaptcha(req.body.requestFrom, req.body.response)
          if (captchaFlag === 1) {
            let passwordVal = crypto
              .createHash('md5')
              .update(password)
              .digest('hex')

            // Check user is authenticated or not.
            let userDetails = await AdminUserService.authenticateUser([
              email,
              passwordVal
            ])

            // User is authenticated then it will proceed.
            if (userDetails.rowCount > 0) {
              let userId = userDetails.rows[0].in_admin_user_id
              let firstName = userDetails.rows[0].st_first_name
              let lastName = userDetails.rows[0].st_last_name
              let email = userDetails.rows[0].st_email_address
              let status = userDetails.rows[0].st_status

              if (status === sails.config.custom.accountStatus.pending) {
                response.msg = sails.__('msgUserStatusPending')
              } else if (status === sails.config.custom.accountStatus.inactive) {
                response.msg = sails.__('msgUserStatusInactive')
              } else if (status === sails.config.custom.accountStatus.delete) {
                response.msg = sails.__('msgUserStatusDelete')
              } else {
                var bearer = await JwtService.generateBearer(userId, firstName, lastName, email)

                // Client details.
                let clientDetails = CustomService.clientDetails(req.body.clientDetails)

                let dataInsertArr = [
                  userId,
                  bearer,
                  clientDetails.clientDetails,
                  clientDetails.browserName,
                  clientDetails.browserVersion,
                  clientDetails.clientOs,
                  CustomService.userLogger(req),
                  'active',
                  CustomService.currentDate(),
                  CustomService.currentDate()
                ]

                // Insert user session history.
                AdminUserSessionService.insertUserSession(dataInsertArr)

                let resData = {
                  bearer: bearer,
                  firstName: firstName,
                  lastName: lastName
                }

                response.status = 'success'
                response.msg = sails.__('msgAuthenticationSuccess')
                response.data = resData
              }
            } else {
              response.msg = sails.__('msgFieldInvalidCredentials')
            }
          } else {
            response.msg = sails.__('msgFieldVerifyRecaptcha')
          }
        } else {
          response.msg = validate.error
        }
      } else {
        response.msg = sails.__('msgRequiredParamMissing')
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
   * @description Sign Out method.
   * @date 15 July 2019
   */
  signOut: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.headers.authorization !== undefined) {
        let reqHeader = req.headers.authorization.split(' ')
        let bearer =
          reqHeader.length > 0 &&
            reqHeader[1] !== undefined &&
            reqHeader[1] !== ''
            ? reqHeader[1]
            : ''

        // Check user is authenticated or not.
        let userSessionDetails = await AdminUserSessionService.authenticateUserSession([bearer])

        // User is authenticated then it will proceed.
        if (userSessionDetails.rowCount > 0) {
          let status = userSessionDetails.rows[0].st_status

          if (status === sails.config.custom.accountStatus.active) {
            let signOutDetails = await AdminUserSessionService.signOutUserSession([CustomService.currentDate(), bearer])

            if (signOutDetails.rowCount > 0) {
              response.status = 'success'
              response.msg = sails.__('msgSessionExpired')
            } else {
              response.msg = sails.__('msgSessionExpiredError')
            }
          } else {
            response.msg = sails.__('msgAlredySessionExpired')
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'session')
        }
      } else {
        response.code = 'SSN1'
        response.msg = sails.__('msgSessionExpired')
      }
    } catch (error) {
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
   * @description Check whether email id exists or not.
   * @date 11 July 2019
   */
  emailExist: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // var temp = await UserService.getUser();
      let email = req.body.email.toLocaleLowerCase()

      let validationFields = [
        {
          field: email,
          rules: {
            isInputRequired: sails.__('msgFieldIsRequired', 'Email address')
          }
        }
      ]

      var validate = await ValidationService.validate(validationFields)
      if (validate.status) {
        let emailExistCheck = await UserService.emailExist([email, 'delete'])

        // Email address is exist or not.
        if (emailExistCheck.rowCount > 0) {
          response.status = 'success'
          response.msg = ''
        } else {
          response.msg = sails.__('msgFieldNotAlreadyExist', 'Email address')
        }
      } else {
        response.msg = validate.error
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
   * @description Check whether email id exists or not.
   * @date 11 July 2019
   */
  emailNotExist: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      let email = req.body.email.toLocaleLowerCase()
      let validationFields = [
        {
          field: email,
          rules: {
            isInputRequired: sails.__('msgFieldIsRequired', 'Email address')
          }
        }
      ]

      var validate = await ValidationService.validate(validationFields)
      if (validate.status) {
        let emailExistCheck = await UserService.emailExist([email, 'delete'])

        // Email address is exist or not.
        if (emailExistCheck.rowCount > 0) {
          response.msg = sails.__('msgFieldAlreadyExist', 'Email address')
        } else {
          response.status = 'success'
          response.msg = ''
        }
      } else {
        response.msg = validate.error
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

        let getUserDetails = await AdminUserService.list(listParam)

        response.status = 'success'
        if (getUserDetails.rowCount > 0) {
          response.msg = sails.__('msgRecordsFound', 'Users')
          response.data = {
            items: getUserDetails.rows,
            total: getUserDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'users')
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
        if (req.body.userId !== undefined && req.body.userId && req.body.status !== undefined && req.body.status) {

          let userId = req.body.userId
          let status = req.body.status
          let updateUserDetails = await AdminUserService.updateStatus([status, CustomService.currentDate(), userId])

          let successMsg = ''
          let errorMsg = ''
          if (status === 'active') {
            successMsg = sails.__('msgDataActivated', 'Record')
            errorMsg = sails.__('msgDataActivatedError')
          } else {
            successMsg = sails.__('msgDataInactivated', 'Record')
            errorMsg = sails.__('msgDataInactivatedError')
          }

          if (updateUserDetails.rowCount > 0) {
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
        if (req.body.userIds !== undefined && req.body.userIds.length > 0) {
          const userIds = req.body.userIds.map((value) => CustomService.decrypt(value))
          let deleteUserDetails = await AdminUserService.delete([sails.config.custom.accountStatus.delete, CustomService.currentDate(), userIds])

          if (deleteUserDetails.rowCount > 0) {
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
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return res.json(response)
    }
  }
}
