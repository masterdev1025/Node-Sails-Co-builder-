/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user details method.
   * @date 28 Aug 2019
   */
  getUserProfileDetails: async function (req, res) {
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
        let userDetails = await UserService.getUserProfileDetailById([userId])

        if (userDetails.rowCount > 0) {
          let base64ProfilePicture = ''
          if (userDetails.rows[0].st_profile_picture) {
            base64ProfilePicture = await CustomService.base64Encode(
              require('path').resolve(
                sails.config.appPath,
                'assets/uploads/images/profile'
              ) +
              '/' +
              userDetails.rows[0].st_profile_picture
            )
          }

          response.status = 'success'
          response.msg = sails.__('msgRecordsFound', 'User')
          response.data = userDetails.rows[0]
          response.data.profile_picture = base64ProfilePicture
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'user')
        }
      } else {
        response.msg = sails.__('msgFieldVerifyRecaptcha')
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
   * @description Get user profile details method.
   * @date 30th Jan 2020
   */
  getProfileDetails: async function (req, res) {
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
        let userDetails = await UserService.getUserProfileDetailById([userId])

        if (userDetails.rowCount > 0) {
          let base64ProfilePicture = ''
          if (userDetails.rows[0].st_profile_picture) {
            base64ProfilePicture = await CustomService.base64Encode(
              require('path').resolve(
                sails.config.appPath,
                'assets/uploads/images/profile'
              ) +
              '/' +
              userDetails.rows[0].st_profile_picture
            )
          }

          // Get Categories details starts.
          let userCategoryDetailsData = await UserCategorySubcategoryDetailsService.getUserCategorySubcategoryDetails(
            [[sails.config.custom.accountStatus.active], [sails.config.custom.accountStatus.active], userId]
          )

          let finalCategoryArr = []
          if (userCategoryDetailsData.rowCount > 0) {
            let keys = [['in_category_id', 'st_category_name'], ['in_subcategory_id', 'st_subcategory_name']]
            let tempCategoryArr = userCategoryDetailsData.rows.reduce((r, o) => {
              var [key, value] = keys.map(a => a.map(k => o[k]).join(':'));
              (r[key] = r[key] || []).push(value)
              return r
            }, [])

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
          }
          // Get Categories details ends.

          // Get all skills details starts.
          // let skillDetailsData = await UserSkillDetailsService.getSkillsDetails([[sails.config.custom.accountStatus.active]])
          let userSkillDetailsData = await UserSkillDetailsService.getUserSkillDetails([userId])

          let finalSkillArr = []
          if (userSkillDetailsData.rowCount > 0) {
            for (let skillData of userSkillDetailsData.rows) {
              let skills = {
                id: skillData['in_skill_id'],
                name: skillData['st_skill_name']
              }
              finalSkillArr.push(skills)
            }
          }
          // Get all skills details ends.

          response.status = 'success'
          response.msg = sails.__('msgRecordsFound', 'User')
          response.data = userDetails.rows[0]
          response.data.profile_picture = base64ProfilePicture
          response.data.categories = finalCategoryArr
          response.data.skills = finalSkillArr
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'user')
        }
      } else {
        response.msg = sails.__('msgFieldVerifyRecaptcha')
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
   * @description Update user profile account details method.
   * @date 26 Aug 2019
   */
  updateUserProfileAccount: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.firstName !== undefined && req.body.lastName !== undefined && req.body.email !== undefined && req.body.dateOfBirth !== undefined) {
        let firstName = req.body.firstName.trim()
        let lastName = req.body.lastName.trim()
        let email = req.body.email.toLocaleLowerCase()
        let dateOfBirth = req.body.dateOfBirth.trim()

        let validationFields = [
          {
            field: firstName,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'First Name'),
              isString: sails.__('msgFieldString', 'first name'),
              'minLength:2': sails.__('msgFieldMinLength', '2', 'first name'),
              'maxLength:100': sails.__('msgFieldMaxLength', '100', 'first name')
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
            field: dateOfBirth,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Date of birth'),
              'dateFormat:yyyymmdd': sails.__('msgFieldInvalidDateFormate', 'Date of birth'),
              isPreviousDate: sails.__('msgFieldValidDOB', 'Date of birth')
            }
          }
        ]

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)

        if (validate.status) {
          // Fetch user id and basic details from authenticateion token.
          let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

          if (fetchUserDetails.userId !== undefined) {
            let userId = fetchUserDetails.userId

            // Check email is exists or not.
            let emailExistCheck = await UserService.editEmailExist([userId, email, 'delete'])

            // User is authenticated then it will proceed.
            if (emailExistCheck.rowCount === 0) {
              // Fetch previous user email details in case it is changed.
              // Step 1: Get user details.
              let userDetails = await UserService.getUserProfileDetailById([userId])

              // Step 2: Update the user profile details using userId.
              let userAccountDetails = [
                userId,
                firstName,
                lastName,
                email,
                dateOfBirth,
                CustomService.currentDate()
              ]

              let updateUserAccountDetails = await UserService.updateUserAccountDetails(userAccountDetails)

              if (updateUserAccountDetails.rowCount > 0 && userDetails.rows[0].st_email_address !== email) {
                // Step 3: If email is updated by user then we need to again reverify that user.
                // Send email confirmation link to newly updated email address.
                //===========================
                let randomVerificationCode = CustomService.randomString(20)
                let updateArr = [
                  userId,
                  randomVerificationCode,
                  sails.config.custom.accountStatus.pending,
                  CustomService.currentDate()
                ]
                let resetUserAccountonEmailChange = await UserService.resetUserAccountonEmailChange(
                  updateArr
                )

                if (resetUserAccountonEmailChange.rowCount > 0) {
                  let emailConfirmationLink = sails.config.custom.appUrl + '/emailconfirm/' + randomVerificationCode

                  // Send mail configurations.
                  let mailName = 'updateProfileEmailConfirmation' // Update mail and update email template according.

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
                    subject: sails.config.custom.appName + ' - Email Confirmation',
                    from: sails.config.custom.appName + ' <' + sails.config.custom.noreplyEmail + '>',
                    sender: sails.config.custom.noreplyEmail
                  }

                  response.status = 'success'
                  response.msg = sails.__(
                    'msgDataUpdatedandLoggedOut',
                    'User profile'
                  )

                  // Send email confirmation mail.
                  let sentMail = MailerService.sendEmail(mailName, mailParams, mailOptions) // <= Here we using
                  //console.log(sentMail);
                  //===========================

                  // Remove all logged in session of currently logged in user.
                  setTimeout(() => {
                    UserSessionService.removeUserSession([CustomService.currentDate(), userId])
                  }, 5000)
                } else {
                  response.msg = sails.__('msgDataUpdated', 'User profile')
                }
              } else {
                response.status = 'success'
                response.msg = sails.__('msgDataUpdated', 'User profile')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'Email address')
            }
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'users')
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
   * @description Update user company details method.
   * @date 18th Jan 2020
   */
  updateUserCompanyDetails: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.businessTitle !== undefined && req.body.aboutYourself !== undefined) {
        let aboutYourself = req.body.aboutYourself.trim()
        let businessTitle = req.body.businessTitle.trim()
        let companyName = req.body.companyName ? req.body.companyName : ''
        let website = req.body.website ? req.body.website : ''

        let validationFields = [
          {
            field: businessTitle,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Business Title'),
              'minLength:2': sails.__('msgFieldMinLength', '2', 'business title'),
              'maxLength:100': sails.__('msgFieldMaxLength', '100', 'business title')
            }
          },
          {
            field: aboutYourself,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'About Yourself'),
              'minLength:4': sails.__('msgFieldMinLength', '2', 'about yourself'),
              'maxLength:250': sails.__('msgFieldMaxLength', '250', 'about yourself')
            }
          }
        ]

        if (companyName) {
          validationFields.push({
            field: companyName,
            rules: {
              'minLength:2': sails.__('msgFieldMinLength', '2', 'company name'),
              'maxLength:100': sails.__('msgFieldMaxLength', '100', 'company name')
            }
          })
        }

        if (website) {
          validationFields.push({
            field: website,
            rules: {
              isUrl: sails.__('msgDataNotValidUrl'),
              'minLength:2': sails.__('msgFieldMinLength', '2', 'website'),
              'maxLength:255': sails.__('msgFieldMaxLength', '100', 'website')
            }
          })
        }

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)

        if (validate.status) {
          // Fetch user id and basic details from authenticateion token.
          let fetchUserDetails = await CustomService.fetchUserDetails(
            req,
            req.body.response
          )

          if (fetchUserDetails.userId !== undefined) {
            let userId = fetchUserDetails.userId

            // Fetch previous user email details in case it is changed.
            // Update the user company details using userId.
            let userCompanyDetails = [
              userId,
              companyName,
              businessTitle,
              website,
              aboutYourself,
              CustomService.currentDate()
            ]

            let updateUserCompanyDetails = await UserService.updateUserCompanyDetails(
              userCompanyDetails
            )

            if (updateUserCompanyDetails.rowCount > 0) {
              response.status = 'success'
              response.msg = sails.__('msgDataUpdated', 'Other details')
            } else {
              response.msg = sails.__('msgDataUpdatedError')
            }
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'users')
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
   * @description Update user profile location details method.
   * @date 31 Aug 2019
   */
  updateUserProfileLocation: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.address !== undefined && req.body.countryId !== undefined && req.body.stateId !== undefined && req.body.cityId !== undefined && req.body.pincode !== undefined && req.body.timezone !== undefined) {
        let address = req.body.address.trim()
        let countryId = req.body.countryId ? parseInt(req.body.countryId) : ''
        let stateId = req.body.stateId ? parseInt(req.body.stateId) : ''
        let cityId = req.body.cityId ? parseInt(req.body.cityId) : ''
        let pincode = req.body.pincode
        let timezone = req.body.timezone

        let validationFields = [
          {
            field: address,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Address'),
              'minLength:2': sails.__('msgFieldMinLength', '2', 'address'),
              'maxLength:255': sails.__('msgFieldMaxLength', '255', 'address')
            }
          },
          {
            field: countryId,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Country selection')
            }
          },
          {
            field: stateId,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'State selection')
            }
          },
          {
            field: cityId,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'City selection')
            }
          },
          {
            field: pincode,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Pincode'),
              isAlphanumeric: sails.__('msgFieldIsAlphanumeric', 'Pincode'),
              'minLength:4': sails.__('msgFieldMinLength', '4', 'pincode'),
              'maxLength:10': sails.__('msgFieldMaxLength', '10', 'pincode')
            }
          },
          {
            field: timezone,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Timezone selection')
            }
          }
        ]

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)

        if (validate.status) {
          // Fetch user id and basic details from authenticateion token.
          let fetchUserDetails = await CustomService.fetchUserDetails(
            req,
            req.body.response
          )

          if (fetchUserDetails.userId !== undefined) {
            let userId = fetchUserDetails.userId

            // Fetch previous user email details in case it is changed.
            // Update the user profile details using userId.
            let userLocationDetails = [
              userId,
              address,
              countryId,
              stateId,
              cityId,
              pincode,
              timezone,
              CustomService.currentDate()
            ]

            let updateUserLocationDetails = await UserService.updateUserLocationDetails(
              userLocationDetails
            )

            if (updateUserLocationDetails.rowCount > 0) {
              response.status = 'success'
              response.msg = sails.__('msgDataUpdated', 'User profile')
            } else {
              response.msg = sails.__('msgDataUpdatedError')
            }
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'users')
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
   * @description Update user profile phone details method.
   * @date 14 Sept 2019
   */
  updateUserProfilePhone: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.countryCode !== undefined && req.body.phoneNumber !== undefined) {
        let countryCode = req.body.countryCode
        let phoneNumber = req.body.phoneNumber

        let validationFields = [
          {
            field: countryCode,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Country code')
            }
          },
          {
            field: phoneNumber,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'Phone number'),
              isNumber: sails.__('msgFieldNumeric', 'Phone number'),
              'minLength:7': sails.__('msgFieldMinLength', '7', 'phone number'),
              'maxLength:11': sails.__('msgFieldMaxLength', '11', 'phone number')
            }
          }
        ]

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)

        console.log('/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/api/controllers/ProfileController.js Line(505)')
        console.log(validate)

        if (validate.status) {
          // Fetch user id and basic details from authenticateion token.
          let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

          if (fetchUserDetails.userId !== undefined) {
            let userId = fetchUserDetails.userId

            // Check phone is exists or not.
            let phoneExistCheck = await UserService.editPhoneExist([userId, phoneNumber, 'delete'])

            // User is authenticated then it will proceed.
            if (phoneExistCheck.rowCount === 0) {
              // Fetch previous user phone details in case it is changed.
              // Step 1: Get user details.
              let userDetails = await UserService.getUserProfileDetailById([userId])

              // Step 2: Update the user phone number using userId.
              let userPhoneDetails = [
                userId,
                countryCode,
                phoneNumber,
                CustomService.currentDate()
              ]

              let updateUserPhoneDetails = await UserService.updateUserPhoneDetails(userPhoneDetails)

              if (
                updateUserPhoneDetails.rowCount > 0 &&
                userDetails.rows[0].st_phone_number !== phoneNumber
              ) {
                // Deactivate the two-step verificaiton. START
                let userProfileSettingsEntry = await UserProfileDetailsService.profileSettingsExist([userId])

                // Insert or update the profile settings details records.
                let commonFlag = sails.config.custom.commonStatus.inactive
                if (userProfileSettingsEntry.rowCount > 0) {
                  await UserProfileDetailsService.updateTwoStepVerification([userId, commonFlag, CustomService.currentDate()])
                } else {
                  await UserProfileDetailsService.insertUserProfileSettings([
                    userId,
                    null,
                    null,
                    null,
                    commonFlag,
                    CustomService.currentDate(),
                    CustomService.currentDate()
                  ])
                }
                // Deactivate the two-step verificaiton. END

                // Step 3: If phone number is updated by user then we need to again reverify phone number.
                //===========================
                let randomVerificationCode = CustomService.randomNumber(6)
                let updateArr = [
                  userId,
                  randomVerificationCode,
                  sails.config.custom.accountStatus.pending,
                  CustomService.currentDate()
                ]
                let resetUserAccountonPhoneChange = await UserService.resetUserAccountonPhoneChange(updateArr)

                if (resetUserAccountonPhoneChange.rowCount > 0) {
                  // #TODO: send verification code to phone by message code goes here.

                  response.status = 'success'
                  response.msg = sails.__('msgDataUpdated', 'User profile')
                  response.data = randomVerificationCode
                } else {
                  response.msg = sails.__('msgDataUpdated', 'User profile')
                }
              } else {
                response.status = 'success'
                response.msg = sails.__('msgDataUpdated', 'User profile')
              }
            } else {
              response.msg = sails.__('msgFieldAlreadyExist', 'Phone number')
            }
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'users')
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
   * @description Verify user profile phone method.
   * @date 14 Sept 2019
   */
  verifyUserProfilePhone: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.phoneVerificationCode !== undefined) {
        let phoneVerificationCode = req.body.phoneVerificationCode

        let validationFields = [
          {
            field: phoneVerificationCode,
            rules: {
              isInputRequired: sails.__('msgFieldIsRequired', 'OTP'),
              isNumber: sails.__('msgFieldNumeric', 'OTP'),
              'minLength:6': sails.__('msgFieldExactDigitLength', 'OTP', '6'),
              'maxLength:6': sails.__('msgFieldExactDigitLength', 'OTP', '6')
            }
          }
        ]

        // Custom validation.
        var validate = await ValidationService.validate(validationFields)

        if (validate.status) {
          // Fetch user id and basic details from authenticateion token.
          let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

          if (fetchUserDetails.userId !== undefined) {
            let userId = fetchUserDetails.userId

            // Check OTP is exists or not.
            let verificationCodeExistCheck = await UserService.verificationCodeExist([userId, phoneVerificationCode])

            // OTP is authenticated then it will proceed.
            if (verificationCodeExistCheck.rowCount !== 0) {
              // Update the status of phone to verified.
              let userPhoneDetails = [
                userId,
                sails.config.custom.accountStatus.active,
                CustomService.currentDate()
              ]

              let verifyUserPhoneDetails = await UserService.verifyUserPhoneDetails(userPhoneDetails)

              // If phone number is verified.
              if (verifyUserPhoneDetails.rowCount > 0) {
                response.status = 'success'
                response.msg = sails.__('msgDataVerified', 'Phone number')
              } else {
                response.msg = sails.__('msgDataVerifiedError')
              }
            } else {
              response.msg = sails.__('msgFieldIncorrect', 'OTP')
            }
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'users')
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
   * @date 14 Sept 2019
   */
  resendOTP: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authenticateion token.
      let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

      if (fetchUserDetails.userId !== undefined) {
        let userId = fetchUserDetails.userId

        // Check OTP is exists or not.
        let userDetails = await UserService.getUserProfileDetailById([userId])

        // OTP is authenticated then it will proceed.
        if (userDetails.rowCount > 0) {
          if (userDetails.rows[0].st_phone_number !== undefined && userDetails.rows[0].st_phone_number) {
            const verificationCode = (userDetails.rows[0].st_phone_verification_code !== undefined && userDetails.rows[0].st_phone_verification_code) ? userDetails.rows[0].st_phone_verification_code : CustomService.randomNumber(6)

            // #TODO: send verification code to phone by message code goes here.

            // Update the information of reverify the phone number.
            let userPhoneDetails = [
              userId,
              verificationCode,
              sails.config.custom.accountStatus.pending,
              CustomService.currentDate()
            ]

            let changeUserStatusDetails = await UserService.changePhoneVerificatonStatus(userPhoneDetails)

            // If user phone verification status changed.
            if (changeUserStatusDetails.rowCount > 0) {
              response.status = 'success'
              response.msg = sails.__('msgDataSend', 'OTP')
            } else {
              response.msg = sails.__('msgDataSendError')
            }
          } else {
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'user')
        }
      } else {
        response.msg = sails.__('msgNoRecordsFound', 'user')
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
   * @description Get all countries details method.
   * @date 4th Sept 2019
   */
  getAllCountries: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authenticateion token.
      let fetchCountryDetails = await UserService.getAllCountries()
      response.status = 'success'
      response.msg = sails.__('msgRecordsFound', 'Countries')
      response.data = fetchCountryDetails.rows
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
   * @description Get all state by country id method.
   * @date 4th Sept 2019
   */
  getStateByCountryId: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authenticateion token.
      let fetchStateDetails = await UserService.getStateByCountryId([
        req.body.countryId
      ])
      response.status = 'success'
      response.msg = sails.__('msgRecordsFound', 'States')
      response.data = fetchStateDetails.rows
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
   * @description Get all city by state id method.
   * @date 4th Sept 2019
   */
  getCityByStateId: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authenticateion token.
      let fetchCityDetails = await UserService.getCityByStateId([
        req.body.stateId
      ])
      response.status = 'success'
      response.msg = sails.__('msgRecordsFound', 'Cities')
      response.data = fetchCityDetails.rows
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
   * @description Upload user profile image method.
   * @date 27 Sept 2019
   */
  uploadProfilePicture: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      if (
        req.file('profilePicture') !== undefined &&
        req.file('profilePicture')._files[0] !== undefined &&
        req.file('profilePicture')._files[0].stream !== undefined
      ) {
        let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

        if (fetchUserDetails.userId !== undefined) {
          // jpeg / png / extension
          // 200 x 200 size
          // 200kb length
          let upload = req.file('profilePicture')._files[0].stream
          let headers = upload.headers
          let byteCount = upload.byteCount
          let validated = true
          let errorMessages = []
          let fileParams = {}
          let settings = {
            allowedTypes: sails.config.custom.allowedProfileImageTypes,
            maxBytes: 200000 // 200 KB.
          }
          // Check file type
          if (_.indexOf(settings.allowedTypes, headers['content-type']) === -1) {
            validated = false
            errorMessages.push(
              'Invalid filetype : ' + upload.filename + ' : ' + ' (' + headers['content-type'] + ').'
            )
          }
          // Check file size
          if (byteCount > settings.maxBytes) {
            validated = false
            errorMessages.push(
              'File size exceeded: ' + upload.filename + ' : ' + byteCount + '/' + settings.maxBytes + '.'
            )
          }

          // Upload the file.
          if (validated) {
            const previousProfilePicture = req.body.currentProfilePicture

            // First upload the file
            req.file('profilePicture').upload(
              {
                dirname: require('path').resolve(
                  sails.config.appPath,
                  'assets/uploads/images/profile'
                )
              },
              async (err, files) => {
                if (err) {
                  return res.serverError(err)
                }
                fileParams = {
                  fileName: files[0].fd
                    .split('/')
                    .pop()
                    .split('.')
                    .shift(),
                  extension: files[0].fd.split('.').pop(),
                  originalName: upload.filename,
                  contentType: files[0].type,
                  fileSize: files[0].size,
                  uploadedBy: req.userID
                }
                let sizeOf = require('image-size')
                let dimensions = sizeOf(files[0].fd)
                if (dimensions.width <= 200 && dimensions.height <= 200 && dimensions.width === dimensions.height) {
                  let fileName =
                    fileParams.fileName + '.' + fileParams.extension
                  let signOutDetails = await UserService.setUserProfilePicture([
                    fileName,
                    fetchUserDetails.userId
                  ])
                  console.log('/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/api/controllers/ProfileController.js Line(829)')
                  console.log(signOutDetails.rowCount)
                  if (signOutDetails.rowCount > 0) {
                    // Remove previous file
                    if (
                      previousProfilePicture !== '' &&
                      previousProfilePicture !== null &&
                      previousProfilePicture !== 'null'
                    ) {
                      previousFilePath =
                        require('path').resolve(
                          sails.config.appPath,
                          'assets/uploads/images/profile'
                        ) +
                        '/' +
                        previousProfilePicture
                      CustomService.removeFiles([previousFilePath])
                    }

                    const base64ProfilePicture = await CustomService.base64Encode(
                      require('path').resolve(
                        sails.config.appPath,
                        'assets/uploads/images/profile'
                      ) +
                      '/' +
                      fileName
                    )
                    response.status = 'success'
                    response.data = {
                      profilePicture: base64ProfilePicture,
                      currentProfilePicture: fileName
                    }
                    response.msg = sails.__('msgDataUpload', 'Profile picture')
                  } else {
                    // Remove unsuccessful files.
                    CustomService.removeFiles([files[0].fd])
                    response.msg = sails.__('msgDataUploadedError')
                  }
                } else {
                  // Remove unsuccessful files.
                  CustomService.removeFiles([files[0].fd])
                  response.msg = sails.__('msgDataFileInvalidDimensionError')
                }
                // console.log('resfsdf');
                // console.log(response);
                return res.json(response)
              }
            )
          } else {
            // validation fail
            response.msg = sails.__(
              'msgDataFileValidationError',
              errorMessages.join(' - ')
            )
            return res.json(response)
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'user')
          return res.json(response)
        }
      } else {
        response.msg = sails.__('msgRequiredParamMissing')
        return res.json(response)
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
      return res.json(response)
    }
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Upload user profile image method.
   * @date 27 Sept 2019
   */
  deleteProfilePicture: async function (req, res) {
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
        let userDetails = await UserService.getUserDetailById([userId])

        if (userDetails.rowCount > 0) {
          // Get user details by Id.
          let deleteUserProfilePicture = await UserService.deleteUserProfilePicture([userId])

          if (deleteUserProfilePicture.rowCount > 0) {
            let profilePictureImage =
              require('path').resolve(
                sails.config.appPath,
                'assets/uploads/images/profile'
              ) +
              '/' +
              userDetails.rows[0].st_profile_picture
            CustomService.removeFiles([profilePictureImage])

            response.status = 'success'
            response.msg = sails.__('msgDataDeleted', 'Profile Picture')
          } else {
            response.msg = sails.__('msgDataDeletedError')
          }
        } else {
          // Something went wrong. Messages goes here.
        }
      } else {
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
  }
}
