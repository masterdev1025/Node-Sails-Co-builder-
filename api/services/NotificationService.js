module.exports = {
  list: async function (listParam) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let userId = listParam.userId

      let query = `SELECT tn.in_notification_id, tnm.st_notification_module_type_name as st_notification_type, tn.in_sender_id, tn.in_notification_module_id, tn.st_notification_description, tn.st_redirect_url, tn.st_status,
          tn.dt_created_at FROM tbl_notifications as tn LEFT JOIN tbl_notification_module as tnm ON tnm.in_notification_module_id = tn.in_notification_module_id
          WHERE (tn.st_notifier_list @> '[{"id": ${userId},"status": "read"}]' OR tn.st_notifier_list @> '[{"id": ${userId},"status": "unread"}]') AND tn.st_status = '${listParam.status}' ORDER BY tn.dt_created_at DESC`

      let totalRows = await sails.sendNativeQuery(query)

      let offset = (listParam.page - 1) * listParam.limit
      query += ` limit ${listParam.limit} offset ${offset}`

      let getUserNotification = await sails.sendNativeQuery(query)

      if (getUserNotification.rowCount > 0) {
        // encrypt ids
        const allRecords = getUserNotification.rows.map(notification => {
          notification.in_notification_id = CustomService.encrypt(notification.in_notification_id)
          return notification
        })

        response = {
          status: 'success',
          msg: 'Notification details fetch successfully.',
          data: {
            items: allRecords,
            total: totalRows.rowCount
          }
        }
      } else {
        response.msg = 'Fail to get notification details.'
      }

    } catch (error) {

      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return response
    }
  },
  getUserNotificationDetail: async function (cobuilderId) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let userIdDetails = await MessageService.getUserIdFromCobuilderId([[cobuilderId]])
      if (userIdDetails.status === 'success') {
        let userId = userIdDetails.data.userIdList[0]

        let getUserNotification = await sails.sendNativeQuery(`SELECT st_notification_description,st_redirect_url, st_status, dt_created_at
        FROM tbl_notifications WHERE st_notifier_list @> '[{"id": ${userId},"status": "unread"}]' AND st_status = 'active' ORDER BY dt_created_at DESC LIMIT 5`)

        if (getUserNotification.rowCount > 0) {
          let getNotificationCountDetail = await this.getUserUnreadNotificationCount(userId)
          if (getNotificationCountDetail.status === 'success') {
            response = {
              status: 'success',
              msg: 'Notification details fetch successfully.',
              data: {
                items: getUserNotification.rows,
                totalUnreadNotificationCount: getNotificationCountDetail.data.unreadNotificationCount
              }
            }
          } else {
            response = {
              status: 'success',
              msg: 'Notification details fetch successfully.',
              data: {
                items: getUserNotification.rows,
                totalUnreadNotificationCount: getNotificationCountDetail.data.unreadNotificationCount
              }
            }
          }

        } else {
          response = {
            status: 'success',
            msg: 'Notification details fetch successfully.',
            data: {
              items: [],
              totalUnreadNotificationCount: 0
            }
          }
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
      return response
    }
  },
  getUserUnreadNotificationCount: async function(userId){
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      console.log('NotificationService.js Line(118)')
      console.log(userId)
      let getUserNotification = await sails.sendNativeQuery(`SELECT in_notification_id, in_sender_id, in_notification_module_id, st_notification_description,st_redirect_url, st_status, dt_created_at FROM tbl_notifications WHERE st_notifier_list @> '[{"id": ${userId},"status": "unread"}]' AND st_status = 'active'`)

      if (getUserNotification.rowCount > 0) {
        response = {
          status: 'success',
          msg: 'Unread notification count get successfully.',
          data: {
            unreadNotificationCount: getUserNotification.rows.length
          }
        }
      } else {
        response.msg = 'Fail to get notification details.'
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return response
    }
  },
  markAllNotificationAsRead:  async function(cobuilderId){
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {

      let userIdDetails = await MessageService.getUserIdFromCobuilderId([[cobuilderId]])
      if (userIdDetails.status === 'success') {
        let userId = userIdDetails.data.userIdList[0]

        // get only unread message id

        let getUserUnreadNotificationDetail = await sails.sendNativeQuery(`SELECT in_notification_id FROM tbl_notifications WHERE st_notifier_list @> '[{"id": ${userId}, "status": "unread"}]' GROUP BY in_notification_id`)
        if (getUserUnreadNotificationDetail.rowCount > 0) {
          // generate notification id array of unread message only
          let notificationIdArr = getUserUnreadNotificationDetail.rows.map(item => item.in_notification_id)

          let dataArr = [notificationIdArr]
          // NOTE OLD working without setting dt_readed_at time
          // let getUserNotification = await sails.sendNativeQuery(`with notifier_path AS ( SELECT ('{' || index-1 || ',status}')::text[] as path, tbl_notifications
          //   FROM tbl_notifications, jsonb_array_elements(st_notifier_list) WITH ORDINALITY arr(notifier_list, INDEX) WHERE notifier_list->>'id' = '${userId}' AND in_notification_id = any($1) )
          //   update tbl_notifications set st_notifier_list = jsonb_set(st_notifier_list, notifier_path.path, '"read"', false) from notifier_path`,dataArr)

          // NOTE mark selected notification with read and update read timing of each object
          let getUserNotification = await sails.sendNativeQuery(`WITH notifier_path AS (
            SELECT jae, concat('{'::text,'"id":'::text,  jae->>'id' ,', "status":'::text, to_json('read'::text), ', "dt_readed_at":'::text, to_json(now()::text) || '}')::jsonb as user_obj,
              ('{' || index-1 || '}')::text[] as path, in_notification_id, jae FROM tbl_notifications, jsonb_array_elements(st_notifier_list) WITH ORDINALITY arr(notifier_list, INDEX)
            cross join jsonb_array_elements(st_notifier_list) as jae where jae->>'id' = '${userId}' AND in_notification_id = any($1)
            )
            UPDATE tbl_notifications SET
              st_notifier_list = jsonb_set(st_notifier_list, np.path, np.user_obj, false)
              FROM notifier_path as np where tbl_notifications.in_notification_id = any($1)
            `, dataArr)


          if (getUserNotification.rowCount > 0) {
            response = {
              status: 'success',
              msg: 'All message marked as read successfully.'
            }
          } else {
            response.msg = 'Fail to mark all message as read.'
          }
        } else {
          response.msg = 'There is no message exist to mark as read.'
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
      return response
    }
  },
  checkNotificationExist: async function (userId, notificationId) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let dataArr = [ notificationId]
      let getUserNotification = await sails.sendNativeQuery(`SELECT in_notification_id FROM tbl_notifications WHERE st_notifier_list @> '[{"id": ${userId}}]' AND in_notification_id = $1`, dataArr)

      if (getUserNotification.rowCount > 0) {
        response = {
          status: 'success',
          msg: 'All message marked as read successfully.',
          data: {
            items: getUserNotification.rows[0]
          }
        }
      } else {
        response.msg = 'Fail to delete notification.'
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return response
    }
  },
  deleteNotification: async function (userId, notificationId) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let dataArr = [notificationId]
      // let getUserNotificationUpdateDetail = await sails.sendNativeQuery(`UPDATE tbl_notification_details SET st_status = 'deleted' WHERE in_user_id = $1 AND in_notification_id = $2 RETURNING *`, dataArr)
      console.log('NotificationService.js Line(227)')
      console.log(notificationId)
      let getUserNotificationUpdateDetail = await sails.sendNativeQuery(`WITH notifier_path AS (
          SELECT ('{' || index-1 || ',status}')::text[] as path, tbl_notifications, in_notification_id
			FROM tbl_notifications, jsonb_array_elements(st_notifier_list) WITH ORDINALITY arr(notifier_list, INDEX) WHERE notifier_list->>'id' = '${userId}' AND in_notification_id =  $1 ) UPDATE tbl_notifications SET st_notifier_list = jsonb_set(st_notifier_list, np.path, '"deleted"', false) FROM notifier_path as np where tbl_notifications.in_notification_id = $1 RETURNING *`, dataArr)

      if (getUserNotificationUpdateDetail.rowCount > 0) {
        // get unread message count
        let getNotificationCountDetail = await this.getUserUnreadNotificationCount(userId)

        if (getNotificationCountDetail.status === 'success') {
          response = {
            status: 'success',
            msg: 'Notification deleted successfully.',
            data: {
              totalUnreadNotificationCount: getNotificationCountDetail.data.unreadNotificationCount
            }
          }
        } else {
          response = {
            status: 'success',
            msg: 'Notification deleted successfully.',
            data: {
              totalUnreadNotificationCount: 0
            }
          }
        }
      } else {
        response.msg = 'Fail to delete notification.'
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return response
    }
  },
  async getNotificationMessageFromTemplate(module, replaceWith){
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      // get template from db of config.
      let templateList = sails.config.notification.template


      let dataArr = [module]
      // let getUserNotificationUpdateDetail = await sails.sendNativeQuery(`UPDATE tbl_notification_details SET st_status = 'deleted' WHERE in_user_id = $1 AND in_notification_id = $2 RETURNING *`, dataArr)
      let getUserNotificationUpdateDetail = await sails.sendNativeQuery(`SELECT tnt.in_notification_template_id, tnt.in_notification_module_id, tnt.st_notification_template_body FROM tbl_notification_template AS tnt
        LEFT JOIN tbl_notification_module AS tnm ON tnt.in_notification_module_id = tnm.in_notification_module_id WHERE st_notification_module_type_name = $1`, dataArr)

      let message = ''
      if (getUserNotificationUpdateDetail.rowCount > 0) {
        message = getUserNotificationUpdateDetail.rows[0].st_notification_template_body
        Object.keys(replaceWith).forEach(key => {
          let keyName = '{{' + key + '}}'
          message = message.replace(keyName, replaceWith[key])
        })

        response = {
          status: 'success',
          msg: 'Message generated successfully.',
          data: {
            message: message
          }
        }
      } else {
        response.msg = 'Fail to get template.'
      }

    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return response
    }
  },
  async sendSystemNotification(senderUserId, notifierListArr, moduleName, redirectUrl, replaceObject) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {

      let validationFields = [
        {
          field: senderUserId,
          rules: {
            isInputRequired: sails.__('msgFieldIsRequired', 'Sender id')
          }
        },
        {
          field: notifierListArr,
          rules: {
            isInputArrRequired: sails.__('msgFieldIsRequired', 'Notifier list')
          }
        },
        {
          field: moduleName,
          rules: {
            isInputRequired: sails.__('msgFieldIsRequired', 'Module name')
          }
        },
        {
          field: redirectUrl,
          rules: {
            isInputRequired: sails.__('msgFieldIsRequired', 'Redirect url')
          }
        },
        {
          field: replaceObject,
          rules: {
            isInputRequired: sails.__('msgFieldIsRequired', 'Parameter')
          }
        },

      ]

      let validate = await ValidationService.validate(validationFields)
      if (validate.status) {
        // 1. check module exist or not in "tbl_notification_module"
        let getModuleTemplateDetails = await this.checkNotificationModuleDetailIfExist(moduleName)
        console.log('NotificationService.js Line(316)')
        console.log(getModuleTemplateDetails)
        if (getModuleTemplateDetails.status === 'success') {
          // 2. check "template" exist for module exist or not IF exist then generate message string string
          // NOTE can't check it if parameter missed matched
          // FIXME check parameter missmatch
          let notificationMessage = getModuleTemplateDetails.data.st_notification_template_body
          Object.keys(replaceObject).forEach(key => {
            let keyName = '{{' + key + '}}'
            notificationMessage = notificationMessage.replace(keyName, replaceObject[key])
          })


          // 3. Generate notifier list object to store in "st_notifier_list"
          let notifierArrDetail = await this.generateNotifierListObject(notifierListArr)
          console.log('NotificationService.js Line(333)')
          console.log(notifierArrDetail)
          if (notifierArrDetail.status === 'success') {

            // 4. store senderId, moduleId, notificationDescription, redirectUrl, notifierList, Status
            let moduleId = getModuleTemplateDetails.data.in_notification_module_id
            let notifierList = JSON.stringify(notifierArrDetail.data)
            // let notifierList = notifierArrDetail.data

            let savedNotificationDetails = await this.saveNotification(senderUserId, moduleId, notificationMessage, redirectUrl, notifierList)
            console.log('NotificationService.js Line(341)')
            console.log(savedNotificationDetails)

            if (savedNotificationDetails.status === 'success') {
              // TODO notify all online user dynamically
              response = {
                status: 'success',
                msg: 'Notification sent successfully.'
              }
            } else {
              response.msg = savedNotificationDetails.msg
            }
          } else {
            response.msg = notifierListArr.msg
          }

        } else {
          response.msg = getModuleTemplateDetails.msg
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
      return response
    }
  },
  async checkNotificationModuleDetailIfExist(moduleName) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let dataArr = [moduleName]
      let getModuleAndTemplateDetails = await sails.sendNativeQuery(`select tnm.in_notification_module_id, tnt.in_notification_template_id, tnt.st_notification_template_body from tbl_notification_module as
        tnm LEFT JOIN tbl_notification_template as tnt ON tnt.in_notification_module_id = tnm.in_notification_module_id
        WHERE tnm.st_status = 'active' and tnm.in_parent_id != 0 and tnm.st_notification_module_type_name = $1`, dataArr)

      if (getModuleAndTemplateDetails.rowCount === 1) {
        response = {
          status: 'success',
          msg: 'Module and template detail found successfully.',
          data: getModuleAndTemplateDetails.rows[0]
        }
      } else if (getModuleAndTemplateDetails.rowCount > 1) {
        response.msg = 'Either module or template have more than one record.'
      } else {
        response.msg = 'Either module or template is not exist in database.'
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return response
    }
  },
  async generateNotifierListObject(notifierList) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      // TODO create following structure
      // [
      //   {
      //     "id": 2,
      //     "status": "read",
      //     "dt_readed_at": "now()"
      //   }
      // ]

      // if notifier array is empty then return error
      if (notifierList.length > 0) {
        let notifierObject = []

        notifierList.forEach( element => {

          notifierObject.push({
            id: Number(element),
            status: 'unread',
            dt_readed_at: null
          })
        })

        response = {
          status: 'success',
          msg: 'Notifier list generated successfully.',
          data: notifierObject
        }

      } else {
        response.msg = 'Notifier List is empty.'
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return response
    }
  },
  async saveNotification(senderUserId, moduleId, notificationMessage, redirectUrl, notifierList) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let dataArr =[senderUserId, moduleId, notificationMessage,redirectUrl, notifierList, 'active']
      let getUserNotification = await sails.sendNativeQuery('INSERT INTO public.tbl_notifications( in_sender_id, in_notification_module_id, st_notification_description, st_redirect_url, st_notifier_list, st_status, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6, now(), now()) RETURNING *',dataArr)

      if (getUserNotification.rowCount > 0) {
        response = {
          status: 'success',
          msg: 'Notification saved successfully.'
        }
      } else {
        response.msg = 'Fail to save notification details. Please try again.'
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return response
    }
  }
}
