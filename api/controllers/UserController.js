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
      if (req.body.email !== undefined && req.body.password !== undefined) {
        let email = req.body.email.toLocaleLowerCase()
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
        //console.log(validate);

        if (validate.status) {
          // Check captcha.

          // var start = new Date()

          let captchaFlag = await CustomService.checkReCaptcha(
            req.body.requestFrom,
            req.body.response
          )

          // var end = new Date() - start
          // console.info('Execution time: %dms', end)

          if (captchaFlag === 1) {
            let passwordVal = crypto
              .createHash('md5')
              .update(password)
              .digest('hex')

            // Check user is authenticated or not.
            let userDetails = await UserService.authenticateUser([
              email,
              passwordVal,
              sails.config.custom.accountStatus.delete
            ])

            // User is authenticated then it will proceed.
            if (userDetails.rowCount > 0) {
              let status = userDetails.rows[0].st_status

              if (status === sails.config.custom.accountStatus.pending) {
                response.msg = sails.__('msgUserStatusPending')
              } else if (
                status === sails.config.custom.accountStatus.inactive
              ) {
                response.msg = sails.__('msgUserStatusInactive')
              } else if (status === sails.config.custom.accountStatus.delete) {
                response.msg = sails.__('msgUserStatusDelete')
              } else {
                let userId = userDetails.rows[0].in_user_id
                let cobuilderId = userDetails.rows[0].st_cobuilders_id
                let firstName = userDetails.rows[0].st_first_name
                let lastName = userDetails.rows[0].st_last_name
                let email = userDetails.rows[0].st_email_address
                let profileImage = userDetails.rows[0].st_profile_picture
                let profilePicture = userDetails.rows[0].st_profile_picture

                // If two-step verificaiton is enabled.
                let twoStepVerificationEnable = await UserProfileDetailsService.twoStepVerificationEnable(
                  [userId, sails.config.custom.commonStatus.active]
                )
                let bearer = await JwtService.generateBearer(
                  userId,
                  firstName,
                  lastName,
                  email
                )

                // If two-factor authentication is enabled.
                if (twoStepVerificationEnable.rowCount > 0) {
                  let verificationCode = CustomService.randomNumber(6)

                  // Check whether verification code is exists or not.
                  let checkData = await UserVerificationService.checkUserVerificationCode(
                    [userId]
                  )
                  let resData = ''

                  // If exists then update the record.
                  if (checkData.rowCount > 0) {
                    let dataUpdateArr = [
                      userId,
                      email,
                      bearer,
                      verificationCode,
                      CustomService.currentDate()
                    ]
                    resData = await UserVerificationService.updateUserVerficationCode(
                      dataUpdateArr
                    )
                  } else {
                    // If not exists then insert the record.
                    let dataInsertArr = [
                      userId,
                      email,
                      bearer,
                      verificationCode,
                      CustomService.currentDate(),
                      CustomService.currentDate()
                    ]
                    resData = await UserVerificationService.insertUserVerficationCode(
                      dataInsertArr
                    )
                  }

                  let base64ProfilePicture = ''
                  if (profilePicture) {
                    base64ProfilePicture = await CustomService.base64Encode(
                      require('path').resolve(
                        sails.config.appPath,
                        'assets/uploads/images/profile'
                      ) +
                      '/' +
                      profilePicture
                    )
                  }

                  if (resData.rowCount > 0) {
                    // #TODO: send verification code to phone by message code goes here.
                    // NOTE SET REDIS USER STATUS TO ONLINE FOR NOTIFICATION
                    response.status = 'success'
                    response.msg = sails.__('msgAuthenticationSuccess')
                    response.data = {
                      is_two_factor_enable: true,
                      cobuilderId: cobuilderId,
                      email: email,
                      firstName: firstName,
                      lastName: lastName,
                      profileImage: profileImage,
                      profilePicture: base64ProfilePicture
                    }
                  } else {
                    response.msg = sails.__(
                      'msgSomethingWentWrongField',
                      'in signing in'
                    )
                  }
                } else {
                  // If two-factor authentication is not enabled.
                  // Client details.
                  let clientDetails = CustomService.clientDetails(
                    req.body.clientDetails
                  )
                  let userIP = CustomService.userLogger(req)
                  let locationDetails = await CustomService.getLocationByIP(
                    userIP
                  )

                  let resData = await UserService.insertLoggedInUser(
                    userId,
                    bearer,
                    clientDetails,
                    locationDetails,
                    userIP
                  )

                  let base64ProfilePicture = ''
                  if (profilePicture) {
                    base64ProfilePicture = await CustomService.base64Encode(
                      require('path').resolve(
                        sails.config.appPath,
                        'assets/uploads/images/profile'
                      ) +
                      '/' +
                      profilePicture
                    )
                  }

                  if (resData.rowCount > 0) {
                    // NOTE SET REDIS USER STATUS TO ONLINE FOR NOTIFICATION
                    // let redisClient = sails.config.getRedisClient()
                    // redisClient.set('user:' + cobuilderId, 'SOCKETID', 'EX', 30)

                    response.status = 'success'
                    response.msg = sails.__('msgAuthenticationSuccess')
                    response.data = {
                      bearer: bearer,
                      cobuilderId: cobuilderId,
                      email: email,
                      firstName: firstName,
                      lastName: lastName,
                      profileImage: profileImage,
                      profilePicture: base64ProfilePicture
                    }
                  } else {
                    response.msg = sails.__('msgDataAddedError')
                  }
                }
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
   * @description Resend OTP method.
   * @date 1st Oct 2019
   */
  resendOTP: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.email !== undefined) {
        let email = req.body.email

        // Check whether verification code is exists or not.
        let fetchData = await UserVerificationService.fetchUserVerificationCodeByEmail(
          [email]
        )

        // #TODO: send verification code to phone by message code goes here.

        if (fetchData.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__('msgDataSend', 'OTP')
          response.data = ''
        } else {
          response.msg = sails.__(
            'msgSomethingWentWrongField',
            'in resending OTP'
          )
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
   * @description Verify verification code.
   * @date 15 Sept 2019
   */
  verifyVerificationCode: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (
        req.body.email !== undefined &&
        req.body.verificationCode !== undefined
      ) {
        let email = req.body.email.trim()
        let verificationCode = req.body.verificationCode

        let validationFields = [
          {
            field: email,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Email address')
            }
          },
          {
            field: verificationCode,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Verification Code'),
              isNumber: sails.__('msgFieldIsRequired', 'Verification Code'),
              'minLength:6': sails.__('msgFieldMinLength', '6', 'Verification Code'),
              'maxLength:6': sails.__('msgFieldMaxLength', '6', 'Verification Code')
            }
          }
        ]

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)

        if (validate.status) {
          // Check verifiation code is valid or not.
          let userVerificationDetails = await UserVerificationService.verifyVerificationCode(
            [verificationCode, email]
          )

          // User is authenticated then it will proceed.
          if (userVerificationDetails.rowCount > 0) {
            let userId = userVerificationDetails.rows[0].in_user_id
            let bearer = userVerificationDetails.rows[0].st_bearer

            // Client details.
            let clientDetails = CustomService.clientDetails(
              req.body.clientDetails
            )
            let userIP = CustomService.userLogger(req)
            let locationDetails = await CustomService.getLocationByIP(userIP)

            let resData = await UserService.insertLoggedInUser(
              userId,
              bearer,
              clientDetails,
              locationDetails,
              userIP
            )

            if (resData.rowCount > 0) {
              response.status = 'success'
              response.msg = sails.__('msgAuthenticationSuccess')
              response.data = {
                bearer: bearer
              }
            } else {
              response.msg = sails.__('msgDataAddedError')
            }
          } else {
            response.msg = sails.__(
              'msgFieldInvalidField',
              'verification code.'
            )
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
        let userSessionDetails = await UserSessionService.authenticateUserSession(
          [bearer]
        )

        // User is authenticated then it will proceed.
        if (userSessionDetails.rowCount > 0) {
          // let userId = userSessionDetails.rows[0].in_user_id;
          let status = userSessionDetails.rows[0].st_status

          if (status === sails.config.custom.accountStatus.active) {
            let signOutDetails = await UserSessionService.signOutUserSession([
              CustomService.currentDate(),
              bearer
            ])

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
        response.msg = sails.__('msgFieldHeaderRequired')
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
   * @description Sign Up method.
   * @date 11 July 2019
   */
  signUp: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (
        req.body.firstName !== undefined &&
        req.body.lastName !== undefined &&
        req.body.email !== undefined &&
        req.body.password !== undefined &&
        req.body.confirmPassword !== undefined &&
        req.body.termsAndConditions !== ''
      ) {
        let firstName = req.body.firstName.trim()
        let lastName = req.body.lastName.trim()
        let email = req.body.email.toLocaleLowerCase()
        let password = req.body.password.trim()
        let confirmPassword = req.body.confirmPassword.trim()
        let termsAndConditions = req.body.termsAndConditions
        // let subscribeNewsletter = req.body.subscribeNewsletter ? 1 : 0;

        let validationFields = [
          {
            field: firstName,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'First Name'),
              isString: sails.__('msgFieldString', 'first name'),
              'minLength:2': sails.__('msgFieldMinLength', '2', 'first name'),
              'maxLength:100': sails.__(
                'msgFieldMaxLength',
                '100',
                'first name'
              )
            }
          },
          {
            field: lastName,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Last Name'),
              isString: sails.__('msgFieldString', 'last name'),
              'minLength:2': sails.__('msgFieldMinLength', '2', 'last name'),
              'maxLength:100': sails.__('msgFieldMaxLength', '100', 'last name')
            }
          },
          {
            field: email,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Email address'),
              isEmail: sails.__('msgFieldValid', 'email address')
            }
          },
          {
            field: password,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Password'),
              isPassword: sails.__('msgFieldValidPassword')
            }
          },
          {
            field: confirmPassword,
            comparePassword: password,
            rules: {
              isInputRequired: sails.__(
                'msgFieldIsRequired',
                'Confirm password'
              ),
              isComparePassword: sails.__('msgFieldConfirmPasswordMatch')
            }
          },
          {
            field: termsAndConditions,
            rules: {
              isInputRequired: sails.__('msgIsAcceptTerms')
            }
          }
        ]

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)
        termsAndConditions = req.body.termsAndConditions ? 1 : 0
        // console.log(validate);

        if (validate.status) {
          // Check captcha.
          let captchaFlag = await CustomService.checkReCaptcha(
            req.body.requestFrom,
            req.body.response
          )

          if (captchaFlag === 1) {
            // Check email is exists or not.
            let emailExistCheck = await UserService.emailExist([
              email,
              'delete'
            ])

            // User is authenticated then it will proceed.
            if (emailExistCheck.rowCount === 0) {
              let passwordVal = crypto
                .createHash('md5')
                .update(password)
                .digest('hex')
              let randomVerificationCode = CustomService.randomString(20)

              let dataInsertArr = [
                firstName,
                lastName,
                email,
                passwordVal,
                '',
                0,
                0,
                0,
                randomVerificationCode,
                'pending',
                'pending',
                termsAndConditions,
                // subscribeNewsletter,
                CustomService.currentDate(),
                CustomService.currentDate(),
                CustomService.currentDate()
              ]

              // Insert user session history.
              let insertUser = await UserService.insertUser(dataInsertArr)

              if (insertUser.rowCount > 0) {
                let emailConfirmationLink =
                  sails.config.custom.appUrl +
                  '/emailconfirm/' +
                  randomVerificationCode

                // Send mail configurations.
                let mailName = 'signUpEmail' // Update mail and update email template according.

                // Update params only.
                let mailParams = {
                  appName: sails.config.custom.appName,
                  appUrl: sails.config.custom.appUrl,
                  supportEmail: sails.config.custom.noreplyEmail,
                  name: firstName + ' ' + lastName,
                  emailConfirmationLink: emailConfirmationLink
                }

                // No need to update mail options.
                let mailOptions = {
                  to: email,
                  subject:
                    sails.config.custom.appName + ' - Email Confirmation',
                  from:
                    sails.config.custom.appName +
                    ' <' +
                    sails.config.custom.noreplyEmail +
                    '>',
                  sender: sails.config.custom.noreplyEmail
                }

                // Send email confirmation mail.
                let sentMail = await MailerService.sendEmail(
                  mailName,
                  mailParams,
                  mailOptions
                ) // <= Here we using
                //console.log(sentMail);

                response.status = 'success'
                response.msg = sails.__('msgAccountCreated')
                response.data = {
                  firstName: firstName,
                  lastName: lastName,
                  email: email
                }
              } else {
                response.msg = sails.__('msgAccountCreatedError')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'Email address')
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
   * @description Email Confirmation method.
   * @date 24 July 2019
   */
  emailConfirm: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.code !== undefined) {
        let code = req.body.code.trim()

        // Check email confirmation code.
        let emailConfirmationCheck = await UserService.emailConfirmCheck([code])

        // Email code is exist in the database.
        if (emailConfirmationCheck.rowCount > 0) {
          // Email code is used.
          // Email code is valid.
          if (
            emailConfirmationCheck.rows[0].st_status ===
            sails.config.custom.accountStatus.pending
          ) {
            let updateStatusArr = [
              sails.config.custom.accountStatus.active,
              CustomService.currentDate(),
              code
            ]

            // Check email confirmation code.
            let changeEmailConfirmationStatus = await UserService.changeEmailConfirmationStatus(
              updateStatusArr
            )

            if (changeEmailConfirmationStatus.rowCount > 0) {
              let firstName = emailConfirmationCheck.rows[0].st_first_name
              let lastName = emailConfirmationCheck.rows[0].st_last_name
              let email = emailConfirmationCheck.rows[0].st_email_address

              // Send mail configurations.
              let mailName = 'welcomeEmail' // Update mail and update email template according.

              // Update params only.
              let mailParams = {
                appName: sails.config.custom.appName,
                appUrl: sails.config.custom.appUrl,
                supportEmail: sails.config.custom.supportEmail,
                name: firstName + ' ' + lastName,
                coBuilderName: sails.config.custom.coBuilderName
              }

              // No need to update mail options.
              let mailOptions = {
                to: email,
                subject:
                  sails.config.custom.appName + ' - Welcome to The CoBuilders',
                from:
                  sails.config.custom.appName +
                  ' <' +
                  sails.config.custom.noreplyEmail +
                  '>',
                sender: sails.config.custom.noreplyEmail
              }

              // Send email confirmation mail.
              let sentMail = await MailerService.sendEmail(
                mailName,
                mailParams,
                mailOptions
              ) // <= Here we using
              //console.log(sentMail);

              response.status = 'success'
              response.msg = sails.__('msgEmailConfirmed')
            } else {
              response.msg = sails.__('msgEmailConfirmedError')
            }
          } else {
            response.msg = sails.__('msgEmailAlreadyConfirmed')
          }
        } else {
          response.msg = sails.__('msgEmailConfirmSomethingWrong')
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
   * @description Forgot password method.
   * @date 11 July 2019
   */
  forgotPassword: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.email !== undefined) {
        let email = req.body.email.toLocaleLowerCase()

        let validationFields = [
          {
            field: email,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Email address'),
              isEmail: sails.__('msgFieldValid', 'email address')
            }
          }
        ]

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)
        // console.log(validate);

        if (validate.status) {
          // Check captcha.
          let captchaFlag = await CustomService.checkReCaptcha(
            req.body.requestFrom,
            req.body.response
          )

          if (captchaFlag === 1) {
            // Check email is exists or not.
            let emailExistCheck = await UserService.emailExist([
              email,
              'delete'
            ])

            // User is exist then it will proceed.
            if (emailExistCheck.rowCount > 0) {
              let randomString = CustomService.randomString(20)
              let dataInsertArr = [
                emailExistCheck.rows[0].in_user_id,
                email,
                randomString,
                CustomService.currentDate()
              ]

              // Insert user session history.
              let insertForgotPasswordArr = await ForgotPasswordService.insertForgotPasswordRequest(
                dataInsertArr
              )

              if (insertForgotPasswordArr.rowCount > 0) {
                let firstName = emailExistCheck.rows[0].st_first_name
                let lastName = emailExistCheck.rows[0].st_last_name
                let resetPasswordLink =
                  sails.config.custom.appUrl + '/resetpassword/' + randomString

                // Send mail configurations.
                let mailName = 'resetPasswordEmail' // Update mail and update email template according.

                // Update params only.
                let mailParams = {
                  appName: sails.config.custom.appName,
                  appUrl: sails.config.custom.appUrl,
                  supportEmail: sails.config.custom.noreplyEmail,
                  name: firstName + ' ' + lastName,
                  resetPasswordLink: resetPasswordLink
                }

                // No need to update mail options.
                let mailOptions = {
                  to: email,
                  subject: sails.config.custom.appName + ' - Reset Password',
                  from:
                    sails.config.custom.appName +
                    ' <' +
                    sails.config.custom.noreplyEmail +
                    '>',
                  sender: sails.config.custom.noreplyEmail
                }

                // Send reset password mail.
                await MailerService.sendEmail(mailName, mailParams, mailOptions) // <= Here we using
                //console.log(sentMail);

                response.status = 'success'
                response.msg = sails.__('msgPasswordResetLink')
              } else {
                response.msg = sails.__('msgPasswordResetLinkError')
              }
            } else {
              response.msg = sails.__(
                'msgFieldNotAlreadyExist',
                'Email address'
              )
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
   * @description Forgot password link is valid or not.
   * @date 12 July 2019
   */
  checkForgotPasswordLink: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.authCode !== undefined) {
        let authenticationCode = req.body.authCode.trim()

        let validationFields = [
          {
            field: authenticationCode,
            rules: {
              isInputRequired: sails.__('msgRequiredParamMissing')
            }
          }
        ]

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)
        // console.log(validate);

        if (validate.status) {
          // Check email is exists or not.
          let passwordResetLinkCheck = await ForgotPasswordService.validPasswordResetLink(
            [authenticationCode]
          )

          // Forgot password link is not expired.
          if (passwordResetLinkCheck.rowCount > 0) {
            response.status = 'success'
            response.msg = ''
          } else {
            response.msg = sails.__('msgForgotPasswordLinkExpired')
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
   * @description Reset password method.
   * @date 11 July 2019
   */
  resetPassword: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (
        req.body.authCode !== undefined &&
        req.body.password !== undefined &&
        req.body.confirmPassword !== undefined
      ) {
        let authenticationCode = req.body.authCode.trim()
        let password = req.body.password.trim()
        let confirmPassword = req.body.confirmPassword.trim()

        let validationFields = [
          {
            field: authenticationCode,
            rules: {
              isInputRequired: sails.__('msgRequiredParamMissing')
            }
          },
          {
            field: password,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Password'),
              isPassword: sails.__('msgFieldValidPassword')
            }
          },
          {
            field: confirmPassword,
            comparePassword: password,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Confirm password'),
              isComparePassword: sails.__('msgFieldConfirmPasswordMatch')
            }
          }
        ]

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)
        // console.log(validate);

        if (validate.status) {
          // Check email is exists or not.
          let passwordResetLinkCheck = await ForgotPasswordService.validPasswordResetLink(
            [authenticationCode]
          )

          // Forgot password link is not expired.
          if (passwordResetLinkCheck.rowCount > 0) {
            let userId = passwordResetLinkCheck.rows[0].in_user_id
            let passwordVal = crypto
              .createHash('md5')
              .update(password)
              .digest('hex')

            // Update user password in user master table.
            let updateUserPasswordArr = await UserService.updateUserPassword([
              passwordVal,
              CustomService.currentDate(),
              userId,
              sails.config.custom.accountStatus.active
            ])

            if (updateUserPasswordArr.rowCount > 0) {
              let forgotPasswordId =
                passwordResetLinkCheck.rows[0].in_forgot_password_id

              // Remove forgot password link.
              ForgotPasswordService.removeForgotPasswordLink([forgotPasswordId])

              // Get user details
              let userDetails = await UserService.getUserDetailById([userId])
              let firstName = userDetails.rows[0].st_first_name
              let lastName = userDetails.rows[0].st_last_name
              let email = userDetails.rows[0].st_email_address

              // Send mail configurations.
              let mailName = 'passwordChangedEmail' // Update mail and update email template according.

              // Update params only.
              let mailParams = {
                appName: sails.config.custom.appName,
                appUrl: sails.config.custom.appUrl,
                supportEmail: sails.config.custom.supportEmail,
                name: firstName + ' ' + lastName
              }

              // No need to update mail options.
              let mailOptions = {
                to: email,
                subject: sails.config.custom.appName + ' - Password Changed.',
                from:
                  sails.config.custom.appName +
                  ' <' +
                  sails.config.custom.noreplyEmail +
                  '>',
                sender: sails.config.custom.noreplyEmail
              }

              // Send email confirmation mail.
              let sentMail = await MailerService.sendEmail(
                mailName,
                mailParams,
                mailOptions
              ) // <= Here we using
              //console.log(sentMail);

              response.status = 'success'
              response.msg = sails.__('msgPasswordReset', 'Password')
            } else {
              response.msg = sails.__('msgPasswordResetError')
            }
          } else {
            response.msg = sails.__('msgForgotPasswordLinkExpired')
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
      if (req.body.email !== undefined) {
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
      if (req.body.email !== undefined) {
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
  updateSession: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }

    try {
      if (req.method === 'OPTIONS') {
        response.status = 'success'
        response.msg = 'Nothing to do here with options.'
      } else {
        if (req.headers.authorization !== undefined && req.headers.authorization !== '') {
          let reqHeader = req.headers.authorization.split(' ')
          let bearer = reqHeader.length > 0 && reqHeader[1] !== undefined && reqHeader[1] !== '' ? reqHeader[1] : ''

          if (req.body.requestFrom === 'client' || req.body.requestFrom === 'app') {
            let userSessionDetails = await sails.sendNativeQuery(`select in_user_session_id, in_user_id, st_bearer, st_status, dt_created_at, dt_updated_at from tbl_user_session where st_bearer = $1 and st_status = $2`, [bearer, sails.config.custom.accountStatus.active])

            // Update the time if session exists.
            if (userSessionDetails.rowCount > 0) {
              let currentDate = new Date(CustomService.currentDate())
              let lastDate = new Date(userSessionDetails.rows[0].dt_updated_at)

              let timeDiff = Math.abs(
                currentDate.getTime() - lastDate.getTime()
              )
              let diffSeconds = Math.ceil(timeDiff / 1000)

              // Update the time if session seconds not exists.
              if (diffSeconds <= sails.config.custom.sessionSeconds) {
                let updateSessionArr = [currentDate, bearer]
                let updateUserSession = await sails.sendNativeQuery(
                  `UPDATE tbl_user_session SET dt_updated_at= $1 WHERE st_bearer = $2`,
                  updateSessionArr
                )

                if (updateUserSession.rowCount > 0) {

                  let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

                  let userId = ''
                  if (fetchUserDetails.userId !== undefined) {
                    userId = fetchUserDetails.userId
                  }

                  let updateData = {
                    bearer: bearer,
                    data: CustomService.encrypt(userId)
                  }
                  response.status = 'success'
                  response.msg = sails.__('msgSessionUpdated')
                  response.data = updateData
                } else {
                  response.code = 'SSN1'
                }
              } else {
                // Logged out if session seconds exists.
                let updateSessionArr = [
                  currentDate,
                  sails.config.custom.accountStatus.inactive,
                  bearer
                ]
                let updateUserSession = await sails.sendNativeQuery(
                  `UPDATE tbl_user_session SET dt_updated_at= $1, st_status = $2 WHERE st_bearer = $3`,
                  updateSessionArr
                )

                if (updateUserSession.rowCount > 0) {
                  response.msg = sails.__('msgSessionExpired')
                  response.code = 'SSN2'
                } else {
                  response.code = 'SSN2'
                }
              }
            } else {
              // Session expired.
              response.code = 'SSN3'
              response.msg = sails.__('msgSessionExpired')
            }
          } else {
            // Admin
            // #TODO: Admin session updation management goes here.
          }
        } else {
          response.code = 'SSN4'
          response.msg = sails.__('msgSessionExpired')
        }
        // }
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
   * @description Check whether phone number exists or not.
   * @date 11 July 2019
   */
  phoneExist: async function (req, res, next) {
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
        let dataSearchArr = [email]

        let listUser = await sails.sendNativeQuery(
          'select * from tbl_user_master where st_email_address = $1',
          dataSearchArr
        )
        //console.log(listUser);
        if (listUser.rowCount > 0) {
          response.msg = sails.__('msgFieldAlreadyExist', 'Email address')
        } else {
          response.status = 'success'
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
  encryptDecrypt: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      const text = req.body.text
      const type = req.body.type

      let validationFields = [
        {
          field: text,
          rules: {
            isInputRequired: sails.__('msgFieldIsRequired', 'Text')
          }
        },
        {
          field: type,
          rules: {
            isInputRequired: sails.__('msgFieldIsRequired', 'Type')
          }
        }
      ]

      const validate = await ValidationService.validate(validationFields)
      if (validate.status) {
        let newText = ''
        switch (type) {
          case 'encrypt':
            newText = CustomService.encrypt(text)
            break
          case 'decrypt':
            newText = CustomService.decrypt(text)
            break
          default:
            break
        }

        if (newText) {
          response.status = 'success'
          response.msg = ''
          response.data = newText
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
  // getUserDetailByParam: async function (req, res) {
  //   let response = {
  //     status: 'error',
  //     msg: sails.__('msgSomethingWentWrong'),
  //     data: ''
  //   }
  //   try {
  //     if (req.body.isAllGiver !== undefined) {
  //       // if false then return current user timezone related userlist
  //       let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)
  //       let tempUserData = []
  //       if (fetchUserDetails.userId !== undefined) {
  //         let userId = fetchUserDetails.userId
  //         tempUserData = await UserService.getUserDetailByParam([userId, sails.config.custom.accountStatus.active], req.body.isAllGiver)
  //       }

  //       console.log('/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/api/controllers/UserController.js Line(1388)')
  //       console.log(tempUserData)

  //       if (tempUserData.rowCount > 0) {
  //         response.status = 'success'
  //         response.msg = sails.__('msgDataFetched', 'Record')
  //         response.data = tempUserData.rows
  //         response.total = tempUserData.rowCount
  //       } else {
  //         response.msg = sails.__('msgDataFetchedError')
  //       }
  //     } else {
  //       response.msg = sails.__('msgRequiredParamMissing')
  //     }

  //   } catch (error) {
  //     console.log(error)
  //     response.msg = await CustomService.errorHandler(
  //       process.env.NODE_ENV,
  //       error
  //     )
  //   } finally {
  //     return res.json(response)
  //   }
  // },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch doers skills id wise method.
   * @date 07 Nov 2019
   */
  fetchDoersSkillWise: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // 1 = req, 2 = True(All givers), 3 = Skills Id
      const isAllGiver = req.body.isAllGiver
      const skillIds = req.body.skillIds

      const fetchDoersSkillWiseList = await UserService.fetchDoersSkillWiseList(req, isAllGiver, skillIds)

      response.status = 'success'
      response.msg = ''
      response.data = {
        'doersListing': fetchDoersSkillWiseList,
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
   * @description Fetch givers skills id wise method.
   * @date 07 Nov 2019
   */
  fetchGiversSkillWise: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // 1 = req, 2 = True(All givers), 3 = Skills Id
      const isAllGiver = req.body.isAllGiver
      const skillIds = req.body.skillIds

      // 1 = req, 2 = True(All givers), 3 = Skills Id
      const fetchGiversSkillWiseList = await UserService.fetchGiversSkillWiseList(req, isAllGiver, skillIds)

      response.status = 'success'
      response.msg = ''
      response.data = {
        'giversListing': fetchGiversSkillWiseList,
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      return res.json(response)
    }
  },
  /**
  * @author Vishnu S. Divetia
  * @description get active user list
  * @date 28 December 2019
  */
  getChatActiveUserList: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)
      if (fetchUserDetails.userId !== undefined) {
        let userId = fetchUserDetails.userId

        let chatActiveUserList = await UserService.getChatActiveUserList([sails.config.custom.accountStatus.active, userId])

        if (chatActiveUserList.rowCount > 0) {
          let chatRoomArr = []


          let chatListLength = chatActiveUserList.rows.length
          for (let index = 0; index < chatListLength; index++) {
            const element = chatActiveUserList.rows[index]
            chatRoomArr.push(Number(element.in_chat_room_id))
          }

          console.log('UserController.js Line(1519)')
          console.log(chatRoomArr)
          console.log(userId)

          let chatActiveUserCountDetails = await UserService.getChatActiveUserNotificationCount(chatRoomArr, userId)

          let totalUnreadMessageCount = 0
          // Add user notification count with rooms
          if (chatActiveUserCountDetails.rowCount > 0) {
            const chatActiveUserCountDetailsLength = chatActiveUserCountDetails.rows.length
            for (let outerIndex = 0; outerIndex < chatListLength; outerIndex++) {
              const outerElement = chatActiveUserList.rows[outerIndex]

              for (let innerIndex = 0; innerIndex < chatActiveUserCountDetailsLength; innerIndex++) {
                const innerElement = chatActiveUserCountDetails.rows[innerIndex]
                if (outerElement.in_chat_room_id === innerElement.in_chat_room_id) {
                  chatActiveUserList.rows[outerIndex]['in_chat_unread_message_count'] = innerElement.in_chat_unread_message_count
                  totalUnreadMessageCount += Number(innerElement.in_chat_unread_message_count)
                }
              }

            }
          }
          response.status = 'success'
          response.msg = sails.__('msgDataFetched', 'Chat active user(s)')
          response.data = chatActiveUserList.rows
          response.totalUnreadMessageCount = totalUnreadMessageCount
        } else {
          response.msg = sails.__('msgDataFetchedError')
        }
      } else {
        response.msg = sails.__('msgDataFetchedError')
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
  * @author Vishnu S. Divetia
  * @description get user profile details list
  * @date 16th Jan 2020
  */
  userProfileDetails: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)
      if (fetchUserDetails.userId !== undefined) {
        // let loggedInUserId = fetchUserDetails.userId
        let userId = CustomService.decrypt(req.body.userId)

        let userProfileDetails = await UserService.getPublicUserProfileDetailById([userId])

        if (userProfileDetails.rowCount > 0) {
          userProfileDetails.rows[0].userId = req.body.userId
          response.status = 'success'
          response.msg = sails.__('msgDataFetched', 'User profile')
          response.data = userProfileDetails.rows
        } else {
          response.msg = sails.__('msgDataFetchedError')
        }
      } else {
        response.msg = sails.__('msgDataFetchedError')
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
  * @author Vishnu S. Divetia
  * @description get user profile details list
  * @date 16th Jan 2020
  */
  list: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)
      if (fetchUserDetails.userId !== undefined) {
        // const userId = fetchUserDetails.userId

        const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.projectDefaultConfig.page
        const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.projectDefaultConfig.limit
        const search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        // const status = req.body.status !== undefined && req.body.status ? req.body.status : ['created']
        const status = 'active'
        const field = req.body.field !== undefined && req.body.field ? req.body.field : 'um.in_user_id'
        const sorttype = req.body.sorttype !== undefined && req.body.sorttype ? req.body.sorttype : 'desc'

        const listParam = {
          page: page,
          limit: limit,
          search: search,
          status: status,
          field: field,
          sorttype: sorttype,
        }

        const getDetails = await UserService.list(listParam)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          const allRecords = getDetails.rows.map(user => {
            user.userId = CustomService.encrypt(user.in_user_id)
            return user
          })
          response.msg = sails.__('msgRecordsFound', 'Users')
          response.data = {
            items: allRecords,
            total: getDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'users')
        }
      } else {
        response.msg = sails.__('msgDataFetchedError')
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
   * @description Get user profile categories details method.
   * @date 28th Jan 2019
   */
  getUserProfileCategoriesDetails: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authenticateion token.

      if (req.body.userId !== undefined && req.body.userId !== null) {
        let userId = CustomService.decrypt(req.body.userId)

        // Get user details by Id.
        let userCategoryDetailsData = await UserCategorySubcategoryDetailsService.getUserCategorySubcategoryDetails(
          [[sails.config.custom.accountStatus.active], [sails.config.custom.accountStatus.active], userId]
        )

        if (userCategoryDetailsData.rowCount > 0) {
          let keys = [['in_category_id', 'st_category_name'], ['in_subcategory_id', 'st_subcategory_name']]
          let tempCategoryArr = userCategoryDetailsData.rows.reduce((r, o) => {
            var [key, value] = keys.map(a => a.map(k => o[k]).join(':'));
            (r[key] = r[key] || []).push(value)
            return r
          }, [])

          let finalCategoryArr = []
          for (let [categoryKey, subcategoryKey] of Object.entries(tempCategoryArr)) {
            let tmpCategory = categoryKey.split(':')
            let category = {
              id: tmpCategory[0],
              name: tmpCategory[1]
            }

            let subcategory = []
            for (let subcategoryVal of subcategoryKey) {
              let tempSubcategory = subcategoryVal.split(':')
              subcategory.push({ id: tempSubcategory[0], name: tempSubcategory[1] })
            }

            category.subCategory = subcategory
            finalCategoryArr.push(category)
          }

          response.status = 'success'
          response.msg = sails.__('msgRecordsFound', 'Categories')
          response.data = finalCategoryArr
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'categories')
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
}
