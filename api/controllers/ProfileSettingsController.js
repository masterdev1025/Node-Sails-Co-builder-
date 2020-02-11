/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get all categories details method.
   * @date 21 Oct 2019
   */
  getCategoriesDetails: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Get user details by Id.
      let categoryDetailsData = await UserCategorySubcategoryDetailsService.getCategorySubcategoryDetails(
        [[sails.config.custom.accountStatus.active], [sails.config.custom.accountStatus.active]]
      )

      if (categoryDetailsData.rowCount > 0) {
        let keys = [['in_category_id', 'st_category_name'], ['in_subcategory_id', 'st_subcategory_name']]
        let tempCategoryArr = categoryDetailsData.rows.reduce((r, o) => {
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
   * @date 16 Oct 2019
   */
  getUserProfileCategoriesDetails: async function (req, res) {
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
   * @description Update user profile categories method.
   * @date 19 Oct 2019
   */
  updateUserProfileCategories: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.userProfileCategories !== undefined) {
        const userProfileCategories = req.body.userProfileCategories
        const validationFields = [
          {
            field: userProfileCategories,
            rules: {
              isInputArrRequired: sails.__('msgFieldIsRequired', 'Category selection')
            }
          }
        ]

        const validate = await ValidationService.validate(validationFields)
        if (validate.status) {
          // Fetch user id and basic details from authentication token.
          const fetchUserDetails = await CustomService.fetchUserDetails(
            req,
            req.body.response
          )

          if (fetchUserDetails.userId !== undefined) {
            const userId = fetchUserDetails.userId

            let userProfileCategoriesDetails = []
            if (userProfileCategories.length > 0) {
              // Delete all existing records of user profile categories.
              await UserCategorySubcategoryDetailsService.removeUserProfileCategories([userId])

              for (let categoryIndex in userProfileCategories) {
                let categoryId = userProfileCategories[categoryIndex]['categoryId']
                let subCatgoriesArr = userProfileCategories[categoryIndex]['subCategoryIds']

                for (let subcategoryIndex in subCatgoriesArr) {
                  const userCategoriesArr = [
                    categoryId,
                    subCatgoriesArr[subcategoryIndex],
                    userId,
                    CustomService.currentDate()
                  ]

                  let tempArr = await UserCategorySubcategoryDetailsService.addUserCategoryDetails(userCategoriesArr)
                  userProfileCategoriesDetails.push(tempArr.rows[0].in_user_category_id)
                }
              }
            }

            if (userProfileCategoriesDetails.length > 0) {
              response.status = 'success'
              response.msg = sails.__('msgDataUpdated', 'Categories')
            } else {
              response.msg = sails.__('msgDataUpdatedError', 'Categories')
            }
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
   * @description Get all skills details method.
   * @date 21 Oct 2019
   */
  getSkillsDetails: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Get all skills details.
      let skillDetailsData = await UserSkillDetailsService.getSkillsDetails([[sails.config.custom.accountStatus.active]])

      if (skillDetailsData.rowCount > 0) {
        let finalSkillArr = []
        for (let skillData of skillDetailsData.rows) {
          let skills = {
            id: skillData['in_skill_id'],
            name: skillData['st_skill_name']
          }
          finalSkillArr.push(skills)
        }

        response.status = 'success'
        response.msg = sails.__('msgRecordsFound', 'Skills')
        response.data = finalSkillArr
      } else {
        response.msg = sails.__('msgNoRecordsFound', 'skills')
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
   * @description Get user profile skills details method.
   * @date 18 Oct 2019
   */
  getUserProfileSkillsDetails: async function (req, res) {
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
        let userSkillDetailsData = await UserSkillDetailsService.getUserSkillDetails([userId])

        if (userSkillDetailsData.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__('msgRecordsFound', 'Skills')
          response.data = userSkillDetailsData.rows
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'skills')
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
   * @description Update user profile skills method.
   * @date 19 Oct 2019
   */
  updateUserProfileSkills: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.userProfileSkills !== undefined) {
        const userProfileSkills = req.body.userProfileSkills
        const validationFields = [
          {
            field: userProfileSkills,
            rules: {
              isInputArrRequired: sails.__('msgFieldIsRequired', 'Skill selection')
            }
          }
        ]

        const validate = await ValidationService.validate(validationFields)
        if (validate.status) {
          // Fetch user id and basic details from authentication token.
          const fetchUserDetails = await CustomService.fetchUserDetails(
            req,
            req.body.response
          )

          if (fetchUserDetails.userId !== undefined) {
            const userId = fetchUserDetails.userId

            let userProfileSkillsDetails = []
            if (userProfileSkills.length > 0) {
              // Delete all existing records user profile skills.
              await UserSkillDetailsService.removeUserProfileSkills([userId])

              for (let skillIndex in userProfileSkills) {
                const userSkillsArr = [
                  userId,
                  userProfileSkills[skillIndex],
                  CustomService.currentDate()
                ]

                let tempArr = await UserSkillDetailsService.addUserSkillDetails(userSkillsArr)
                userProfileSkillsDetails.push(tempArr.rows[0].in_user_skill_id)
              }
            }

            if (userProfileSkillsDetails.length > 0) {
              response.status = 'success'
              response.msg = sails.__('msgDataUpdated', 'Skills')
            } else {
              response.msg = sails.__('msgDataUpdatedError', 'skills')
            }
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
   * @description Get user details method.
   * @date 28 Aug 2019
   */
  getUserProfileSettingsDetails: async function (req, res) {
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
        let userProfileSettingsDetails = await UserProfileDetailsService.getUserProfileSettingsDetailById(
          [userId]
        )

        if (userProfileSettingsDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__('msgRecordsFound', 'User profile settings')
          response.data = userProfileSettingsDetails.rows[0]
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'user profile settings')
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
   * @description Get earning private flag method.
   * @date 28 Aug 2019
   */
  updateEarningPrivate: async function (req, res) {
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

        let userProfileSettingsEntry = await UserProfileDetailsService.profileSettingsExist(
          [userId]
        )

        let insertUpdateUserProfileSettingsDetails = ''

        // Insert or update the profile settings details records.
        let commonFlag = flag
          ? sails.config.custom.commonStatus.active
          : sails.config.custom.commonStatus.inactive
        let successMsg = flag ? 'msgDataActivated' : 'msgDataInactivated'
        let errorFlag = flag
          ? 'msgDataActivatedError'
          : 'msgDataInactivatedError'
        if (userProfileSettingsEntry.rowCount > 0) {
          insertUpdateUserProfileSettingsDetails = await UserProfileDetailsService.updateUserEarning(
            [userId, commonFlag, CustomService.currentDate()]
          )
        } else {
          insertUpdateUserProfileSettingsDetails = await UserProfileDetailsService.insertUserProfileSettings(
            [
              userId,
              commonFlag,
              null,
              null,
              null,
              CustomService.currentDate(),
              CustomService.currentDate()
            ]
          )
        }

        if (insertUpdateUserProfileSettingsDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__(successMsg, 'Earning Private Flag')
        } else {
          response.msg = sails.__(errorFlag)
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
   * @description Update new project notification flag method.
   * @date 7 Sept 2019
   */
  updateNewProjectNotification: async function (req, res) {
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

        let userProfileSettingsEntry = await UserProfileDetailsService.profileSettingsExist(
          [userId]
        )

        let insertUpdateUserProfileSettingsDetails = ''

        // Insert or update the profile settings details records.
        let commonFlag = flag
          ? sails.config.custom.commonStatus.active
          : sails.config.custom.commonStatus.inactive
        let successMsg = flag ? 'msgDataActivated' : 'msgDataInactivated'
        let errorFlag = flag
          ? 'msgDataActivatedError'
          : 'msgDataInactivatedError'
        if (userProfileSettingsEntry.rowCount > 0) {
          insertUpdateUserProfileSettingsDetails = await UserProfileDetailsService.updateNewProjectNotification(
            [userId, commonFlag, CustomService.currentDate()]
          )
        } else {
          insertUpdateUserProfileSettingsDetails = await UserProfileDetailsService.insertUserProfileSettings(
            [
              userId,
              null,
              commonFlag,
              null,
              null,
              CustomService.currentDate(),
              CustomService.currentDate()
            ]
          )
        }

        if (insertUpdateUserProfileSettingsDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__(successMsg, 'New Project Notification Flag')
        } else {
          response.msg = sails.__(errorFlag)
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
   * @description Update newsletter flag method.
   * @date 28 Aug 2019
   */
  updateNewsletter: async function (req, res) {
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

        let userProfileSettingsEntry = await UserProfileDetailsService.profileSettingsExist(
          [userId]
        )

        let insertUpdateUserProfileSettingsDetails = ''

        // Insert or update the profile settings details records.
        let commonFlag = flag
          ? sails.config.custom.commonStatus.active
          : sails.config.custom.commonStatus.inactive
        let successMsg = flag ? 'msgDataActivated' : 'msgDataInactivated'
        let errorFlag = flag
          ? 'msgDataActivatedError'
          : 'msgDataInactivatedError'
        if (userProfileSettingsEntry.rowCount > 0) {
          insertUpdateUserProfileSettingsDetails = await UserProfileDetailsService.updateNewsletter(
            [userId, commonFlag, CustomService.currentDate()]
          )
        } else {
          insertUpdateUserProfileSettingsDetails = await UserProfileDetailsService.insertUserProfileSettings(
            [
              userId,
              null,
              null,
              commonFlag,
              null,
              CustomService.currentDate(),
              CustomService.currentDate()
            ]
          )
        }

        if (insertUpdateUserProfileSettingsDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__(successMsg, 'Newsletter Flag')
        } else {
          response.msg = sails.__(errorFlag)
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
