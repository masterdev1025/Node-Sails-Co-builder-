module.exports = {
  list: async function(req, res, next) {
    let response = {
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
        let cobuilderId = req.body.cobuilderId

        const page = req.body.page !== undefined && req.body.page ? req.body.page : sails.config.custom.notificationDefaultConfig.page
        const limit = req.body.limit !== undefined && req.body.limit ? req.body.limit : sails.config.custom.notificationDefaultConfig.limit
        // const search = req.body.search !== undefined && req.body.search ? req.body.search : ''
        // const status = req.body.status !== undefined && req.body.status ? req.body.status : ['created']
        const status = 'active'
        // const field = req.body.field !== undefined && req.body.field ? req.body.field : 'in_notification_id'
        // const sorttype = req.body.sorttype !== undefined && req.body.sorttype ? req.body.sorttype : 'desc'


        console.log('NotificationController.js Line(29)')
        console.log(page)
        console.log(limit)
        const listParam = {
          page: page,
          limit: limit,
          // search: search,
          status: status,
          // field: field,
          // sorttype: sorttype,
          userId: userId,
          filter: {

          }
        }

        response = await NotificationService.list(listParam)
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
  getNotification: async function (req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let cobuilderId = req.body.cobuilderId
      response = await NotificationService.getUserNotificationDetail(cobuilderId)
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
  markAllNotificationAsRead: async function(req, res, next){
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let cobuilderId = req.body.cobuilderId
      response = await NotificationService.markAllNotificationAsRead(cobuilderId)
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
  deleteNotification: async function(req, res, next) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let cobuilderId = req.body.cobuilderId
      let notificationId = await CustomService.decrypt(req.body.notificationId)
      let userIdDetails = await MessageService.getUserIdFromCobuilderId([[cobuilderId]])
      if (userIdDetails.status === 'success') {
        let userId = userIdDetails.data.userIdList[0]
        // check if notification
        let notificationExistDetails = await NotificationService.checkNotificationExist(userId, notificationId)

        if (notificationExistDetails.status === 'success') {
          response = await NotificationService.deleteNotification(userId, notificationId)
        } else {
          response.msg = 'Unable to find notification detail. Please try again.'
        }
      } {
        response.msg = userIdDetails.msg
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
  async getNotificationMessageFromTemplate(req, res, next){
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      // TODO put validation over here
      let cobuilderId = req.body.cobuilderId
      let moduleName = req.body.moduleName
      // let moduleName = 'Project Deleted' // NOTE Remove this
      let redirectUrl = req.body.redirectUrl //NOTE Uncomment this
      // let redirectUrl = '{"name": "messages"}' // NOTE Remove this
      let replaceObject = req.body.params
      let notifierListArr = req.body.notifierListArr //NOTE Uncomment this
      // let notifierListArr = [10, 2, 17] // NOTE  remove this

      let userIdDetails = await MessageService.getUserIdFromCobuilderId([[cobuilderId]])

      if (userIdDetails.status === 'success') {
        let senderUserId = userIdDetails.data.userIdList[0] // userId
        //TODO common notification function
        // 1. create generalized function called "sendSystemNotification"
        // 2. call template inside "sendSystemNotification" function
        let systemNotificationResponse = await NotificationService.sendSystemNotification(senderUserId, notifierListArr, moduleName, redirectUrl, replaceObject)
        if (systemNotificationResponse.status === 'success') {
          response = {
            status: 'success',
            msg: 'Notification sent successfully.'
          }
        } else {
          response.msg = systemNotificationResponse.msg
        }
      } else {
        response.msg = userIdDetails.msg
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
