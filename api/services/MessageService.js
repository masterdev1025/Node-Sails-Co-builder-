module.exports = {
  checkRoomAlreadyExist: async function(dataArr) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      // let chekRoomExist = await sails.sendNativeQuery(`SELECT * FROM tbl_chat_room_details WHERE in_user_id = ANY($1) AND st_room_type = $2`, dataArr)
      let chekRoomExist = await sails.sendNativeQuery(`select * from(
                          select tbl1.in_user_id as user_one,tbl2.in_user_id as user_two, tbl1.in_chat_room_id from
                          (select * from tbl_chat_room_details where in_user_id = $1 and st_room_type = $3) as tbl1
                          left join tbl_chat_room_details as tbl2 on tbl1.in_chat_room_id = tbl2.in_chat_room_id AND tbl2.in_user_id != $1 and tbl2.st_room_type = $3
                          ) as test
                          where user_one = $1 and user_two = $2`, dataArr)

      if (chekRoomExist.rowCount > 0) {
        let chatRoomId = chekRoomExist.rows[0].in_chat_room_id

        response = {
          status: 'success',
          msg: 'User detail fetch successfully.',
          data: {
            roomId: chatRoomId
          }
        }
      } else {
        response.msg = 'No record found.'
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
  createNewRoom: async function(data) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {

      let newRoomCreated = await sails.sendNativeQuery(`INSERT INTO tbl_chat_rooms(st_status, dt_created_at, dt_updated_at) VALUES
      ($1, NOW() , NOW()) RETURNING *`, ['active'])

      if (newRoomCreated.rowCount > 0){
        response = {
          status: 'success',
          msg: 'Room created successfully.',
          data: {
            inChatRoomId: newRoomCreated.rows[0].in_chat_room_id
          }
        }
      } else {
        response.msg = 'Fail to create new room'
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
  getUserIdFromCobuilderId: async function(dataArr) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {

      let newRoomCreated = await sails.sendNativeQuery(`SELECT in_user_id FROM tbl_user_master where st_cobuilders_id = ANY($1)`, dataArr)

      if (newRoomCreated.rowCount > 0){
        let userIdArr = []
        newRoomCreated.rows.forEach(element => {
          userIdArr.push(Number(element.in_user_id))
        })
        response = {
          status: 'success',
          msg: 'User detail fetch successfully.',
          data: {
            userIdList: userIdArr
          }
        }
      } else {
        response.msg ='No record found.'
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
  createRoomDetail: async function(userArray, inChatRoomId){
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {

      let ROOM_DETAIL_SQL = 'INSERT INTO public.tbl_chat_room_details(in_chat_room_id, in_user_id, in_chat_unread_message_count, st_room_type, dt_created_at, dt_updated_at) VALUES '

      let i
      for (i = 0; i < userArray.length; i++) {
        let userId = userArray[i]
        ROOM_DETAIL_SQL += '('+ inChatRoomId +', '+ userId +', 0, \'single\', now(), now())'
        if (i !== userArray.length - 1) {
          ROOM_DETAIL_SQL += ', '
        }
      }
      ROOM_DETAIL_SQL += ' RETURNING *'

      let roomDetailInserted = await sails.sendNativeQuery(ROOM_DETAIL_SQL)
      if (roomDetailInserted.rowCount > 0 ){
        response = {
          status: 'success',
          msg: 'Room detail inserted successfully.',
        }
      } else {
        response.msg = 'Fail to insert room details'
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
  getUserExistingRoom: async function (dataArr) {
    let response = {
      status: 'error',
      msg: 'Somthingwent wrong.',
      data: ''
    }
    try {
      let existingRoomDetails = await sails.sendNativeQuery(
        `select in_chat_room_id as "roomName" from tbl_chat_room_details where in_chat_room_id = $1 and in_user_id = $2`,
        dataArr
      )
      if (existingRoomDetails.rowCount > 0 ) {
        response = {
          status: 'success',
          msg: 'Existing room details found successfully.',
          data: {
            roomName: existingRoomDetails.rows[0].roomName
          }
        }
      } else {
        response.msg = 'Fail to get room details.'
      }
    } catch (error) {
      console.log('MessageController.js Line(7)llllllllllllllllll')
      console.log(error)
    } finally {
      return response
    }
  },
  clearUserNotificationCount: async function (dataArr){
    let response = {
      status: 'error',
      msg: 'Somthingwent wrong.',
      data: ''
    }
    try {
      let updateExistingRoomDetails = await sails.sendNativeQuery(
        `UPDATE public.tbl_chat_room_details SET in_chat_unread_message_count= 0 WHERE in_chat_room_id = $1 AND in_user_id = $2 RETURNING *;`,
        dataArr
      )

      if (updateExistingRoomDetails.rowCount > 0) {
        response = {
          status: 'success',
          msg: 'Existing room message count cleared successfully.',
        }
      } else {
        response.msg = 'Fail to update clear message count.'
      }
    } catch (error) {
      console.log('MessageController.js Line(7)FFFFFFFFFFFFFF')
      console.log(error)
    } finally {
      return response
    }
  },
  getUserRoom: async function() {
    return await sails.sendNativeQuery(
            `select * from tbl_chat_room_details where st_status = $1 and in_user_id != $2`,
            dataArr
    )
  },
  saveUserMessage: async function (userId, roomId, message, stMessageType, stFileType, stFileName, time){
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {
      let messageType = stMessageType === 'text' ? 'text' : 'file'
      let fileType = stFileType === 'text' ? 'text' : stFileType
      let dataArr = [
        roomId,
        userId,
        message,
        messageType,
        fileType,
        stFileName,
        time,
        time
      ]

      let messageInserted = await sails.sendNativeQuery(`INSERT INTO public.tbl_chat_messages(
          in_chat_room_id, in_sender_user_id, st_message, st_message_type, st_file_type, st_file_name, st_status, dt_created_at, dt_updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8) RETURNING *`, dataArr)

      if (messageInserted.rowCount > 0) {
        response = {
          status: 'success',
          msg: 'Message saved successfully',
          data: messageInserted.rows[0]
        }
      } else {
        response.msg = 'Fail to insert message'
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
  getUserChatHistory: async function (roomName, page){
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {
      let totalChatRecords = 0
      let chatMessageCountQueryResult = await sails.sendNativeQuery(`select count(*) as totalRowCount
                          from tbl_chat_messages as tcm
                          LEFT JOIN tbl_user_master as tum ON tum.in_user_id = tcm.in_sender_user_id
                          where tcm.in_chat_room_id = $1 AND tcm.st_status = 'active'`, [roomName])
      // if record found then update counter else make it zero
      if (chatMessageCountQueryResult.rowCount > 0) {
        totalChatRecords = Number(chatMessageCountQueryResult.rows[0].totalrowcount)
      }

      let limit = 30
      let totalPages = Math.ceil(totalChatRecords / limit) //#1 55 items / 10 per page = 6 pages

      //# 2 > 1, yes so $page = 1
      if (page > totalPages) {
        page = totalPages
        response.msg = 'No record found.'
      } else {
        let offset = (page - 1) * limit //#3 $start = (1 - 1) * 10 = 0
        let dataArr = [roomName, limit, offset]

        let chekRoomExist = await sails.sendNativeQuery(
          `SELECT * FROM (
                          select tcm.in_chat_message_id as "messageId", tcm.in_chat_room_id as "roomName", tcm.st_message as message,
                          tcm.st_message_type as "stMessageType", tcm.st_file_type as "stFileType", tcm.st_file_name as "stFileName", tcm.dt_created_at as time,
                          tum.st_first_name as "userFirstName", tum.st_last_name as "userLastName", tum.st_email_address as "userEmail", tum.st_profile_picture as "userProfileImage"
                          from tbl_chat_messages as tcm
                          LEFT JOIN tbl_user_master as tum ON tum.in_user_id = tcm.in_sender_user_id
                          where tcm.in_chat_room_id = $1 AND tcm.st_status = 'active' ORDER BY "messageId" DESC LIMIT $2 OFFSET $3
                          ) t ORDER BY "messageId" ASC`, dataArr)
        if (chekRoomExist.rowCount > 0) {
          response = {
            status: 'success',
            msg: 'User chat detail fetch successfully.',
            data: chekRoomExist.rows,
            nextPage: page + 1,
            totalRecord: totalChatRecords
          }
        } else {
          response.msg = 'No record found.'
        }
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
  editMessage: async function (messageId, newMessage) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {
      // check message is exist
      let selectDataArr = [messageId]
      let messageExistDetail = await sails.sendNativeQuery(`SELECT * FROM public.tbl_chat_messages WHERE in_chat_message_id = $1`, selectDataArr)

      if (messageExistDetail.rowCount > 0) {
        // TODO before update copy it to
        let updateDataArr = [messageId, newMessage]
        let updateExistingMessage = await sails.sendNativeQuery(
          `UPDATE public.tbl_chat_messages SET st_message= $2 WHERE in_chat_message_id = $1 RETURNING *`, updateDataArr)
        if (updateExistingMessage.rowCount > 0) {
          response = {
            status: 'success',
            msg: 'Message updated successfully.',
            data: updateExistingMessage.rows[0]
          }


        } else {
          response.msg = 'No record found.'
        }
      } else {
        response.msg = 'Message is not found. Please try again.'
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
  deleteUserChat: async function (req, messageId) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
    }
    try {
      // check message is exist
      let dataArr = [messageId]
      let messageExistDetail = await sails.sendNativeQuery(`SELECT * FROM public.tbl_chat_messages WHERE in_chat_message_id = $1`, dataArr)

      if (messageExistDetail.rowCount > 0){
        let roomName = messageExistDetail.rows[0].in_chat_room_id
        let senderId = messageExistDetail.rows[0].in_sender_user_id

        // ToDO Get message count after delete
        let isMessageCountLessThanUnreadMessageCountResponse = await this.isMessageCountLessThanUnreadMessageCount(messageId, roomName, senderId)

        let updateExistingMessage = await sails.sendNativeQuery(
          `UPDATE public.tbl_chat_messages SET st_status='deleted' WHERE in_chat_message_id = $1 RETURNING *`, dataArr)
        if (updateExistingMessage.rowCount > 0) {
          // 1. if count less than then update count and send response
          // 2. else don't update count
          if (isMessageCountLessThanUnreadMessageCountResponse.status === 'success') {
            if (isMessageCountLessThanUnreadMessageCountResponse.data) {
              // update count in room detail table
              // let reduceMessageCount await this.reduceMessageNotificationCount(roomName, senderId, 1)
              //
              dataArr = [roomName]

              let messageExistDetail = await sails.sendNativeQuery(`SELECT st_message, dt_created_at FROM public.tbl_chat_messages WHERE in_chat_room_id = $1 and st_status = 'active' order by in_chat_message_id desc limit 1`, dataArr)
              if (messageExistDetail.rowCount > 0) {
                let stMessage = messageExistDetail.rows[0].st_message
                let stTime = messageExistDetail.rows[0].dt_created_at

                const chatNotificationDetails = await MessageService.chatNotification(req, roomName, senderId, stMessage, stTime, 'decrement')
                // send notification message

              }

            } else {
              // FIXME merge conditions
              dataArr = [roomName]
              let messageExistDetail = await sails.sendNativeQuery(`SELECT st_message, dt_created_at FROM public.tbl_chat_messages WHERE in_chat_room_id = $1 and st_status = 'active' order by in_chat_message_id desc limit 1`, dataArr)
              if (messageExistDetail.rowCount > 0) {
                let stMessage = messageExistDetail.rows[0].st_message
                let stTime = messageExistDetail.rows[0].dt_created_at

                const chatNotificationDetails = await MessageService.chatNotification(req, roomName, senderId, stMessage, stTime, 'nochange')
                // send notification message
              }
            }
            // if message delete then just return response no need to handle condition over here
            response = {
              status: 'success',
              msg: 'User chat detail fetch successfully.',
              data: updateExistingMessage.rows,
            }
          } else {
            //
            response = {
              status: 'success',
              msg: 'User chat detail fetch successfully.',
              data: updateExistingMessage.rows
            }
          }
        } else {
          response.msg = 'Failt delete message.'
        }

      } else {
        response.msg = 'Message is not found. Please try again.'
      }
    } catch (error) {
      console.log('MessageService.js Line(411)')
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return response
    }
  },
  isMessageCountLessThanUnreadMessageCount: async function (messageId, chatRoomId, userId) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {
      let dataArr = [messageId, chatRoomId, userId]
      let isMessageCountLessThanUnreadMessageCountDetail = await sails.sendNativeQuery(
        `select
        (
        CASE WHEN temp_messsage.message_count <= temp_room_detail.in_chat_unread_message_count THEN true ELSE false END
        ) AS message_count_less_unread_message_count
        from
        (
          select count(in_chat_message_id) as message_count, in_chat_room_id from tbl_chat_messages where in_chat_message_id >= $1 and in_chat_room_id = $2 and st_status = 'active' group by in_chat_room_id
        ) temp_messsage left join (
          select in_chat_unread_message_count, in_chat_room_id from tbl_chat_room_details where in_chat_room_id = $2 and in_user_id != $3
        ) temp_room_detail ON temp_messsage.in_chat_room_id = temp_room_detail.in_chat_room_id`, dataArr)

      if (isMessageCountLessThanUnreadMessageCountDetail.rowCount > 0) {
        response = {
          status: 'success',
          msg: 'User chat count detail fetch successfully.',
          data: isMessageCountLessThanUnreadMessageCountDetail.rows[0].message_count_less_unread_message_count
        }
      } else {
        response.status = 'success'
        response.msg = 'Fail to get message count.'
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
  reduceMessageNotificationCount: async function (chatRoomId, userId, decreaseCountBy) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {
      let dataArr = [decreaseCountBy, userId, chatRoomId]
      let updateExistingMessage = await sails.sendNativeQuery(
        `update tbl_chat_room_details set in_chat_unread_message_count = in_chat_unread_message_count - $1 where in_user_id != $2 and in_chat_room_id = $3 RETURNING *`, dataArr)
      if (updateExistingMessage.rowCount > 0) {
        response = {
          status: 'success',
          msg: 'User chat detail fetch successfully.',
          messageCountUpdated: true
        }
      } else {
        response.msg = 'Fail to update notification counter.'
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
  chatNotification: async function (req, roomName, senderId, stMessage, stMessageTime, counterType) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {
      let cobuilderIdDetails = await this.getCobuilderIdsFromRoom(roomName, senderId)

      if (cobuilderIdDetails.status === 'success') {
        // generate key array
        let redisObj = sails.config.getRedisClient()
        let chatRoomUserList = []
        //TODO fetch active user list from redis

        const cobuilderIdListLenght = cobuilderIdDetails.data.length
        if (cobuilderIdListLenght > 0){
          // generate keys from cobuilder id list

          let i
          for (i = 0; i < cobuilderIdListLenght; i++) {
            let tmpList =[]
            let item = cobuilderIdDetails.data[i]
            // NOTE Condition 1. Get user active details from redis
            let redisUserKey = 'user:' + item.cobuilderId
            let redisKeyGetDetail = await redisObj.get(redisUserKey)
            // NOTE Condition 2. get user exist in room details
            let redisUserRoomKey = 'user:' + roomName + ':' + item.cobuilderId
            let redisUserRoomExistKey = await redisObj.get(redisUserRoomKey)
            // redisObj.disconnect()

            // 1. check user is live 2. not exist in same room then send notification
            if (redisKeyGetDetail && !redisUserRoomExistKey) {

              tmpList = {
                socketID: redisKeyGetDetail,
                cobuilderId: item.cobuilderId
              }
              chatRoomUserList.push(tmpList)
            }
          }

          // redisObj.mget()
          //TODO UPDATE COUNTER
          const notificationCounterUpdateDetail = await this.updateNotificationCounter(req, roomName, chatRoomUserList, stMessage, stMessageTime, counterType)

          response = {
            status: 'success',
            msg: 'Active chat user list fetch successfully',
            data: {
              roomName: roomName,
              activeChatUser: chatRoomUserList,
            }
          }
        } else {
          response.msg = 'No user found in room'
        }
      } else {
        response.msg = cobuilderIdDetails.msg
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
  getCobuilderIdsFromRoom: async function (roomName, senderId) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {
      const dataArr = [roomName, senderId]
      let roomUserListDetails = await sails.sendNativeQuery(`SELECT tum.st_cobuilders_id as "cobuilderId", tum.in_user_id as "userId" FROM tbl_chat_room_details as tcrd
                          left join tbl_user_master as tum ON tcrd.in_user_id = tum.in_user_id
                          where in_chat_room_id = $1 and tum.in_user_id != $2`, dataArr)

      if (roomUserListDetails.rowCount > 0) {
        response = {
          status: 'success',
          msg: 'Room\'s user list details fetch successfully.',
          data: roomUserListDetails.rows
        }
      } else {
        response.msg = 'No user found in room.'
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
  updateNotificationCounter: async function (req, roomName, roomUserList, stMessage, stMessageTime, counterType) {
    // counterType incremetn | decrement
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {

      let roomUserListLength = roomUserList.length
      let i
      for (i = 0; i < roomUserListLength; i++) {
        let item = roomUserList[i]

        if (item.socketID) {
          // if not null then update counter in database
          const dataArr = [roomName, item.cobuilderId]

          let operationField = 'tcrd1.in_chat_unread_message_count + 1'
          if (counterType === 'decrement') {
            operationField = 'tcrd1.in_chat_unread_message_count - 1'
          } else if (counterType === 'nochange') {
            operationField = 'tcrd1.in_chat_unread_message_count'
          }
          let roomUserListDetails = await sails.sendNativeQuery(`update tbl_chat_room_details as tcrd1 set in_chat_unread_message_count = ${operationField}
            from (
              select tum.st_cobuilders_id, tcrd.in_chat_room_id ,tcrd.in_chat_unread_message_count, tcrd.in_user_id from tbl_chat_room_details  as tcrd
              left join tbl_user_master as tum ON tum.in_user_id = tcrd.in_user_id
              where tcrd.in_chat_room_id = $1 and tum.st_cobuilders_id = $2
            ) tmptcrd where tcrd1.in_user_id = tmptcrd.in_user_id and tcrd1.in_chat_room_id = $1 RETURNING *
            `, dataArr)

          if (roomUserListDetails.rowCount > 0) {
            let getRoomUserListDetails = await sails.sendNativeQuery(`select tum.st_cobuilders_id, tcrd.in_chat_room_id ,tcrd.in_chat_unread_message_count, tcrd.in_user_id from tbl_chat_room_details  as tcrd
              left join tbl_user_master as tum ON tum.in_user_id = tcrd.in_user_id
              where tcrd.in_chat_room_id = $1 and tum.st_cobuilders_id = $2;`, dataArr)

            if (getRoomUserListDetails.rowCount > 0) {

              let getLastRoomMessageDetail = await sails.sendNativeQuery(`select st_message, dt_created_at from tbl_chat_messages where in_chat_room_id = $1 and st_status != 'deleted' order by in_chat_message_id desc limit 1`, [roomName])

              if (getLastRoomMessageDetail.rowCount) {
                // NEED CONDITION FOR USER ON DIFFERENT ROOM
                //FIXME send notification to user only if user is on different room
                sails.sockets.broadcast(item.socketID, 'chat_notification', {
                  roomName: roomName,
                  notificationUserCobuilderId: item.cobuilderId,
                  unreadMessageCount: getRoomUserListDetails.rows[0].in_chat_unread_message_count,
                  stMessage: getLastRoomMessageDetail.rows[0].st_message,
                  stMessageTime: getLastRoomMessageDetail.rows[0].dt_created_at,
                }, req)
              } else {
                // NEED CONDITION FOR USER ON DIFFERENT ROOM
                //FIXME send notification to user only if user is on different room
                sails.sockets.broadcast(item.socketID, 'chat_notification', {
                  roomName: roomName,
                  notificationUserCobuilderId: item.cobuilderId,
                  unreadMessageCount: getRoomUserListDetails.rows[0].in_chat_unread_message_count,
                  stMessage: stMessage,
                  stMessageTime: stMessageTime
                }, req)
              }


              // NOTE send global chat notification count and listen in header
              let userTotalNotificationResponse = await this.getUserTotalNotificationCount(item.cobuilderId)
              if (userTotalNotificationResponse.status === 'success') {
                //userTotalNotificationResponse.data.notificationCount
                sails.sockets.broadcast(item.socketID, 'global_chat_notification', {
                  cobuilderId: item.cobuilderId,
                  totalUnreadMessageCount: userTotalNotificationResponse.data.notificationCount,
                }, req)
              }


            } else {
              response.msg = 'Fail to get user count details'
            }
          }
        }
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
  getUserTotalNotificationCount: async function(cobuilderId){
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {
      let dataArr = [cobuilderId]
      let userTotalNotificationCountDetails = await sails.sendNativeQuery(`select max(tum.st_cobuilders_id) as st_cobuilders_id, tcrd.in_user_id, sum(tcrd.in_chat_unread_message_count) as "totalMessage" from
      tbl_chat_room_details as tcrd
      LEFT JOIN tbl_user_master as tum ON tum.in_user_id = tcrd.in_user_id AND tum.st_cobuilders_id = $1
      where st_cobuilders_id = $1 group by tcrd.in_user_id `, dataArr)

      if (userTotalNotificationCountDetails.rowCount > 0) {
        response = {
          status: 'success',
          msg: 'User total notification count detail get successfully.',
          data: {
            notificationCount: userTotalNotificationCountDetails.rows[0].totalMessage
          }
        }
      } else {
        response.msg = 'Fail to get user total notification count.'
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
  getUserCobuilderIdFromRoomName: async function(roomName) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong')
    }
    try {
      let dataArr = [roomName]
      let roomUserListDetails = await sails.sendNativeQuery(`select tcrd.in_user_id,tum.st_cobuilders_id from tbl_chat_room_details as tcrd LEFT JOIN tbl_user_master as tum ON tum.in_user_id = tcrd.in_user_id
      WHERE in_chat_room_id = $1 AND `, dataArr)

      if (roomUserListDetails.rowCount > 0) {
        let userCobuilderIds = []
        roomUserListDetails.rows.forEach(element => {
          userCobuilderIds.push(element.st_cobuilders_id)
        })
        response = {
          status: 'success',
          msg: 'Successfully get user list from room details.',
          data: {
            userIdList: userIdArr
          }
        }
      } else {
        response.msg = 'Fail to get user list from room details.'
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
  setUserRoomDetailInRedis: async function(req, cobuilderId, roomName) {
    let response = {
      status: 'error',
      msg: 'Somthingwent wrong.',
      data: ''
    }
    try {

      if (cobuilderId) {
        // NOTE set active user list in redis server
        var socketId = sails.sockets.getId(req)
        if (roomName) {
          let redisObj = sails.config.getRedisClient()
          // NOTE set active user room list in redis server
          const checkUserRoomExist = await redisObj.get('user:' + roomName + ':' + cobuilderId)
          if (!checkUserRoomExist){
            // NOTE only set if user room is not exist
            redisObj.set('user:' + roomName + ':' + cobuilderId, socketId, 'EX', 30)
          }
          // redisObj.disconnect()
          //NOTE not handling else case as it also registered threw pong packet
          response = {
            status: 'success',
            msg: 'Successfully set user room.'
          }

        } else {
          response.msg = 'Room details should not be empty.'
        }
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
