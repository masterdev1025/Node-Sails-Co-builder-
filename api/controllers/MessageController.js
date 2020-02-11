module.exports = {
  joinRoom: async function (req, res) {
    // TODO store name in redis as well as in database
    let response = {
      status: 'error',
      msg: 'Somthingwent wrong.',
      data: ''
    }
    try {

      // const roomPrefix = 'room_'
      // let roomName = roomPrefix + req.body.fromUser + '_' + req.body.toUser
      // let roomName1 = roomPrefix + req.body.toUser + '_' + req.body.fromUser
      // let existinRoomList = sails.io.sockets.adapter.rooms
      // let alternateRoomExist = _.has(existinRoomList, roomName1)

      // let registredRoomName = alternateRoomExist ? roomName1 : roomName


      // // Leave old room if join previously ignore first time
      // if (req.body.oldRoom !== '') {

      //   sails.sockets.leave(req, req.body.oldRoom, (err) => {
      //     if(err) {res.serverError(err)}
      //   })
      // }

      // sails.sockets.join(req, registredRoomName, (err) => {
      //   if (err) {
      //     return res.serverError(err)
      //   }
      //   return res.json({
      //     status: 'success',
      //     message: 'Subscribed to a fun room called ' + registredRoomName + '!',
      //     data: {
      //       roomName: registredRoomName
      //     }
      //   })
      // })

      // GET USER ACTUAL ID FROM COBUILDER ID
      let userIdDetail = await MessageService.getUserIdFromCobuilderId([[req.body.fromUser, req.body.toUser]])
      if (userIdDetail.status === 'success') {
        let chatRoomDetail = await MessageService.checkRoomAlreadyExist([userIdDetail.data.userIdList[0], userIdDetail.data.userIdList[1], 'single'])
        if (chatRoomDetail.status === 'success' && req.body) {
          // IF room already exist then return that room
          response = {
            status: 'success',
            msg: 'Successfully join room.',
            data: {
              roomId: chatRoomDetail.data.roomId
            }
          }
        } else {
          // if room not exist then create new room
          let newRoomCreatedResponse = await MessageService.createNewRoom(req.body)
          if (newRoomCreatedResponse.status === 'success') {
            let newRoomDetailResponse = await MessageService.createRoomDetail(userIdDetail.data.userIdList, newRoomCreatedResponse.data.inChatRoomId)
            if (newRoomDetailResponse.status === 'success') {
              response = {
                status: 'success',
                msg: 'Successfully join room.',
                data: {
                  roomId: newRoomCreatedResponse.data.inChatRoomId
                }
              }
            } else {
              response.msg = newRoomDetailResponse.msg
            }
          } else {
            response.msg = newRoomCreatedResponse.msg
          }
        }
      } else {
        response.msg = userIdDetail.msg
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      console.log('MessageController.js Line(93)****** CONNECT ****************************************************')
      console.log(sails.sockets.getId(req))


      // Leave old room if join previously ignore first time
      if (typeof req.body.oldRoom !== 'undefined' && req.body.oldRoom !== '') {
        // console.log('MessageController.js Line(15)')
        // console.log('Leaving room' + req.body.oldRoom)
        sails.sockets.leave(req, req.body.oldRoom, (err) => {
          if (err) { res.serverError(err) }
        })
      }

      let registredRoomName = response.data.roomId
      // console.log('MessageController.js Line(105)')
      // console.log(typeof registredRoomName)
      // sails.sockets.join(req, registredRoomName, (err) => {

      //   if (err) {
      //     return res.serverError(err)
      //   }
      return res.json({
        status: 'success',
        message: 'Subscribed to a fun room called ' + registredRoomName + '!',
        data: {
          roomName: registredRoomName
        }
      })
      // })

      // return res.json(response)
    }
  },
  joinExistingRoom: async function (req, res) {
    let response = {
      status: 'error',
      msg: 'Somthingwent wrong.',
      data: ''
    }
    try {
      // let roomName = req.body.roomName
      let cobuilderId = req.body.cobuilderId
      let roomName = req.body.roomName
      let oldRoomName = req.body.oldRoom

      // NOTE 1. Leave old room if join previously ignore first time
      if (oldRoomName !== '') {

        sails.sockets.leave(req, oldRoomName, (err) => {
          if (err) { res.serverError(err) }
        })

        // NOTE 2. clear existing old room from redis if exist
        let redisObj = sails.config.getRedisClient()
        const roomKey = 'user:' + oldRoomName + ':' + cobuilderId

        if (redisObj.get(roomKey)) {
          redisObj.del(roomKey)
        }
        // redisObj.disconnect()
      }

      //NOTE 3. REGISTER CURRENT USER FOR REDIS ROOM
      const userRoomCreatedOnRedis = await MessageService.setUserRoomDetailInRedis(req, cobuilderId, roomName)
      if (userRoomCreatedOnRedis.status === 'success') {
        // NOTE not handling this method
        const userIdsDetails = await MessageService.getUserIdFromCobuilderId([[cobuilderId]])
        if (userIdsDetails.status === 'success') {
          let userId = userIdsDetails.data.userIdList
          await MessageService.clearUserNotificationCount([roomName, userId[0]])
          response = {
            status: 'success',
            msg: 'Existing room details found successfully.',
            data: {
              roomName: roomName
            }
          }

        } else {
          response.msg = userIdsDetails.msg
        }

      } else {
        response.msg = 'Fail to create room.'
      }

    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      if (response.status === 'success') {
        const registredRoomName = response.data.roomName

        // FIXME check if user already in room then dont registered again as there is no need for it.
        sails.sockets.join(req, registredRoomName, (err) => {
          if (err) {
            return res.serverError(err)
          }
          console.log('MessageController.js Line(157)')
          console.log('REJOINNNNINGGGG SOCKETTTTTTTT----------------')
          return res.json({
            status: 'success',
            message: 'Subscribed to a fun room called ' + registredRoomName + '!',
            data: {
              roomName: registredRoomName
            }
          })
        })
      } else {
        return res.json(response)
      }
    }

  },
  userStartedTyping: function (req, res) {
    let roomName = req.body.roomName
    // sending msg_event to client
    sails.sockets.broadcast(roomName, 'user_started_typing', req.body)
    return res.json({
      message: 'User is typing'
    })

  },
  userStoppedTyping: function (req, res) {
    let roomName = req.body.roomName
    // sending msg_event to client
    sails.sockets.broadcast(roomName, 'user_stopped_typing', req.body)
    return res.json({
      message: 'User is typing'
    })

  },
  sendMessage: async function (req, res) {
    let response = {
      status: 'error',
      msg: 'Somthingwent wrong.',
      data: ''
    }
    let roomName = req.body.roomName
    try {
      // console.clear()
      // console.log('MessageController.js Line(138)')
      // console.log(roomName)

      // TODO 2. store in message tale
      // TODO 3 create message count entry except current loggedin user

      // console.log('MessageController.js Line(44)')
      // console.log(req.body)
      let userIdDetail = await MessageService.getUserIdFromCobuilderId([[req.body.user.cobuilderId]])
      // console.log('MessageController.js Line(153)')
      // console.log(userIdDetail)
      if (userIdDetail.status === 'success') {
        const senderId = userIdDetail.data.userIdList[0]
        let messageInserted = await MessageService.saveUserMessage(senderId, req.body.roomName, req.body.message, req.body.stMessageType, req.body.stFileType, req.body.stFileName, req.body.time)
        // console.log('MessageController.js Line(157)')
        // console.log(messageInserted)
        if (messageInserted.status === 'success') {
          let reqData = req.body

          let postData = {
            messageId: messageInserted.data.in_chat_message_id,
            roomName: reqData.roomName,
            message: reqData.message,
            stMessageType: reqData.stMessageType, //text / document
            stFileType: reqData.stFileType, // text / image / pdf / excel / word
            time: reqData.time,
            userFirstName: reqData.user.firstName,
            userLastName: reqData.user.lastName,
            userEmail: reqData.user.email,
            userProfileImage: reqData.user.profileImage,
            stFileName: reqData.stFileName,
          }

          response = {
            status: 'success',
            msg: 'Message saved Successfully.',
            data: postData
          }
          // if request is socket only then execute broadcast event
          if (req.isSocket) {
            // TODO send MessageID
            // increment counter of all user in room if they are offline

            // let redisObj = sails.config.getRedisClient()
            // redisObj.mget(keysArray)
            const chatNotificationDetails = await MessageService.chatNotification(req, roomName, senderId, reqData.message, reqData.time,'increment')

            sails.sockets.broadcast(roomName, 'received_message', postData, req)
          }

        } else {
          response.msg = messageInserted.msg
        }
      } else {
        response.msg = userIdDetail.msg
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return res.json(response)
      // return res.json({
      //   message: 'Subscribed to a fun room called ' + roomName + '!'
      // })
    }

  },
  editMessage: async function (req, res) {
    let response = {
      status: 'error',
      msg: 'Somthingwent wrong.',
      data: ''
    }
    try {
      let roomName = req.body.roomName
      let editedUserChatMessage = await MessageService.editMessage(req.body.inChatMessageId, req.body.newMessage)
      if (editedUserChatMessage.status === 'success') {
        //NOTE update broadcat body
        response = {
          status: 'success',
          msg: 'Message updated successfully.',
          data: {
            roomName: roomName
          }
        }

        let senderId = editedUserChatMessage.data.in_sender_user_id
        let stMessage = editedUserChatMessage.data.st_message
        let stTime = editedUserChatMessage.data.dt_created_at
        const chatNotificationDetails = await MessageService.chatNotification(req, roomName, senderId, stMessage, stTime, 'nochange')
        if (req.isSocket) {
          sails.sockets.broadcast(roomName, 'edit_message', {
            roomName: roomName,
            editedMessageIndex: req.body.editedMessageIndex,
            messageId: req.body.messageId,
            newMessage: req.body.newMessage
          }, req)
        }

      } else {
        response.msg = editedUserChatMessage.message
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
  deleteMessage: async function (req, res) {
    let response = {
      status: 'error',
      msg: 'Somthingwent wrong.',
      data: ''
    }
    try {
      let roomName = req.body.roomName

      let deletedUserChatMessage = await MessageService.deleteUserChat(req, req.body.inChatMessageId)
      if (deletedUserChatMessage.status === 'success'){
        //NOTE update broadcat body
        sails.sockets.broadcast(roomName, 'delete_message', {
          roomName: roomName,
          deletedMessageIndex: req.body.deletedMessageIndex
        })
      } else {
        response.msg = deletedUserChatMessage.message
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
  getUserChatHistory: async function (req, res) {
    let response = {
      status: 'error',
      msg: 'Somthingwent wrong.',
      data: ''
    }
    try {
      let { roomName, page } = req.body
      let userChatHistoryDetail = await MessageService.getUserChatHistory(roomName, page)
      if (userChatHistoryDetail.status === 'success') {
        response = {
          status: 'success',
          msg: 'User chat details fetched successfully.',
          data: userChatHistoryDetail.data,
          nextPage: userChatHistoryDetail.nextPage,
          totalRecord: userChatHistoryDetail.totalRecord
        }
      } else {
        response.msg = userChatHistoryDetail.msg
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
  userChatStatus: async function (req, res) {
    let response = {
      status: 'error',
      msg: 'Somthingwent wrong.',
      data: ''
    }
    try {
      let cobuilderId = req.body.cobuilderId
      if (cobuilderId) {
        // NOTE set active user list in redis server
        var socketId = sails.sockets.getId(req)
        let redisObj = sails.config.getRedisClient()
        redisObj.set('user:' + cobuilderId, socketId, 'EX', 30)

        let roomName = req.body.roomName
        if (roomName) {
          //NOTE set room only if roomName exist else remove after 30 sec it
          // NOTE set active user room list in redis server
          redisObj.set('user:' + roomName + ':' + cobuilderId, socketId, 'EX', 30)
        }
        // redisObj.disconnect()
        response = {
          status: 'success',
          msg: 'Successfully set user status.'
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
  leaveRoom: async function (req, res) {
    let response = {
      status: 'error',
      msg: 'Somthingwent wrong.',
      data: ''
    }
    try {
      let cobuilderId = req.body.cobuilderId
      let roomName = req.body.roomName
      let isRemoveUser = req.body.isRemoveUser
      if (cobuilderId) {

        // NOTE set active user list in redis server
        let redisObj = sails.config.getRedisClient()
        const roomKey = 'user:' + roomName + ':' + cobuilderId
        // NOTE check if room exist then remove it
        if (redisObj.get(roomKey)) {
          redisObj.del(roomKey)

          // REMOVE USER FROM ROOM
          sails.sockets.leave(req, roomKey, (err) => {
            if (err) { res.serverError(err) }
          })
        }

        // NOTE check if user exist in redis then remove it
        if (isRemoveUser) {
          const userKey = 'user:' + cobuilderId
          if (redisObj.get(userKey)) {
            redisObj.del(userKey)
          }
        }
        // redisObj.disconnect()
        response = {
          status: 'success',
          msg: 'Successfully set user status.'
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


}
