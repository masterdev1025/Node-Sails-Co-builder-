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
   * @description Reset password method.
   * @date 11 July 2019
   */
  changePassword: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (
        req.body.currentPassword !== undefined &&
        req.body.newPassword !== undefined &&
        req.body.confirmPassword !== undefined
      ) {
        let currentPassword = req.body.currentPassword.trim()
        let newPassword = req.body.newPassword.trim()
        let confirmPassword = req.body.confirmPassword.trim()

        let validationFields = [
          {
            field: currentPassword,
            rules: {
              isInputRequired: sails.__(
                'msgFieldIsRequired',
                'Current password'
              )
            }
          },
          {
            field: newPassword,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'New Password'),
              isPassword: sails.__('msgFieldValidPassword')
            }
          },
          {
            field: confirmPassword,
            comparePassword: newPassword,
            rules: {
              isInputRequired: sails.__(
                'msgFieldIsRequired',
                'Confirm password'
              ),
              isComparePassword: sails.__('msgFieldConfirmPasswordMatch')
            }
          }
        ]

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)

        if (validate.status) {
          // Fetch user id.
          let fetchUserDetails = await CustomService.fetchUserDetails(
            req,
            req.body.response
          )

          if (fetchUserDetails.userId !== undefined) {
            let userId = parseInt(fetchUserDetails.userId)
            let currentPasswordVal = crypto
              .createHash('md5')
              .update(currentPassword)
              .digest('hex')

            // Update user password in user master table.
            let currentPasswordCheck = await UserService.currentPasswordCheck([
              userId,
              currentPasswordVal
            ])

            if (currentPasswordCheck.rowCount > 0) {
              let passwordVal = crypto
                .createHash('md5')
                .update(newPassword)
                .digest('hex')

              // Update user password in user master table.
              let updateUserPasswordArr = await UserService.updateUserPassword([
                passwordVal,
                CustomService.currentDate(),
                userId,
                sails.config.custom.accountStatus.active
              ])

              if (updateUserPasswordArr.rowCount > 0) {
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
                await MailerService.sendEmail(mailName, mailParams, mailOptions) // <= Here we using
                //console.log(sentMail);

                response.status = 'success'
                response.msg = sails.__('msgPasswordChange', 'Password')
              } else {
                response.msg = sails.__('msgPasswordChangeError')
              }
            } else {
              response.msg = sails.__('msgIncorrectCurrentPassword')
            }
          } else {
            response.msg = sails.__('msgSessionExpired')
            response.code = 'SSN1'
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
   * @description Get password and security details.
   * @date 14 Sept 2019
   */
  getPasswordSecurityDetails: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authenticateion token.
      let fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        let userId = fetchUserDetails.userId

        // Get user details by Id.
        let userDetails = await UserService.getUserAndProfileDetailById([
          userId
        ])

        if (userDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__('msgRecordsFound', 'User')
          response.data = userDetails.rows[0]
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'user')
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
   * @description Get earning private flag method.
   * @date 28 Aug 2019
   */
  updateTwoStepVerification: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authenticateion token.
      let fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        let userId = fetchUserDetails.userId
        let flag = req.body.flag

        let phoneNumberVerifiedCheck = await UserService.phoneNumberVerifiedCheck(
          [userId, sails.config.custom.commonStatus.active]
        )
        if (phoneNumberVerifiedCheck.rowCount > 0) {
          let userProfileSettingsEntry = await UserProfileDetailsService.profileSettingsExist(
            [userId]
          )

          let insertUpdateUserProfileSettingsDetails = ''

          // Insert or update the profile settings details records.
          let commonFlag = flag
            ? sails.config.custom.commonStatus.active
            : sails.config.custom.commonStatus.inactive
          let successMsg = flag ? 'msgDataActivated' : 'msgDataInactivated'
          let errorMsg = flag
            ? 'msgDataActivatedError'
            : 'msgDataInactivatedError'
          if (userProfileSettingsEntry.rowCount > 0) {
            insertUpdateUserProfileSettingsDetails = await UserProfileDetailsService.updateTwoStepVerification(
              [userId, commonFlag, CustomService.currentDate()]
            )
          } else {
            insertUpdateUserProfileSettingsDetails = await UserProfileDetailsService.insertUserProfileSettings(
              [
                userId,
                null,
                null,
                null,
                commonFlag,
                CustomService.currentDate(),
                CustomService.currentDate()
              ]
            )
          }

          if (insertUpdateUserProfileSettingsDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = sails.__(successMsg, 'Two-step verification')
          } else {
            response.msg = sails.__(errorMsg, 'two-step verification')
          }
        } else {
          response.msg = sails.__('msgFieldNotVerified', 'Phone number')
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
