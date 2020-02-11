/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {
  /****************************************************************************
   *                                                                           *
   * Sails/Express middleware to run for every HTTP request.                   *
   * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
   *                                                                           *
   * https://sailsjs.com/documentation/concepts/middleware                     *
   *                                                                           *
   ****************************************************************************/

  middleware: {
    /***************************************************************************
     *                                                                          *
     * The order in which middleware should be run for HTTP requests.           *
     * (This Sails app's routes are handled by the "router" middleware below.)  *
     *                                                                          *
     ***************************************************************************/

    // order: [
    //   'cookieParser',
    //   'session',
    //   'bodyParser',
    //   'compress',
    //   'poweredBy',
    //   'router',
    //   'www',
    //   'favicon',
    // ],

    order: ['bodyParser', 'requestLog', 'updateSession'],

    /***************************************************************************
     *                                                                          *
     * The body parser that will handle incoming multipart HTTP requests.       *
     *                                                                          *
     * https://sailsjs.com/config/http#?customizing-the-body-parser             *
     *                                                                          *
     ***************************************************************************/

    bodyParser: (function _configureBodyParser () {
      var skipper = require('skipper')
      var middlewareFn = skipper({
        strict: true,
        maxWaitTimeBeforePassingControlToApp: 1000,
        maxTimeToBuffer: 3000
      })
      return middlewareFn

      // var opts = { limit: '10mb' };
      // var skipper = require('skipper');
      // return skipper(opts);
    })(),
    /**
     * @author Khushang M. Bhavnagarwala
     * @description Request log on each and every APIs call.
     * @date 09 July 2019
     */
    requestLog: (function () {
      console.log('Initializing `requestLog` (HTTP middleware)...')
      return async function (req, res, next) {
        let response = {
          status: 'error',
          msg: sails.__('msgSomethingWentWrong')
        }

        try {
          // console.log(req.method);
          // console.log(req.path);
          // console.log(req._startTime);
          // console.log(req.body);
          // console.log(req.headers);
          // console.log(req.headers.host);
          // console.log(req.ip);
          // console.log(req.params);
          // console.log('req.body');
          // console.log(req.body.email);
          // console.log('Received HTTP request: '+req.method+' '+req.headers.host+req.path);

          // console.log(
          //   '/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/config/http.js Line(88)'
          // )
          // console.log('req.method')
          // console.log(req.method)

          if (req.method === 'OPTIONS' || req.method === 'GET') {
            response.status = 'success'
          } else {
            let userId = null
            let bearer = ''
            let jwtToken = ''
            if (
              req.headers.authorization !== undefined &&
              req.headers.authorization !== ''
            ) {
              let reqHeader = req.headers.authorization.split(' ')
              bearer =
                reqHeader.length > 0 &&
                  reqHeader[1] !== undefined &&
                  reqHeader[1] !== ''
                  ? reqHeader[1]
                  : ''

              if (bearer) {
                // #TODO: check bearer is valid or not in DB.
                const userTokenVerification = await UserSessionService.verifyUserToken(
                  [bearer, sails.config.custom.accountStatus.active]
                )

                if (userTokenVerification.rowCount > 0) {
                  // Verify the session is accessible or not.
                  jwtToken = await JwtService.verify(bearer)
                }
              }
            }

            if (jwtToken.userId !== undefined && jwtToken.userId !== null) {
              userId = jwtToken.userId
            }

            if (req.body !== undefined) {
              if (typeof req.body.clientDetails === 'string') {
                req.body.clientDetails = JSON.parse(req.body.clientDetails)
              }

              // console.log(
              //   '/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/config/http.js Line(112)'
              // )
              // console.log('req.body')
              // console.log(req.body)
              // console.log('req.body.clientDetails')
              // console.log(req.body.clientDetails)

              let dataInsertArr = [
                userId,
                req.headers.host + req.path,
                CustomService.userLogger(req), // req.ip, // CustomService.userLogger(req)
                req.body,
                req.body.requestFrom !== undefined && (req.body.requestFrom === 'admin' || req.body.requestFrom === 'client' || req.body.requestFrom === 'app') ? req.body.requestFrom : 'client', // admin, client, app
                req.body.clientDetails.browserName !== undefined && req.body.clientDetails.browserName !== '' ? req.body.clientDetails.browserName : '',
                req.body.clientDetails.browserVersion !== undefined && req.body.clientDetails.browserVersion !== '' ? req.body.clientDetails.browserVersion : '',
                req.body.clientDetails.clientOs !== undefined && req.body.clientDetails.clientOs !== '' ? req.body.clientDetails.clientOs : '',
                bearer,
                req._startTime,
                CustomService.currentDate(),
                CustomService.currentDate()
              ]

              let requestLogDetails = await sails.sendNativeQuery(
                `INSERT INTO tbl_request_log(in_user_id, st_request_url, st_request_ip, st_request_params, st_request_from, st_request_browser, st_browser_version, st_client_os, st_request_token, st_request_time, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                dataInsertArr
              )
              if (requestLogDetails.rowCount > 0) {
                response.status = 'success'
              }
            } else {
              response.msg = sails.__('msgRequestNotAllowed')
            }
          }
        } catch (error) {
          console.log('============= Error in Log Log Insertion =============')
          console.log(error)
          response.msg = await CustomService.errorHandler(
            process.env.NODE_ENV,
            error
          )
        } finally {
          // console.log('/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/config/http.js Line(138)');
          // console.log('Request log session finally');
          if (response.status === 'success') {
            console.log('============= Request Log Inserted =============')
            return next()
          } else {
            console.log(
              '|||||||||||| Error in Request Log Insertion ||||||||||||'
            )
            return res.json(response)
          }
        }
      }
    })(),
    /**
     * @author Khushang M. Bhavnagarwala
     * @description Update session middleware.
     * @date 15 July 2019
     */
    updateSession: (function () {
      console.log('Initializing `updateSession` (HTTP middleware)...')
      return async function (req, res, next) {
        let response = {
          status: 'error',
          msg: sails.__('msgSomethingWentWrong')
        }

        try {
          if (req.method === 'OPTIONS' || req.method === 'GET') {
            response.status = 'success'
            response.msg = 'Nothing to do here with options.'
          } else {
            if (sails.config.custom.notRequiredAuthArr.includes(req.path)) {
              // Nothing goes here.
              response = {
                status: 'success',
                msg: ''
              }
            } else {
              if (
                req.headers.authorization !== undefined &&
                req.headers.authorization !== ''
              ) {
                let reqHeader = req.headers.authorization.split(' ')
                let bearer = reqHeader.length > 0 && reqHeader[1] !== undefined && reqHeader[1] !== '' ? reqHeader[1] : ''

                let sessionSeconds = sails.config.custom.sessionSeconds
                if (req.body.requestFrom === 'client' || req.body.requestFrom === 'app') {
                  let userSessionDetails = await sails.sendNativeQuery(`select in_user_session_id, in_user_id, st_bearer, st_status, dt_created_at, dt_updated_at from tbl_user_session where st_bearer = $1 and st_status = $2`, [bearer, sails.config.custom.accountStatus.active])

                  // Update the time if session exists.
                  if (userSessionDetails.rowCount > 0) {
                    let currentDate = new Date(CustomService.currentDate())
                    let lastDate = new Date(
                      userSessionDetails.rows[0].dt_updated_at
                    )

                    let timeDiff = Math.abs(
                      currentDate.getTime() - lastDate.getTime()
                    )
                    let diffSeconds = Math.ceil(timeDiff / 1000)

                    // Start Removing Idle Session
                    // Update session status to inactive which sits idle from 24 hours.
                    let conditionArr = [
                      sails.config.custom.accountStatus.active
                    ]
                    let hoursDifference = sessionSeconds / 3600
                    let getIdleSession = await sails.sendNativeQuery(
                      `SELECT * FROM tbl_user_session WHERE st_status = $1 AND dt_updated_at < NOW() - INTERVAL '${hoursDifference} HOURS'`,
                      conditionArr
                    )

                    if (getIdleSession.rowCount > 0) {
                      let idleUserArr = []
                      getIdleSession.rows.forEach(element => {
                        idleUserArr.push(element.in_user_session_id)
                      })

                      let idleUpdateSessionArr = [
                        currentDate,
                        sails.config.custom.accountStatus.inactive,
                        idleUserArr
                      ]
                      await sails.sendNativeQuery(
                        `UPDATE tbl_user_session SET dt_updated_at= $1, st_status = $2 WHERE in_user_session_id = ANY($3)`,
                        idleUpdateSessionArr
                      )
                    }
                    // End Removing Idle Session

                    // Update the time if session seconds not exists.
                    if (diffSeconds <= sessionSeconds) {
                      let updateSessionArr = [currentDate, bearer]
                      let updateUserSession = await sails.sendNativeQuery(
                        `UPDATE tbl_user_session SET dt_updated_at= $1 WHERE st_bearer = $2`,
                        updateSessionArr
                      )

                      if (updateUserSession.rowCount > 0) {
                        let updateData = {
                          bearer: bearer
                        }
                        response.status = 'success'
                        response.msg = sails.__('msgSessionUpdated')
                        response.data = updateData
                      } else {
                        response.status = 'error'
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
                        response.status = 'error'
                        response.msg = sails.__('msgSessionExpired')
                        response.code = 'SSN2'
                      } else {
                        response.status = 'error'
                        response.code = 'SSN2'
                      }
                    }
                  } else {
                    // Session expired.
                    response.status = 'error'
                    response.code = 'SSN3'
                    response.msg = sails.__('msgSessionExpired')
                  }
                } else if (req.body.requestFrom === 'admin') {
                  // Admin
                  // #TODO: Admin session updation management goes here.
                  let userSessionDetails = await sails.sendNativeQuery(
                    `select in_admin_user_session_id, in_admin_user_id, st_bearer, st_status, dt_created_at, dt_updated_at from tbl_admin_user_session where st_bearer = $1 and st_status = $2`,
                    [bearer, sails.config.custom.accountStatus.active]
                  )

                  // Update the time if session exists.
                  if (userSessionDetails.rowCount > 0) {
                    let currentDate = new Date(CustomService.currentDate())
                    let lastDate = new Date(
                      userSessionDetails.rows[0].dt_updated_at
                    )

                    let timeDiff = Math.abs(
                      currentDate.getTime() - lastDate.getTime()
                    )
                    let diffSeconds = Math.ceil(timeDiff / 1000)

                    // Start Removing Idle Session
                    // Update session status to inactive which sits idle from 24 hours.
                    let conditionArr = [
                      sails.config.custom.accountStatus.active
                    ]
                    let hoursDifference = sessionSeconds / 3600
                    let getIdleSession = await sails.sendNativeQuery(
                      `SELECT * FROM tbl_admin_user_session WHERE st_status = $1 AND dt_updated_at < NOW() - INTERVAL '${hoursDifference} HOURS'`,
                      conditionArr
                    )

                    if (getIdleSession.rowCount > 0) {
                      let idleUserArr = []
                      getIdleSession.rows.forEach(element => {
                        idleUserArr.push(element.in_admin_user_session_id)
                      })

                      let idleUpdateSessionArr = [
                        currentDate,
                        sails.config.custom.accountStatus.inactive,
                        idleUserArr
                      ]
                      await sails.sendNativeQuery(
                        `UPDATE tbl_admin_user_session SET dt_updated_at= $1, st_status = $2 WHERE in_admin_user_session_id = ANY($3)`,
                        idleUpdateSessionArr
                      )
                    }
                    // End Removing Idle Session

                    // Update the time if session is active.
                    if (diffSeconds <= sessionSeconds) {
                      let updateSessionArr = [currentDate, bearer]
                      let updateUserSession = await sails.sendNativeQuery(
                        `UPDATE tbl_admin_user_session SET dt_updated_at= $1 WHERE st_bearer = $2`,
                        updateSessionArr
                      )

                      if (updateUserSession.rowCount > 0) {
                        let updateData = {
                          bearer: bearer
                        }
                        response.status = 'success'
                        response.msg = sails.__('msgSessionUpdated')
                        response.data = updateData
                      } else {
                        response.status = 'error'
                        response.code = 'SSN1'
                      }
                    } else {
                      // Logged out if session is inactive.
                      let updateSessionArr = [
                        currentDate,
                        sails.config.custom.accountStatus.inactive,
                        bearer
                      ]
                      let updateUserSession = await sails.sendNativeQuery(
                        `UPDATE tbl_admin_user_session SET dt_updated_at= $1, st_status = $2 WHERE st_bearer = $3`,
                        updateSessionArr
                      )

                      if (updateUserSession.rowCount > 0) {
                        response.status = 'error'
                        response.msg = sails.__('msgSessionExpired')
                        response.code = 'SSN2'
                      } else {
                        response.status = 'error'
                        response.code = 'SSN2'
                      }
                    }
                  } else {
                    // Session expired.
                    response.status = 'error'
                    response.code = 'SSN3'
                    response.msg = sails.__('msgSessionExpired')
                  }
                } else {
                  // Session expired.
                  response.status = 'error'
                  response.msg = sails.__('msgDoNotHavePermissionError')
                }
              } else {
                response.status = 'error'
                response.code = 'SSN4'
                response.msg = sails.__('msgSessionExpired')
              }
            }
          }
        } catch (error) {
          console.log(
            '/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/config/http.js Line(278)'
          )
          console.log(error)
          response.msg = await CustomService.errorHandler(
            process.env.NODE_ENV,
            error
          )
        } finally {
          if (response.status === 'success') {
            console.log(
              '/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/config/http.js Line(145)'
            )
            console.log(
              '============== Updated Session Success ==============='
            )
            return next()
          } else {
            console.log(
              '/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/config/http.js Line(145)'
            )
            console.log('|||||||||||| Updated Session Error ||||||||||||')
            res.set({
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            })
            return res.status(200).json(response)
          }
        }
      }
    })()
  }
}
