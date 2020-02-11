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
      const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.projectDefaultConfig.page
      const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.projectDefaultConfig.limit

      const listParam = {
        page: page,
        limit: limit
      }

      const getDetails = await ProjectLikedDetailsService.list(listParam)

      response.status = 'success'
      if (getDetails.rowCount > 0) {
        const allRecords = getDetails.rows.map(project => {
          project.projectId = CustomService.encrypt(project.in_project_id)
          return project
        })

        response.msg = sails.__('msgRecordsFound', 'Liked Project')
        response.data = {
          items: allRecords,
          projectDuration: sails.config.custom.projectDuration,
          total: getDetails.rowCount
        }
      } else {
        response.msg = sails.__('msgNoRecordsFound', 'categories')
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
   * @description Add project to liked project method.
   * @date 18 Oct 2019
   */
  addProjectToLiked: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.projectId !== undefined) {
        const projectId = CustomService.decrypt(req.body.projectId)
        let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

        if (fetchUserDetails.userId !== undefined) {
          let dataAlreadyExist = await ProjectLikedDetailsService.projectLikedAlreadyExist([projectId, fetchUserDetails.userId])

          if (dataAlreadyExist.rowCount === 0) {
            let insertDetails = await ProjectLikedDetailsService.addProjectLikedDetails([projectId, fetchUserDetails.userId, CustomService.currentDate()])

            //  ---------------- NOTE START OF NOTIFICATION ----------------

            let projectDetails = await ProjectService.getProjectDetailById([projectId])
            let notifierUserId = Number(projectDetails.rows[0].in_user_id)
            let filteredNotifierListArr = [notifierUserId]
            let userId = fetchUserDetails.userId

            // Send notification only if previously user have not sended.
            let projectExitedDetail = await ProjectLikedDetailsService.projectLikedNotificationExist(userId, notifierUserId)
            if (projectExitedDetail.status === 'success') {

              let encryptedProjectId = CustomService.encrypt(projectId)
              let redirectUrl = '{ "name": "view", "params": { "id": "' + encryptedProjectId + '" } }'//encrypted id
              let replaceObject = {
                'user_name': fetchUserDetails.firstName + ' ' + fetchUserDetails.lastName,
                'action_type': 'Liked',
                'post_description': projectDetails.rows[0].st_project_name
              }

              // //NOTE 2. call sendnotification function
              let systemNotificationResponse = await NotificationService.sendSystemNotification(userId, filteredNotifierListArr, 'Project Liked', redirectUrl, replaceObject)
            }

            //  ----------------NOTE END OF NOTIFICATION ----------------

            if (insertDetails.rowCount > 0) {
              response.status = 'success'
              response.msg = sails.__('msgDataAddedToLiked', 'Project')
              response.data = insertDetails.rows[0].in_project_liked_id
            } else {
              response.msg = sails.__('msgDataAddedToLikedError')
            }
          } else {
            response.msg = sails.__('msgDataAlreadyLiked', 'Project')
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
   * @author Khushang M. Bhavnagarwala
   * @description Remove project to liked project method.
   * @date 18 Oct 2019
   */
  deleteProjectFromLiked: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      if (req.body.projectLikedId !== undefined) {
        const projectLikedId = req.body.projectLikedId
        let deleteDetails = await ProjectLikedDetailsService.deleteProjectLikedDetails([projectLikedId])

        if (deleteDetails.rowCount > 0) {
          response.status = 'success'
          response.msg = sails.__('msgDataDeletedFromLiked', 'Project')
        } else {
          response.msg = sails.__('msgDataDeletedFromLikedError')
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
}
