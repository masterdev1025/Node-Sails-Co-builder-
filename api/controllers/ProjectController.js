/**
 * ProjectController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get all project category list method.
   * @date 18 Oct 2019
   */
  list: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {

      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const userId = fetchUserDetails.userId

        const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.projectDefaultConfig.page
        const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.projectDefaultConfig.limit
        const search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        // const status = req.body.status !== undefined && req.body.status ? req.body.status : ['created']
        const status = 'created'
        const field = req.body.field !== undefined && req.body.field ? req.body.field : 'in_project_id'
        const sorttype = req.body.sorttype !== undefined && req.body.sorttype ? req.body.sorttype : 'desc'
        const filterSubcategoryIds = req.body.filterSubcategoryIds !== undefined && req.body.filterSubcategoryIds ? req.body.filterSubcategoryIds : 'desc'
        const filterSkillIds = req.body.filterSkillIds !== undefined && req.body.filterSkillIds ? req.body.filterSkillIds : 'desc'
        const filterLocations = req.body.filterLocations !== undefined && req.body.filterLocations ? req.body.filterLocations : 'desc'
        const filterPrice = req.body.filterPrice !== undefined && req.body.filterPrice ? req.body.filterPrice : 'desc'

        const listParam = {
          page: page,
          limit: limit,
          search: search,
          status: status,
          field: field,
          sorttype: sorttype,
          userId: userId,
          filter: {
            subCategoryIds: filterSubcategoryIds,
            skillIds: filterSkillIds,
            locations: filterLocations,
            price: filterPrice,
          }
        }

        const getDetails = await ProjectService.list(listParam)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          const allRecords = getDetails.rows.map(project => {
            project.projectId = CustomService.encrypt(project.in_project_id)
            project.userId = CustomService.encrypt(project.in_user_id)
            delete project.in_project_id
            delete project.in_user_id
            return project
          })
          response.msg = sails.__('msgRecordsFound', 'Project')
          response.data = {
            items: allRecords,
            projectDuration: sails.config.custom.projectDuration,
            total: getDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'projects')
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
   * @description Get filter details list method.
   * @date 13 Oct 2019
   */
  filterDetails: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const userId = fetchUserDetails.userId

        let getCategoriesDetails = await ProjectService.myCategories([userId])
        let getSkillsDetails = await ProjectService.mySkills([userId])
        let getLocationDetails = await ProjectService.locationDetails([[sails.config.custom.projectStatus.cancel, sails.config.custom.projectStatus.autocancel]])

        response.status = 'success'
        response.msg = sails.__('msgNoRecordsFound', 'Filter details')
        response.data = {
          'categoriesDetails': getCategoriesDetails.rows,
          'skillsDetails': getSkillsDetails.rows,
          'locationDetails': getLocationDetails.rows,
          'priceDetails': sails.config.custom.priceDetails
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
   * @description Get all project category list method.
   * @date 18 Oct 2019
   */
  projectDetails: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const encProjectId = req.body.projectId
        const projectId = CustomService.decrypt(encProjectId)
        if (projectId !== undefined && projectId !== '') {
          const userId = fetchUserDetails.userId
          const listParam = {
            userId: userId,
            projectId: projectId
          }
          const getDetails = await ProjectService.projectDetails(listParam)
          let queryData = [projectId, 'paid', userId]
          const userDonation = await PaymentService.getUserDonationDetails(queryData)
          let totalQuery = [projectId, 'paid']
          const totalDonation = await PaymentService.getTotalDonationDetails(totalQuery)
          response.status = 'success'
          if (getDetails.rowCount > 0) {

            const projectDetail = getDetails.rows.map(project => {
              project.projectId = CustomService.encrypt(project.in_project_id)
              project.userId = CustomService.encrypt(project.in_user_id)
              project.isMyProject = (project.in_user_id === userId) ? true : false
              project.isProjectCreated = (project.st_status === 'created') ? true : false
              project.isProjectAwarded = (project.st_status === 'awarded') ? true : false
              project.isProjectInProgress = (project.st_status === 'inProgress') ? true : false
              project.isProjectUnderReview = (project.st_status === 'review') ? true : false
              project.isProjectCompleted = (project.st_status === 'complete' || project.st_status === 'autocomplete') ? true : false
              project.isProjectCancelled = (project.st_status === 'cancel' || project.st_status === 'autocancel') ? true : false
              project.showAskQuestion = (project.in_user_id === userId) ? true : false
              delete project.in_project_id
              delete project.in_user_id
              return project
            })

            response.msg = sails.__('msgRecordsFound', 'Project')

            // Project Duration
            const fetchProjectDuration = sails.config.custom.projectDuration

            // Get Project Reasons
            let listParam = [sails.config.custom.reasonFor.project, sails.config.custom.commonStatus.active]
            const getProjectReasons = await ReasonService.list(listParam)

            // Get Project Invitation Reasons
            let listProjectInvitationParam = [sails.config.custom.reasonFor.projectInvitation, sails.config.custom.commonStatus.active]
            const getProjectInvitationReasons = await ReasonService.list(listProjectInvitationParam)

            // Get Proposal Withdrawal Reasons
            let listWithdrawParam = [sails.config.custom.reasonFor.withdrawal, sails.config.custom.commonStatus.active]
            const getProposalWithdrawReasons = await ReasonService.list(listWithdrawParam)

            const getProjectProposalDetails = await ProjectProposalService.fetchProjectProposal([projectId, userId])

            const getDoersProjectRequestDetails = await DoersProjectRequestDetailsService.fetchDoersProjectRequestDetails([projectId, userId])

            const projectProposalDetails = getProjectProposalDetails.rows.map(project => {
              project.projectId = CustomService.encrypt(project.in_project_id)
              project.userId = CustomService.encrypt(project.in_user_id)
              return project
            })

            const projectMilestoneDetails = await ProjectMilestoneDetailsService.fetchProjectMilestoneDetails([
              projectId,
              userId,
              'milestone'
            ])

            // Profile complete status starts
            let defaultProfilePercentage = sails.config.custom.defaultProfileComplete

            let fieldProfilePercentage = 0
            if (fetchUserDetails.userId !== undefined) {
              const userProfileDetails = await UserService.getUserDetailById([fetchUserDetails.userId])

              let profilePicture = userProfileDetails.rows[0].st_profile_picture ? 1 : 0
              let dob = userProfileDetails.rows[0].dt_dob ? 1 : 0
              let address = userProfileDetails.rows[0].st_address ? 1 : 0
              let countryId = userProfileDetails.rows[0].in_country_id ? 1 : 0
              let stateId = userProfileDetails.rows[0].in_state_id ? 1 : 0
              let cityId = userProfileDetails.rows[0].in_city_id ? 1 : 0
              let pinCode = userProfileDetails.rows[0].st_pincode ? 1 : 0
              let timezone = userProfileDetails.rows[0].st_timezone ? 1 : 0
              let emailVerified = userProfileDetails.rows[0].st_status === sails.config.custom.accountStatus.active ? 1 : 0
              // let phoneVerified = userProfileDetails.rows[0].st_phone_verified === sails.config.custom.accountStatus.active ? 1 : 0
              let phoneVerified = 0

              let totalFieldCount = profilePicture + dob + address + countryId + stateId + cityId + pinCode + timezone + emailVerified + phoneVerified

              let perField = sails.config.custom.totalFieldProfileComplete / sails.config.custom.totalFields

              fieldProfilePercentage = perField * totalFieldCount
            }
            // Profile complete status ends


            response.data = {
              'projectDetails': projectDetail[0],
              'projectDuration': fetchProjectDuration,
              'projectReasons': getProjectReasons.rows,
              'projectInvitationReasons': getProjectInvitationReasons.rows,
              'proposalWithdrawReasons': getProposalWithdrawReasons.rows,
              'doersProposalRequestDetails': getDoersProjectRequestDetails.rows,
              'projectProposalDetails': projectProposalDetails,
              'projectMilestoneDetails': projectMilestoneDetails.rows,
              'profileCompletionPercentage': parseInt(defaultProfilePercentage + fieldProfilePercentage),
              'actualUserId': CustomService.encrypt(userId),
              'userDonation': userDonation.rows[0],
              'totalDonation': totalDonation.rows[0]
            }
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'project')
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'project')
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
   * @date 05 Oct 2019
   */
  fetchProjectRelatedData: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      const fetchCategoryDetails = await CategoryService.fetchActiveCategoryList([sails.config.custom.accountStatus.active])
      const fetchSkillDetails = await SkillService.fetchActiveSkillList([sails.config.custom.accountStatus.active])
      const fetchCountryDetails = await UserService.getAllCountries()

      // Project Duration
      const fetchProjectDuration = sails.config.custom.projectDuration

      // 1 = req, 2 = True(All givers), 3 = Skills Id
      const fetchDoersSkillWiseList = await UserService.fetchDoersSkillWiseList(req, true, [])
      // 1 = req, 2 = True(All givers), 3 = Skills Id
      const fetchGiversSkillWiseList = await UserService.fetchGiversSkillWiseList(req, true, [])

      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      let defaultProfilePercentage = sails.config.custom.defaultProfileComplete

      let fieldProfilePercentage = 0
      if (fetchUserDetails.userId !== undefined) {
        const userProfileDetails = await UserService.getUserDetailById([fetchUserDetails.userId])

        let profilePicture = userProfileDetails.rows[0].st_profile_picture ? 1 : 0
        let dob = userProfileDetails.rows[0].dt_dob ? 1 : 0
        let address = userProfileDetails.rows[0].st_address ? 1 : 0
        let countryId = userProfileDetails.rows[0].in_country_id ? 1 : 0
        let stateId = userProfileDetails.rows[0].in_state_id ? 1 : 0
        let cityId = userProfileDetails.rows[0].in_city_id ? 1 : 0
        let pinCode = userProfileDetails.rows[0].st_pincode ? 1 : 0
        let timezone = userProfileDetails.rows[0].st_timezone ? 1 : 0
        let emailVerified = userProfileDetails.rows[0].st_status === sails.config.custom.accountStatus.active ? 1 : 0
        // let phoneVerified = userProfileDetails.rows[0].st_phone_verified === sails.config.custom.accountStatus.active ? 1 : 0
        let phoneVerified = 0

        let totalFieldCount = profilePicture + dob + address + countryId + stateId + cityId + pinCode + timezone + emailVerified + phoneVerified

        let perField = sails.config.custom.totalFieldProfileComplete / sails.config.custom.totalFields

        fieldProfilePercentage = perField * totalFieldCount
      }

      response.status = 'success'
      response.msg = ''
      response.data = {
        'categories': fetchCategoryDetails.rows,
        'skills': fetchSkillDetails.rows,
        'countries': fetchCountryDetails.rows,
        'projectDuration': fetchProjectDuration,
        'doersListing': fetchDoersSkillWiseList,
        'giversListing': fetchGiversSkillWiseList,
        'profileCompletionPercentage': parseInt(defaultProfilePercentage + fieldProfilePercentage)
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
   * @description Fetch active subcategory project method.
   * @date 05 Oct 2019
   */
  fetchActiveSubcategoryList: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      response.status = 'success'
      response.msg = ''
      let subCategories = {
        'subcategories': []
      }
      if (req.body.projectCategoryId !== undefined && req.body.projectCategoryId !== '') {
        const fetchSubcategoryDetails = await SubcategoryService.fetchActiveSubcategoryList([sails.config.custom.accountStatus.active, req.body.projectCategoryId])
        subCategories = {
          'subcategories': fetchSubcategoryDetails.rows
        }
      }
      response.data = subCategories
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      return res.json(response)
    }
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add project method.
   * @date 05 Oct 2019
   */
  addProject: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {

      // console.log('/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/api/controllers/ProjectController.js Line(165)')
      // console.log(req.body.projectName)
      // console.log(req.body.projectDescription)
      // console.log(req.body.projectCategoryId)
      // console.log(req.body.projectSubcategoryId)
      // console.log(req.body.projectSkillList)
      // console.log(req.body.projectMoneyInvolved)
      // console.log(req.body.projectGiversNeeded)
      // console.log(req.body.projectDoersNeeded)
      // console.log(req.body.projectDuration)
      // console.log(req.body.projectPeopleStrength)
      // console.log(req.body.projectPhysicalSite)
      // console.log(req.body.projectIsActivity)
      // console.log(req.body.projectTermsConditions)

      if (req.body.projectName !== undefined && req.body.projectDescription !== undefined && req.body.projectCategoryId !== undefined && req.body.projectSubcategoryId !== undefined && req.body.projectSkillList !== undefined && req.body.projectMoneyInvolved !== undefined && req.body.projectGiversNeeded !== undefined && req.body.projectDoersNeeded !== undefined && req.body.projectDuration !== undefined && req.body.projectPeopleStrength !== undefined && req.body.projectPhysicalSite !== undefined && req.body.projectIsActivity !== undefined && req.body.projectTermsConditions !== undefined) {
        const projectName = req.body.projectName
        const projectDescription = req.body.projectDescription
        const projectCategoryId = req.body.projectCategoryId
        const projectSubcategoryId = req.body.projectSubcategoryId
        const projectSkillList = req.body.projectSkillList
        const projectMoneyInvolved = req.body.projectMoneyInvolved
        const projectGiversNeeded = req.body.projectGiversNeeded
        const projectDoersNeeded = req.body.projectDoersNeeded
        const projectDuration = req.body.projectDuration
        const projectPeopleStrength = req.body.projectPeopleStrength
        const projectPhysicalSite = req.body.projectPhysicalSite
        const projectIsActivity = req.body.projectIsActivity
        const projectDocuments = req.body.projectDocuments
        const projectVideos = req.body.projectVideos
        const projectTermsConditions = req.body.projectTermsConditions

        const postArr = {
          'projectName': projectName,
          'projectDescription': projectDescription,
          'projectCategoryId': projectCategoryId,
          'projectSubcategoryId': projectSubcategoryId,
          'projectSkillList': projectSkillList,
          'projectMoneyInvolved': projectMoneyInvolved,
          'projectGiversNeeded': projectGiversNeeded,
          'projectDoersNeeded': projectDoersNeeded,
          'projectDuration': projectDuration,
          'projectPeopleStrength': projectPeopleStrength,
          'projectPhysicalSite': projectPhysicalSite,
          'projectIsActivity': projectIsActivity,
          'projectTermsConditions': projectTermsConditions
        }

        const validate = await CustomService.postProjectValidation(postArr)

        if (validate.status) {
          let errorMessage = []

          // If MoneyInvolved true then projectMoneyNeed Compulsory.
          // projectMoneyInvolved = (req.body.projectMoneyInvolved) ? req.body.projectMoneyNeed : ''
          if (projectMoneyInvolved) {
            if (req.body.projectMoneyNeed !== undefined) {
              const postProjectMoneyNeedArr = {
                'projectMoneyNeed': req.body.projectMoneyNeed
              }

              // Custom validation.
              const projectMoneyNeedValidation = await CustomService.postProjectMoneyNeedValidation(postProjectMoneyNeedArr)

              if (!projectMoneyNeedValidation.status) {
                errorMessage.push(projectMoneyNeedValidation.error)
              }
            } else {
              errorMessage.push(sails.__('msgRequiredParamMissing'))
            }
          }

          // If projectGiversNeeded true then projectGiversList Compulsory.
          // projectGiversList = (req.body.projectGiversNeeded) ? req.body.projectGiversList : ''
          if (projectGiversNeeded) {
            if (req.body.projectGiversList !== undefined) {
              const postProjectGiversListArr = {
                'projectGiversList': req.body.projectGiversList
              }

              // Custom validation.
              const projectGiversListValidation = await CustomService.postProjectGiversListValidation(postProjectGiversListArr)

              if (!projectGiversListValidation.status) {
                errorMessage.push(projectGiversListValidation.error)
              }
            } else {
              errorMessage.push(sails.__('msgRequiredParamMissing'))
            }
          }

          // If projectDoersNeeded true then projectDoersList Compulsory.
          // projectDoersList = (req.body.projectDoersNeeded) ? req.body.projectDoersList : ''
          if (projectDoersNeeded) {
            if (req.body.projectDoersList !== undefined) {
              const postProjectDoersListArr = {
                'projectDoersList': req.body.projectDoersList
              }

              // Custom validation.
              const projectDoersListValidation = await CustomService.postProjectDoersListValidation(postProjectDoersListArr)

              if (!projectDoersListValidation.status) {
                errorMessage.push(projectDoersListValidation.error)
              }
            } else {
              errorMessage.push(sails.__('msgRequiredParamMissing'))
            }
          }

          // If physical site is true then below fields are mandatory.
          // req.body.projectAddress
          // req.body.projectCountryId
          // req.body.projectStateId
          // req.body.projectCityeId
          // req.body.projectPincode
          if (projectPhysicalSite) {
            if (req.body.projectAddress !== undefined && req.body.projectCountryId !== undefined && req.body.projectStateId !== undefined && req.body.projectCityeId !== undefined && req.body.projectPincode !== undefined) {
              const postProjectAddressArr = {
                'projectAddress': req.body.projectAddress,
                'projectCountryId': req.body.projectCountryId,
                'projectStateId': req.body.projectStateId,
                'projectCityeId': req.body.projectCityeId,
                'projectPincode': req.body.projectPincode
              }

              const projectAddressValidation = await CustomService.postProjectAddressValidation(postProjectAddressArr)

              if (!projectAddressValidation.status) {
                errorMessage.push(projectAddressValidation.error)
              }
            } else {
              errorMessage.push(sails.__('msgRequiredParamMissing'))
            }
          }

          // If is activity is true then below fields are mandatory.
          // req.body.projectEventStartAt
          // req.body.projectEventEndAt
          if (projectIsActivity) {
            if (req.body.projectEventStartAt !== undefined && req.body.projectEventEndAt !== undefined) {
              const postProjectEventArr = {
                'projectEventStartAt': req.body.projectEventStartAt,
                'projectEventEndAt': req.body.projectEventEndAt
              }

              if (req.body.projectEventStartAt <= req.body.projectEventEndAt) {
                const projectEventValidation = await CustomService.postProjectEventValidation(postProjectEventArr)

                if (!projectEventValidation.status) {
                  errorMessage.push(projectEventValidation.error)
                }
              }
              else {
                errorMessage.push(sails.__('msgFieldGreaterThan', 'Event End Date', 'Event Start Date'))
              }
            } else {
              errorMessage.push(sails.__('msgRequiredParamMissing'))
            }
          }

          if (errorMessage.length === 0) {
            // Make a slug from project name.
            let projectSlug = CustomService.convertToSlug(req.body.projectName)

            // Fetch user id and basic details from authenticateion token.
            let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

            if (fetchUserDetails.userId !== undefined) {
              const userId = fetchUserDetails.userId
              const postProjectArr = [
                userId,
                projectName, // projectName
                projectSlug, // projectSlug
                projectDescription, // projectDescription
                projectCategoryId, // projectCategoryId
                projectSubcategoryId, // projectSubcategoryId
                JSON.stringify(projectDocuments), // projectDocument:
                JSON.stringify(projectVideos), // projectVideo:
                projectMoneyInvolved, // projectMoneyInvolved:
                (projectMoneyInvolved) ? req.body.projectMoneyNeed : 0, // total amount of money ($50) // projectMoneyNeed:
                projectDuration, // projectDuration:
                projectPeopleStrength, // projectPeopleStrength:
                projectPhysicalSite, // projectPhysicalSite:
                (projectPhysicalSite) ? req.body.projectAddress : null, // projectAddress:
                (projectPhysicalSite) ? req.body.projectCountryId : null, // projectCountryId:
                (projectPhysicalSite) ? req.body.projectStateId : null, // projectStateId:
                (projectPhysicalSite) ? req.body.projectCityeId : null, // projectCityeId:
                (projectPhysicalSite) ? req.body.projectPincode : null, // projectPincode:
                projectIsActivity, // projectIsActivity:
                (projectIsActivity) ? req.body.projectEventStartAt : null, // projectEventStartAt:
                (projectIsActivity) ? req.body.projectEventEndAt : null, // projectEventEndAt:
                projectGiversNeeded, // projectGiversNeeded:
                (projectGiversNeeded) ? ((req.body.projectLocalGivers) ? req.body.projectLocalGivers : null) : null, // projectLocalGivers:
                projectDoersNeeded, // projectDoersNeeded:
                'created',
                CustomService.currentDate(),
                CustomService.currentDate()
              ]

              const postProjectDetails = await ProjectService.addProject(postProjectArr)
              if (postProjectDetails.rowCount > 0) {
                const projectId = postProjectDetails.rows[0].in_project_id



                // Insert skills details.
                let projectSkillsDetails = []
                if (projectSkillList.length > 0) {
                  for (key in projectSkillList) {
                    const projectSkillsArr = [
                      projectId,
                      projectSkillList[key],
                      CustomService.currentDate()
                    ]

                    projectSkillsDetails.push(await ProjectSkillDetailsService.addProjectSkillDetails(projectSkillsArr))
                  }
                }

                // Insert project doers details.
                let projectDoersDetails = []
                let tmpNotifierListArr = []
                const projectDoersList = (projectDoersNeeded) ? req.body.projectDoersList : '' // projectDoersList:
                if (projectDoersList.length > 0) {
                  for (key in projectDoersList) {
                    const projectDoersArr = [
                      projectId,
                      projectDoersList[key],
                      CustomService.currentDate(),
                      CustomService.currentDate()
                    ]
                    tmpNotifierListArr.push(projectDoersList[key])
                    projectDoersDetails.push(await DoersProjectRequestDetailsService.addDoersProjectRequestDetails(projectDoersArr))
                  }
                }

                // Insert project givers details.
                let projectGiversDetails = []
                const projectGiversList = (projectGiversNeeded) ? req.body.projectGiversList : '' // projectGiversList:
                if (projectGiversList.length > 0) {
                  for (key in projectGiversList) {
                    const projectGiversArr = [
                      projectId,
                      projectGiversList[key],
                      false,
                      CustomService.currentDate(),
                      CustomService.currentDate()
                    ]
                    tmpNotifierListArr.push(projectGiversList[key])
                    projectGiversDetails.push(await GiversProjectRequestDetailsService.addGiversProjectRequestDetails(projectGiversArr))
                  }
                }

                //  ---------------- START OF NOTIFICATION ----------------

                //NOTE CONDITIONS -> send notification to other user base on category / subcategory / same country
                // Get loggedin user extra details
                let userDetails = await UserService.getUserDetailById([userId])
                let userCountryId = userDetails.rows[0].in_country_id
                //NOTE 1. get users list base on above condition

                const notifierUserDetails = await ProjectService.getPostProjectNotifierUserList(userId, projectCategoryId, projectSubcategoryId, userCountryId)

                if (notifierUserDetails.status === 'success') {
                  // merged doers / givers ids with conditions
                  let notifierListArr = [...notifierUserDetails.data.notifierUserList, ...tmpNotifierListArr]
                  // remove duplicate user id
                  let filteredNotifierListArr = notifierListArr.filter((item, pos) => {
                    return notifierListArr.indexOf(item) === pos
                  })

                  let encryptedProjectId = CustomService.encrypt(projectId)
                  let redirectUrl = '{ "name": "view", "params": { "id": "' + encryptedProjectId + '" } }'//encrypted id
                  let replaceObject = {
                    'user_name': userDetails.rows[0].st_first_name + ' ' + userDetails.rows[0].st_last_name,
                    'action_type': 'Created',
                    'post_description': projectName
                  }
                  //NOTE 2. call sendnotification function
                  let systemNotificationResponse = await NotificationService.sendSystemNotification(userId, filteredNotifierListArr, 'Project Created', redirectUrl, replaceObject)
                }


                //  ---------------- END OF NOTIFICATION ----------------

                // Move document file from temp directory to actual directory.
                if (projectDocuments.length > 0) {
                  const postProjectDocumentArr = {
                    'projectId': CustomService.encrypt(projectId),
                    'projectDocuments': projectDocuments,
                  }
                  let tempDoc = await CustomService.moveProjectDocuments(postProjectDocumentArr)

                  // console.log('/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/api/controllers/ProjectController.js Line(340)')
                  // console.log(tempDoc)
                }

                // Move video file from temp directory to actual directory.
                if (projectVideos.length > 0) {
                  const postProjectVideoArr = {
                    'projectId': CustomService.encrypt(projectId),
                    'projectVideos': projectVideos,
                  }
                  let tempVideo = await CustomService.moveProjectVideos(postProjectVideoArr)

                  // console.log('/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/api/controllers/ProjectController.js Line(351)')
                  // console.log(tempVideo)
                }

                response.status = 'success'
                response.msg = sails.__('msgDataPosted', 'Project')
              } else {
                response.msg = sails.__('msgDataPostedError')
              }
            } else {
              response.msg = sails.__('msgNoRecordsFound', 'users')
            }
          } else {
            response.msg = errorMessage[0]
          }
        } else {
          response.msg = validate.error
        }
      } else {
        response.msg = sails.__('msgRequiredParamMissing')
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
   * @description Upload multiple documents method.
   * @date 08 Oct 2019
   */
  uploadDocument: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      if (req.file('document') !== undefined && req.file('document')._files !== undefined && req.file('document')._files.length > 0) {
        let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

        if (fetchUserDetails.userId !== undefined) {
          // jpeg / png / extension
          // 200 x 200 size
          // 200kb length
          // let upload = req.file('profilePicture')._files[0].stream
          let upload = req.file('document')._files[0].stream
          let headers = upload.headers
          let byteCount = upload.byteCount
          let validated = true
          let errorMessages = []
          let fileParams = {}
          let settings = {
            allowedTypes: sails.config.custom.allowedDocumentFileTypes,
            maxBytes: sails.config.custom.allowedDocumentFileSize, // 2048000 => 2 MB
          }

          // Check file type
          // 'jpg', 'jpeg', 'gif', 'png', 'pdf', 'xlsx', 'xls', 'csv', 'docx', 'doc'
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
            // First upload the file
            req.file('document').upload(
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
                // let sizeOf = require('image-size')
                // let dimensions = sizeOf(files[0].fd)
                let fileName =
                  fileParams.fileName + '.' + fileParams.extension

                response.status = 'success'
                response.data = {
                  document: fileName
                }
                response.msg = sails.__('msgDataUpload', 'Document file')

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
   * @description Upload multiple videos method.
   * @date 08 Oct 2019
   */
  uploadVideo: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      if (req.file('video') !== undefined && req.file('video')._files !== undefined && req.file('video')._files.length > 0) {
        let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

        if (fetchUserDetails.userId !== undefined) {
          let upload = req.file('video')._files[0].stream
          let headers = upload.headers
          let byteCount = upload.byteCount
          let validated = true
          let errorMessages = []
          let fileParams = {}
          let settings = {
            allowedTypes: sails.config.custom.allowedVideoFileTypes,
            maxBytes: sails.config.custom.allowedVideoFileSize, // 10240000 => 10 MB
          }

          // Check file type
          // 'avi', 'mov, 'mp4', 'ogg', 'wmv, 'webm', 'mkv'
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
            // First upload the file
            req.file('video').upload(
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
                // let sizeOf = require('image-size')
                // let dimensions = sizeOf(files[0].fd)
                let fileName =
                  fileParams.fileName + '.' + fileParams.extension

                response.status = 'success'
                response.data = {
                  document: fileName
                }
                response.msg = sails.__('msgDataUpload', 'Document file')

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
   * @description Cancel project method.
   * @date 15 Nov 2019
   */
  cancelProject: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const userId = fetchUserDetails.userId

        const encProjectId = req.body.projectId
        const projectId = CustomService.decrypt(encProjectId)
        const reasonId = req.body.reasonId
        const reasonMessage = (req.body.reasonId === '7') ? req.body.reasonMessage : ''

        const updateProjectStatus = await ProjectService.updateProjectStatus([projectId, sails.config.custom.projectStatus.cancel, CustomService.currentDate()])

        if (updateProjectStatus.rowCount > 0) {
          const insertProjectCancelReasonDetails = await ProjectCancelReasonService.add([projectId, userId, null, reasonId, reasonMessage, CustomService.currentDate()])

          if (insertProjectCancelReasonDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = sails.__('msgDataCancelled', 'Project')
          } else {
            response.msg = sails.__('msgSomethingWentWrongField', 'insertion of reason log.')
          }
        } else {
          response.msg = sails.__('msgDataCancelledError')
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
   * @description Ask questions related to project method.
   * @date 16 Nov 2019
   */
  projectAskQuestions: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        // const userId = fetchUserDetails.userId

        const encProjectId = req.body.projectId
        const projectId = CustomService.decrypt(encProjectId)

        // let offset = (req.body.page - 1) * req.body.limit

        const listParam = [
          projectId,
          // req.body.limit,
          // offset,
        ]

        const getProjectAskQuestionDetails = await ProjectQuestionService.list(listParam)

        const questionDetails = getProjectAskQuestionDetails.rows.map(question => {
          question.userId = CustomService.encrypt(question.in_user_id)
          question.projectId = CustomService.encrypt(question.in_project_id)
          return question
        })

        if (getProjectAskQuestionDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__('msgRecordsFound', 'Ask questions')
          response.data = {
            'projectQuestions': questionDetails,
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'asked questions')
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
   * @description Insert ask questions related to project method.
   * @date 21 Nov 2019
   */
  askQuestion: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const userId = fetchUserDetails.userId

        const encProjectId = req.body.projectId
        const projectId = CustomService.decrypt(encProjectId)
        const parentId = req.body.parentId
        const message = req.body.message

        const insertQuestionDetails = await ProjectQuestionService.add([projectId, parentId, userId, message, sails.config.custom.accountStatus.active, CustomService.currentDate(), CustomService.currentDate()])

        if (insertQuestionDetails.rowCount > 0) {
          //  ---------------- NOTE START OF NOTIFICATION ----------------

          let projectDetails = await ProjectService.getProjectDetailById([projectId])
          let notifierUserId = Number(projectDetails.rows[0].in_user_id)
          let filteredNotifierListArr = [notifierUserId]
          let userId = fetchUserDetails.userId

          let encryptedProjectId = CustomService.encrypt(projectId)
          let redirectUrl = '{ "name": "view", "params": { "id": "' + encryptedProjectId + '" } }'//encrypted id
          let replaceObject = {
            'user_name': fetchUserDetails.firstName + ' ' + fetchUserDetails.lastName,
            'action_type': 'Asked question',
            'post_description': projectDetails.rows[0].st_project_name
          }

          // //NOTE 2. call sendnotification function
          let systemNotificationResponse = await NotificationService.sendSystemNotification(userId, filteredNotifierListArr, 'Project Asked Question', redirectUrl, replaceObject)


          //  ----------------NOTE END OF NOTIFICATION ----------------

          response.status = 'success'
          response.msg = sails.__('msgDataAsked', 'Question')
        } else {
          response.msg = sails.__('msgDataAskedError')
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
   * @description Update ask questions related to project method.
   * @date 21 Nov 2019
   */
  reply: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const userId = fetchUserDetails.userId

        const encProjectId = req.body.projectId
        const projectId = CustomService.decrypt(encProjectId)
        const parentId = req.body.parentId
        const message = req.body.message

        // Check parent question is exist or not.
        const isParentQuestionActive = await ProjectQuestionService.isParentQuestionActive([parentId, sails.config.custom.accountStatus.active])

        if (isParentQuestionActive.rowCount > 0) {
          const replyDetails = await ProjectQuestionService.add([projectId, parentId, userId, message, sails.config.custom.accountStatus.active, CustomService.currentDate(), CustomService.currentDate()])

          if (replyDetails.rowCount > 0) {

            //  ---------------- NOTE START OF NOTIFICATION ----------------

            let projectDetails = await ProjectService.getProjectDetailById([projectId])
            // let notifierUserId = Number(projectDetails.rows[0].in_user_id)
            let notifierUserId = Number(isParentQuestionActive.rows[0].in_user_id)
            let filteredNotifierListArr = [notifierUserId]
            let userId = fetchUserDetails.userId

            let encryptedProjectId = CustomService.encrypt(projectId)
            let redirectUrl = '{ "name": "view", "params": { "id": "' + encryptedProjectId + '" } }'//encrypted id
            let replaceObject = {
              'user_name': fetchUserDetails.firstName + ' ' + fetchUserDetails.lastName,
              'action_type': 'Reply to question',
              'post_description': projectDetails.rows[0].st_project_name
            }

            // //NOTE 2. call sendnotification function
            let systemNotificationResponse = await NotificationService.sendSystemNotification(userId, filteredNotifierListArr, 'Project Replied On Question', redirectUrl, replaceObject)

            //  ----------------NOTE END OF NOTIFICATION ----------------

            response.status = 'success'
            response.msg = sails.__('msgDataReplied')
          } else {
            response.msg = sails.__('msgDataRepliedError')
          }
        } else {
          response.status = 'success'
          response.msg = sails.__('msgDataCannotReply')
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
   * @description Update ask questions related to project method.
   * @date 21 Nov 2019
   */
  editMessage: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        // const userId = fetchUserDetails.userId

        const projectQuestionId = req.body.projectQuestionId
        const message = req.body.message

        const updateQuestionDetails = await ProjectQuestionService.edit([projectQuestionId, message, CustomService.currentDate()])

        if (updateQuestionDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__('msgDataUpdated', 'Question')
        } else {
          response.msg = sails.__('msgDataUpdatedError')
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
   * @description Delete ask questions related to project method.
   * @date 21 Nov 2019
   */
  deleteMessage: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        // const userId = fetchUserDetails.userId

        const projectQuestionId = req.body.projectQuestionId

        const updateQuestionDetails = await ProjectQuestionService.updateStatus([projectQuestionId, sails.config.custom.accountStatus.inactive, CustomService.currentDate()])

        if (updateQuestionDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__('msgDataDeleted', 'Message')
        } else {
          response.msg = sails.__('msgDataDeletedError')
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
   * @description Submit proposal method.
   * @date 23 Nov 2019
   */
  submitProposal: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const userId = fetchUserDetails.userId

        if (req.body.payType !== undefined && req.body.totalPrice !== undefined && req.body.serviceFee !== undefined && req.body.earnPrice !== undefined && req.body.projectDuration !== undefined && req.body.coverLetter !== undefined) {
          const encProjectId = req.body.projectId
          const projectId = CustomService.decrypt(encProjectId)
          const payType = req.body.payType
          const totalPrice = req.body.totalPrice
          const serviceFee = req.body.serviceFee
          const earnPrice = req.body.earnPrice
          const projectDuration = req.body.projectDuration
          const coverLetter = req.body.coverLetter
          const proposalType = req.body.proposalType

          const dataArr = [projectId, userId, payType, projectDuration, coverLetter, totalPrice, serviceFee, earnPrice, null, null, sails.config.custom.proposalStatus.active, proposalType, null, null, null, CustomService.currentDate(), CustomService.currentDate()]
          const submitProposalDetails = await ProjectProposalService.insertProjectProposal(dataArr)

          if (submitProposalDetails.rowCount > 0) {

            if (proposalType === sails.config.custom.proposalSubmitStatus.invitation) {
              const dataStatusArr = [projectId, userId, sails.config.custom.requestStatus.accept, CustomService.currentDate()]
              await DoersProjectRequestDetailsService.updateDoersProjectRequestStatus(dataStatusArr)
            }

            if (payType === sails.config.custom.projectPayType.milestone) {
              const projectProposalId = submitProposalDetails.rows[0].in_project_proposal_id
              const milestoneDetails = (req.body.payType === sails.config.custom.projectPayType.milestone) ? req.body.milestones : []

              // Insert skills details.
              let projectMilestoneDetails = []
              if (milestoneDetails.length > 0) {
                for (key in milestoneDetails) {
                  const projectMilestoneArr = [
                    projectProposalId,
                    milestoneDetails[key].milestonDescription,
                    milestoneDetails[key].dueDate,
                    milestoneDetails[key].milestonePrice,
                    sails.config.custom.accountStatus.active,
                    CustomService.currentDate(),
                    CustomService.currentDate()
                  ]

                  projectMilestoneDetails.push(await ProjectMilestoneDetailsService.insertProjectMilestoneDetails(projectMilestoneArr))
                }
              }
            }

            //  ---------------- NOTE START OF NOTIFICATION ----------------

            let projectDetails = await ProjectService.getProjectDetailById([projectId])
            // let notifierUserId = Number(projectDetails.rows[0].in_user_id)
            let notifierUserId = Number(projectDetails.rows[0].in_user_id)
            let filteredNotifierListArr = [notifierUserId]
            let userId = fetchUserDetails.userId

            let encryptedProjectId = CustomService.encrypt(projectId)
            let redirectUrl = '{ "name": "badgersReceivedProposals", "params": { "id": "' + encryptedProjectId + '" } }'//encrypted id
            let replaceObject = {
              'user_name': fetchUserDetails.firstName + ' ' + fetchUserDetails.lastName,
              'action_type': 'Submitted Proposal',
              'post_description': projectDetails.rows[0].st_project_name
            }
            console.log('ProjectController.js Line(1318)')
            console.log(replaceObject)
            console.log(userId)
            console.log(filteredNotifierListArr)

            // //NOTE 2. call sendnotification function
            let systemNotificationResponse = await NotificationService.sendSystemNotification(userId, filteredNotifierListArr, 'Project Proposal Submitted', redirectUrl, replaceObject)

            //  ----------------NOTE END OF NOTIFICATION ----------------

            response.status = 'success'
            response.msg = sails.__('msgDataSubmitted', 'Proposal')
          } else {
            response.msg = sails.__('msgDataSubmittedError')
          }
        } else {

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
   * @description Open project details count method.
   * @date 29 Nov 2019
   */
  openProject: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.projectId !== undefined && req.body.projectId !== null && req.body.clientDetails !== undefined) {
        const projectId = CustomService.decrypt(req.body.projectId)
        let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)
        let userId = fetchUserDetails.userId
        if (userId !== undefined) {
          let dataArr = [
            projectId,
            userId,
            req.body.clientDetails.browserName,
            req.body.clientDetails.browserVersion,
            req.body.clientDetails.clientOs,
            CustomService.userLogger(req)
          ]

          let checkDetails = await ProjectOpenDetailsService.checkProjectOpenDetails(dataArr)

          if (checkDetails.rowCount === 0) {
            let insertDetails = await ProjectOpenDetailsService.addProjectOpenDetails([
              projectId,
              userId,
              req.body.clientDetails.browserName,
              req.body.clientDetails.browserVersion,
              req.body.clientDetails.clientOs,
              CustomService.userLogger(req),
              CustomService.currentDate()
            ])

            if (insertDetails.rowCount > 0) {
              response.status = 'success'
              response.msg = sails.__('msgDataAddedToOpen', 'Project')
            } else {
              response.msg = sails.__('msgDataAddedToOpenError')
            }
          } else {
            response.msg = sails.__('msgNoRecordsFound', 'project opened')
          }
        }
      } else {
        response.msg = sails.__('msgRequiredParamMissing')
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      return res.json(response)
    }
  },
  /**
   * @author Abilash
   * @description Get Posted Projects method.
   * @date 28 Nov 2019
   */
  getPostedList: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const userId = fetchUserDetails.userId
        const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.projectDefaultConfig.page
        const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.projectDefaultConfig.limit
        const search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        const status = req.body.status !== undefined && req.body.status ? req.body.status : ''
        const field = req.body.field !== undefined && req.body.field ? req.body.field : 'in_project_id'
        const sorttype = req.body.sorttype !== undefined && req.body.sorttype ? req.body.sorttype : 'desc'

        const listParam = {
          page: page,
          limit: limit,
          search: search,
          status: status,
          field: field,
          sorttype: sorttype,
          userId: userId
        }

        let getDetails = await ProjectService.getBadgesPostedProjects(listParam)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          const allRecords = getDetails.rows.map(project => {
            project.projectId = CustomService.encrypt(project.in_project_id)
            return project
          })
          response.msg = sails.__('msgRecordsFound', 'Project')
          response.data = {
            projects: allRecords,
            count: getDetails.rowCount
          }
        } else {

          response.msg = sails.__('msgNoRecordsFound', 'Project')
        }

      }
    } catch (error) {
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      return res.json(response)
    }
  },
  getSubmittedProposals: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      let fetchUserDetails = await CustomService.fetchUserDetails(
        req, req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.projectDefaultConfig.page
        const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.projectDefaultConfig.limit
        const search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        const status = req.body.status !== undefined && req.body.status ? req.body.status : ''
        const field = req.body.field !== undefined && req.body.field ? req.body.field : 'in_project_id'
        const sorttype = req.body.sorttype !== undefined && req.body.sorttype ? req.body.sorttype : 'desc'

        const params = {
          page: page,
          limit: limit,
          search: search,
          status: status,
          field: field,
          sorttype: sorttype,
          userId: fetchUserDetails.userId
        }

        let getDetails = await ProjectService.getDoersSubmittedProposals(params)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          const allRecords = getDetails.rows.map(project => {
            project.projectId = CustomService.encrypt(project.in_project_id)
            return project
          })
          response.msg = sails.__('msgRecordsFound', 'Project')
          response.data = {
            items: allRecords,
            total: getDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'projects')
        }

      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      return res.json(response)
    }
  },
  getReceivedProposals: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      let fetchUserDetails = await CustomService.fetchUserDetails(
        req, req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const projectId = CustomService.decrypt(req.body.projectId)
        const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.projectDefaultConfig.page
        const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.projectDefaultConfig.limit
        const search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        const status = req.body.status !== undefined && req.body.status ? req.body.status : ''
        const field = req.body.field !== undefined && req.body.field ? req.body.field : 'in_project_id'
        const sorttype = req.body.sorttype !== undefined && req.body.sorttype ? req.body.sorttype : 'desc'

        const params = {
          page: page,
          limit: limit,
          search: search,
          status: status,
          field: field,
          sorttype: sorttype,
          projectId: projectId,
          userId: fetchUserDetails.userId
        }

        let projectDetails = await ProjectService.getProjectDetailById([projectId])
        let getDetails = await ProjectService.getProjectWiseReceivedProposals(params)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          const allRecords = getDetails.rows.map(project => {
            project.in_project_id = CustomService.encrypt(project.in_project_id)
            project.in_project_proposal_id = CustomService.encrypt(project.in_project_proposal_id)
            project.in_user_id = CustomService.encrypt(project.in_user_id)
            return project
          })
          response.msg = sails.__('msgRecordsFound', 'Project')
          response.data = {
            items: allRecords,
            count: getDetails.rowCount,
            projectName: projectDetails.rows[0].st_project_name,
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'projects')
          response.data = {
            items: [],
            count: 0,
            projectName: projectDetails.rows[0].st_project_name
          }
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
   * @description Update project milestone details method.
   * @date 3rd Feb 2020
   */
  projectMilestoneDetails: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.projectPropsalId !== undefined) {
        // Fetch user id and basic details from authentication token.
        const fetchUserDetails = await CustomService.fetchUserDetails(
          req,
          req.body.response
        )

        if (fetchUserDetails.userId !== undefined) {
          // const userId = fetchUserDetails.userId
          const milestoneDetails = await ProjectMilestoneDetailsService.fetchAllMilestoneDetails([req.body.projectPropsalId, sails.config.custom.accountStatus.active])

          if (milestoneDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = sails.__('msgDataFetched', 'Milestone details')
            response.data = milestoneDetails.rows
          } else {
            response.msg = sails.__('msgDataFetchedError')
          }
        } else {
          response.msg = sails.__('msgSomethingWentWrong')
        }
      } else {
        response.msg = sails.__('msgRequiredParamMissing')
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
 * @description Update receive proposal status method.
 * @date 31st Jan 2020
 */
  updateRecievedProposalStatus: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.projectPropsalId !== undefined && req.body.status !== undefined) {
        // Fetch user id and basic details from authentication token.
        const fetchUserDetails = await CustomService.fetchUserDetails(
          req,
          req.body.response
        )

        if (fetchUserDetails.userId !== undefined) {
          // const userId = fetchUserDetails.userId
          const updateProposalDetails = await ProjectProposalService.updateProjectProposalStatus([req.body.projectPropsalId, req.body.status, CustomService.currentDate()])

          if (updateProposalDetails.rowCount > 0) {
            response.status = 'success'
            response.msg = sails.__('msgDataUpdated', 'Proposal status')
          } else {
            response.msg = sails.__('msgDataUpdatedError')
          }
        } else {
          response.msg = sails.__('msgSomethingWentWrong')
        }
      } else {
        response.msg = sails.__('msgRequiredParamMissing')
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
 * @description Donation Details method.
 * @date 13th Jan 2019
 */
  getDonationDetails: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      let fetchUserDetails = await CustomService.fetchUserDetails(
        req, req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const projectId = CustomService.decrypt(req.body.projectId)
        const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.projectDefaultConfig.page
        const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.projectDefaultConfig.limit
        const search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        const status = req.body.status !== undefined && req.body.status ? req.body.status : ''
        const field = req.body.field !== undefined && req.body.field ? req.body.field : 'in_project_id'
        const sorttype = req.body.sorttype !== undefined && req.body.sorttype ? req.body.sorttype : 'desc'

        const params = {
          page: page,
          limit: limit,
          search: search,
          status: status,
          field: field,
          sorttype: sorttype,
          projectId: projectId,
          userId: fetchUserDetails.userId
        }

        let projectDetails = await ProjectService.getProjectDetailById([projectId])
        let getDetails = await ProjectService.getProjectWiseDonationDetails(params)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          const allRecords = getDetails.rows.map(project => {
            project.projectId = CustomService.encrypt(project.in_project_id)
            return project
          })
          response.msg = sails.__('msgRecordsFound', 'Project')
          response.data = {
            items: allRecords,
            count: getDetails.rowCount,
            projectName: projectDetails.rows[0].st_project_name
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'projects')
          response.data = {
            items: [],
            count: 0,
            projectName: projectDetails.rows[0].st_project_name
          }
        }
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      return res.json(response)
    }
  },
  getDoersInvitations: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      let fetchUserDetails = await CustomService.fetchUserDetails(
        req, req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.projectDefaultConfig.page
        const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.projectDefaultConfig.limit
        const search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        const status = req.body.status !== undefined && req.body.status ? req.body.status : ''
        const requestStatus = req.body.requestStatus !== undefined && req.body.requestStatus ? req.body.requestStatus : ''
        const field = req.body.field !== undefined && req.body.field ? req.body.field : 'in_project_id'
        const sorttype = req.body.sorttype !== undefined && req.body.sorttype ? req.body.sorttype : 'desc'

        const params = {
          page: page,
          limit: limit,
          search: search,
          status: status,
          requestStatus: requestStatus,
          field: field,
          sorttype: sorttype,
          userId: fetchUserDetails.userId
        }

        let getDetails = await ProjectService.getDoersInvitation(params)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          const allRecords = getDetails.rows.map(project => {
            project.projectId = CustomService.encrypt(project.in_project_id)
            return project
          })
          response.msg = sails.__('msgRecordsFound', 'Project')
          response.data = {
            items: allRecords,
            total: getDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'projects')
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
 * @description Donations invitation method.
 * @date 20th Dec 2019
 */
  getDonationInvitations: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      let fetchUserDetails = await CustomService.fetchUserDetails(
        req, req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.projectDefaultConfig.page
        const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.projectDefaultConfig.limit
        const search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        const status = req.body.status !== undefined && req.body.status ? req.body.status : ''
        const field = req.body.field !== undefined && req.body.field ? req.body.field : 'in_project_id'
        const sorttype = req.body.sorttype !== undefined && req.body.sorttype ? req.body.sorttype : 'desc'

        const params = {
          page: page,
          limit: limit,
          search: search,
          status: status,
          field: field,
          sorttype: sorttype,
          userId: fetchUserDetails.userId
        }

        let getDetails = await ProjectService.getDonationInvitation(params)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          const allRecords = getDetails.rows.map(project => {
            project.projectId = CustomService.encrypt(project.in_project_id)
            return project
          })
          response.msg = sails.__('msgRecordsFound', 'Project')
          response.data = {
            items: allRecords,
            total: getDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'projects')
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
 * @description Invested proposals method.
 * @date 20th Dec 2019
 */
  getInvestedProposals: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      let fetchUserDetails = await CustomService.fetchUserDetails(
        req, req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.projectDefaultConfig.page
        const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.projectDefaultConfig.limit
        const search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        const status = req.body.status !== undefined && req.body.status ? req.body.status : ''
        const field = req.body.field !== undefined && req.body.field ? req.body.field : 'in_project_id'
        const sorttype = req.body.sorttype !== undefined && req.body.sorttype ? req.body.sorttype : 'desc'

        const params = {
          page: page,
          limit: limit,
          search: search,
          status: status,
          field: field,
          sorttype: sorttype,
          userId: fetchUserDetails.userId
        }

        let getDetails = await ProjectService.getInvestedProposals(params)

        response.status = 'success'
        if (getDetails.rowCount > 0) {
          const allRecords = getDetails.rows.map(project => {
            project.projectId = CustomService.encrypt(project.in_project_id)
            project.userId = CustomService.encrypt(project.in_user_id)
            return project
          })
          response.msg = sails.__('msgRecordsFound', 'Invested Proposals')
          response.data = {
            items: allRecords,
            total: getDetails.rowCount
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'projects')
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
 * @description Invested proposals details method.
 * @date 21th Dec 2019
 */
  getInvestedProposalDetails: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      let fetchUserDetails = await CustomService.fetchUserDetails(
        req, req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const dataArr = [req.body.in_invested_proposal_id]

        let getDetails = await ProjectService.getInvestedProposalDetails(dataArr)

        if (getDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__('msgRecordsFound', 'Invested proposal details')
          response.data = {
            items: getDetails.rows[0],
          }
        } else {
          response.msg = sails.__('msgNoRecordsFound', 'invested proposal details')
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
 * @description Withdraw project proposal method.
 * @date 14th Dec 2019
 */
  withdrawProposal: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const userId = fetchUserDetails.userId

        if (req.body.projectProposalId !== undefined && req.body.reasonId !== undefined && req.body.reasonMessage !== undefined) {
          const projectProposalId = req.body.projectProposalId
          const reasonId = req.body.reasonId
          const reasonMessage = (req.body.reasonId === '13') ? req.body.reasonMessage : ''

          let validationFields = [
            {
              field: projectProposalId,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Project Proposal')
              }
            },
            {
              field: reasonId,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Reason Selection')
              }
            }
          ]

          // Custom validation.
          var validate = await ValidationService.validate(validationFields)

          if (validate.status) {
            const updateProposalWithdrawalStatus = await ProjectProposalService.updateProjectProposal([projectProposalId, userId, sails.config.custom.proposalStatus.archive, sails.config.custom.jobStatus.withdrawn, reasonId, reasonMessage, CustomService.currentDate()])

            if (updateProposalWithdrawalStatus.rowCount > 0) {
              response.status = 'success'
              response.msg = sails.__('msgDataWithdraw', 'Project proposal')
            } else {
              response.msg = sails.__('msgDataWithdrawError')
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
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      return res.json(response)
    }
  },
  /**
 * @author Khushang M. Bhavnagarwala
 * @description Reject invitation method.
 * @date 17th Dec 2019
 */
  rejectInvitation: async function (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const userId = fetchUserDetails.userId

        if (req.body.projectInvitatonId !== undefined && req.body.reasonId !== undefined && req.body.reasonMessage !== undefined) {
          const projectInvitatonId = req.body.projectInvitatonId
          const reasonId = req.body.reasonId
          const reasonMessage = (req.body.reasonId === '19') ? req.body.reasonMessage : ''

          let validationFields = [
            {
              field: projectInvitatonId,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Reject Invitation ID')
              }
            },
            {
              field: reasonId,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Reason Selection')
              }
            }
          ]

          // Custom validation.
          var validate = await ValidationService.validate(validationFields)

          if (validate.status) {
            const updateRejectInvitationStatus = await DoersProjectRequestDetailsService.updateDoersProjectRequestDetails([projectInvitatonId, userId, sails.config.custom.proposalStatus.archive, sails.config.custom.requestStatus.reject, reasonId, reasonMessage, CustomService.currentDate()])

            if (updateRejectInvitationStatus.rowCount > 0) {
              response.status = 'success'
              response.msg = sails.__('msgDataInvitationReject', 'Project invitation')
            } else {
              response.msg = sails.__('msgDataInvitationRejectError')
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
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      return res.json(response)
    }
  },
  async sendOffer (req, res) {
    const response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    await sails.sendNativeQuery('BEGIN TRANSACTION;')

    try {
      // Fetch user id and basic details from authentication token.
      const fetchUserDetails = await CustomService.fetchUserDetails(
        req,
        req.body.response
      )

      if (fetchUserDetails.userId !== undefined) {
        const userId = fetchUserDetails.userId

        if (req.body.projectId !== undefined && req.body.projectId && req.body.projectProposalId !== undefined && req.body.projectProposalId && req.body.userId !== undefined && req.body.userId && req.body.payType !== undefined && req.body.totalPrice !== undefined && req.body.serviceFee !== undefined && req.body.earnPrice !== undefined) {

          let projectId = CustomService.decrypt(req.body.projectId)
          let projectProposalId = CustomService.decrypt(req.body.projectProposalId)
          let userId = CustomService.decrypt(req.body.userId)
          let payType = req.body.payType
          let totalPrice = req.body.totalPrice
          let serviceFee = req.body.serviceFee
          let earnPrice = req.body.earnPrice

          let validationFields = [
            {
              field: payType,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Payment type')
              }
            },
            {
              field: totalPrice,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Total Price'),
                isDecimal: sails.__('msgFieldDecimal', 'Total Price'),
                'minLength:4': sails.__('msgFieldMinLength', '4', 'total price'),
                'maxLength:250': sails.__('msgFieldMaxLength', '250', 'total price')
              }
            },
            {
              field: serviceFee,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Service Fee'),
                isDecimal: sails.__('msgFieldDecimal', 'Service Fee'),
                'minLength:4': sails.__('msgFieldMinLength', '4', 'service fee'),
                'maxLength:250': sails.__('msgFieldMaxLength', '250', 'service fee')
              }
            },
            {
              field: earnPrice,
              rules: {
                isInputRequired: sails.__('msgFieldIsRequired', 'Earn Price'),
                isDecimal: sails.__('msgFieldDecimal', 'Earn Price'),
                'minLength:4': sails.__('msgFieldMinLength', '4', 'earn price'),
                'maxLength:250': sails.__('msgFieldMaxLength', '250', 'earn price')
              }
            }
          ]

          // Custom validation.
          var validate = await ValidationService.validate(validationFields)

          if (validate.status) {
            let updateProjectStatus = ''; let updateProjectProposalStatus = ''
            if (req.body.defaultPayType === sails.config.custom.projectPayType.project && req.body.payType === sails.config.custom.projectPayType.project) {
              updateProjectStatus = await ProjectService.updateProjectStatus([projectId, sails.config.custom.projectStatus.inProgress, CustomService.currentDate()])

              // Update tbl_project_proposal fields(st_status => inProgress, total price, fee, earn price and updated_date)
              updateProjectProposalStatus = await ProjectProposalService.updateProjectProposalStatus([projectProposalId, sails.config.custom.proposalStatus.inProgress, CustomService.currentDate()])
            }

            if (updateProjectStatus.rowCount > 0 && updateProjectProposalStatus.rowCount > 0) {
              response.status = 'success'
              response.msg = sails.__('msgDataSend', 'Offer')
            } else {
              response.msg = sails.__('msgDataSendError')
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
      response.msg = await CustomService.errorHandler(process.env.NODE_ENV, error)
    } finally {
      if (response.status === 'success') {
        await sails.sendNativeQuery('COMMIT;')
      } else {
        await sails.sendNativeQuery('ROLLBACK;')
      }
      return res.json(response)
    }
  }
}
