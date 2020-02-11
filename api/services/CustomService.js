const moment = require('moment')
const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
var Redis = require('ioredis')

module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Custom error handler.
   * @date 09 July 2019
   */
  errorHandler: function (flag, error) {
    let msg
    switch (flag) {
      case 'development':
        msg =
          error.cause !== undefined
            ? error.cause
            : error.message !== undefined
              ? error.message
              : ''
        break
      case 'production':
        msg =
          error.code !== undefined
            ? error.code
            : error.message !== undefined
              ? error.message
              : ''
        break
      default:
        msg = error.code
        break
    }

    return msg
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Current UTC date.
   * @date 09 July 2019
   */
  currentDate: function () {
    return moment()
      .utc()
      .format()
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Generate Random string.
   * @date 09 July 2019
   */
  randomString: function (length) {
    return Math.random()
      .toString(36)
      .substr(2, length)
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Generate Random string.
   * @date 09 July 2019
   */
  randomNumber: function (length) {
    let randLength = length - 1
    return Math.floor(
      Math.pow(10, randLength) + Math.random() * (9 * Math.pow(10, randLength))
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Make a array of client details.
   * @date 15 July 2019
   */
  clientDetails: function (clientDetailsArr) {
    let clientDetails = clientDetailsArr
    let browserName =
      clientDetailsArr.browserName !== undefined &&
        clientDetailsArr.browserName !== ''
        ? clientDetailsArr.browserName
        : ''
    let browserVersion =
      clientDetailsArr.browserVersion !== undefined &&
        clientDetailsArr.browserVersion !== ''
        ? clientDetailsArr.browserVersion
        : ''
    let clientOs =
      clientDetailsArr.clientOs !== undefined &&
        clientDetailsArr.clientOs !== ''
        ? clientDetailsArr.clientOs
        : ''
    let clientIp =
      clientDetailsArr.clientIp !== undefined &&
        clientDetailsArr.clientIp !== ''
        ? clientDetailsArr.clientIp
        : ''

    return {
      clientDetails: clientDetails,
      browserName: browserName,
      browserVersion: browserVersion,
      clientOs: clientOs,
      clientIp: clientIp
    }
  },
  /**
   * Get requested client details ie. IP, Useragent, Referrer Url
   * @param  {object} req
   * @return {object}
   */
  userLogger: function (req) {
    // Get User ip
    let ip = ''
    if (req.headers['x-forwarded-for']) {
      ip = req.headers['x-forwarded-for'].split(',')[0]
    } else if (req.connection && req.connection.remoteAddress) {
      ip = req.connection.remoteAddress
    } else {
      ip = req.ip
    }

    // var user = {
    //   agent: req.header('user-agent'), // User Agent we get from headers
    //   referrer: req.header('referrer'), //  Likewise for referrer
    //   // ip: req.header('x-forwarded-for') || req.connection.remoteAddress, // Get IP - allow for proxy
    //   ip: ip
    // };
    return ip
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Check reCaptcha with google.
   * @date 09 July 2019
   */
  checkReCaptcha: async function (requestfrom, response) {
    let captchaFlag = 0
    try {
      if (requestfrom === 'client' || requestfrom === 'admin') {
        if (response) {
          let apiUrl =
            sails.config.custom.googleRecaptchaCallUrl +
            '?secret=' +
            sails.config.custom.googleRecaptchaSecretKey +
            '&response=' +
            response
          let axiosResponse = await axios.get(apiUrl)
          //console.log(axiosResponse.data);
          if (
            axiosResponse.data !== undefined &&
            axiosResponse.data.success === true
          ) {
            captchaFlag = 1
          }
        }
      } else {
        captchaFlag = 1
      }
    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return captchaFlag
    }
  },
  fetchUserDetails: async function (req, response) {
    let userDetails = {}
    try {
      if (
        req.headers.authorization !== undefined &&
        req.headers.authorization !== ''
      ) {
        let reqHeader = req.headers.authorization.split(' ')
        let bearer =
          reqHeader.length > 0 &&
            reqHeader[1] !== undefined &&
            reqHeader[1] !== ''
            ? reqHeader[1]
            : ''

        // Verify the session is accessible or not.
        await JwtService.verify(bearer, (err, decoded) => {
          if (err) {
            // console.log(err.name);
            // Nothing goes here.
          } else {
            console.log(
              '/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/api/services/CustomService.js Line(120)'
            )
            console.log(decoded)
            userDetails = decoded
          }
        })
      }
    } catch (error) {
      console.log(
        '/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/api/services/CustomService.js Line(128)'
      )
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return userDetails
    }
  },
  getLocationByIP: async function (ip) {
    // replace static ip with above ip variable
    // axios.get('http://extreme-ip-lookup.com/json/'+ip)

    let response = await axios.get('http://extreme-ip-lookup.com/json/' + ip)

    // console.log('/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/api/services/CustomService.js Line(140)');
    // console.log(response.data);

    let userData = {
      status: 'error',
      msg: 'error',
      data: {
        continent: '',
        countryCode: '',
        country: '',
        state: '',
        city: '',
        isp: '',
        lat: '',
        lon: ''
      }
    }

    if (response.data.status === 'success') {
      userData = {
        status: 'success',
        msg: 'success',
        data: {
          continent:
            response.data.continent !== undefined
              ? response.data.continent.split('\'').join(' ')
              : '',
          countryCode:
            response.data.countryCode !== undefined
              ? response.data.countryCode.split('\'').join(' ')
              : '',
          country:
            response.data.country !== undefined
              ? response.data.country.split('\'').join(' ')
              : '',
          state:
            response.data.region !== undefined
              ? response.data.region.split('\'').join(' ')
              : '',
          city:
            response.data.city !== undefined
              ? response.data.city.split('\'').join(' ')
              : '',
          isp:
            response.data.isp !== undefined
              ? response.data.isp.split('\'').join(' ')
              : '',
          lat:
            response.data.lat !== undefined
              ? response.data.lat.split('\'').join(' ')
              : '',
          lon:
            response.data.lon !== undefined
              ? response.data.lon.split('\'').join(' ')
              : ''
        }
      }
    }
    return userData
  },
  removeFiles(filesArr) {
    // delete fiel from url;
    return filesArr.map(file => {
      fs.unlinkSync(file)
    })
  },
  base64Encode(file) {
    // read binary data
    if (fs.existsSync(file)) {
      const bitmap = fs.readFileSync(file)
      // convert binary data to base64 encoded string
      const base64Img = new Buffer(bitmap).toString('base64')
      return 'data:image/png;base64,' + base64Img
    } else {
      return ''
    }
  },
  encrypt(text) {
    if (text) {
      var key = 'zB&rq_j2x!V3P3zS'
      var cipher = crypto.createCipher('aes-256-cbc', key)
      var crypted = cipher.update(text, 'utf-8', 'hex')
      crypted += cipher.final('hex')
      return crypted
    } else {
      return ''
    }
  },
  decrypt(text) {
    try {
      if (text) {
        var key = 'zB&rq_j2x!V3P3zS'
        var decipher = crypto.createDecipher('aes-256-cbc', key)
        var decrypted = decipher.update(text, 'hex', 'utf-8')
        decrypted += decipher.final('utf-8')
        return decrypted
      } else {
        return ''
      }
    } catch (error) {
      return ''
    }

  },
  convertToSlug(Text) {
    return Text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
  },
  formatDateDMY(date) {
    var strArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    var d = date.getDate()
    var m = strArray[date.getMonth()]
    var y = date.getFullYear()
    return '' + (d <= 9 ? '0' + d : d) + this.nth(d) + ' ' + m + ', ' + y
  },
  nth(d) {
    if (d > 3 && d < 21) { return 'th' }
    switch (d % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  },
  async postProjectValidation(postArr) {
    let validationFields = [
      {
        field: postArr.projectName,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Project Name'),
          'minLength:4': sails.__('msgFieldMinLength', '4', 'project name'),
          'maxLength:255': sails.__('msgFieldMaxLength', '255', 'project name')
        }
      },
      {
        field: postArr.projectDescription,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Project Description')
        }
      },
      {
        field: postArr.projectCategoryId,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Category Selection')
        }
      },
      {
        field: postArr.projectSubcategoryId,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Subcategory Selection')
        }
      },
      {
        field: postArr.projectSkillList,
        rules: {
          isInputArrRequired: sails.__('msgFieldIsRequired', 'Skills Selection')
        }
      },
      {
        field: postArr.projectMoneyInvolved,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Money Involved'),
          isBoolean: sails.__('msgFieldIsBoolean', 'Money Involved')
        }
      },
      {
        field: postArr.projectGiversNeeded,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Project Givers Needed'),
          isBoolean: sails.__('msgFieldIsBoolean', 'Project Givers Needed')
        }
      },
      {
        field: postArr.projectDoersNeeded,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Project Doers Needed'),
          isBoolean: sails.__('msgFieldIsBoolean', 'Project Doers Needed')
        }
      },
      {
        field: postArr.projectDuration,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Project Duration Selection')
        }
      },
      {
        field: postArr.projectPeopleStrength,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Number of Doers Needed'),
          isNumber: sails.__('msgFieldNumeric', 'Number of Doers Needed'),
          'minLength:1': sails.__('msgFieldMinLength', '1', 'number of doers needed'),
          'maxLength:5': sails.__('msgFieldMaxLength', '5', 'number of doers needed')
        }
      },
      {
        field: postArr.projectPhysicalSite,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Project Physical Site'),
          isBoolean: sails.__('msgFieldIsBoolean', 'Project Physical Site')
        }
      },
      {
        field: postArr.projectIsActivity,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Project Activity'),
          isBoolean: sails.__('msgFieldIsBoolean', 'Project Activity')
        }
      },
      {
        field: postArr.projectTermsConditions,
        rules: {
          isInputRequired: sails.__('msgFieldAgreeTermsConditions'),
        }
      },
    ]

    return await ValidationService.validate(validationFields)
  },
  async postProjectMoneyNeedValidation(postArr) {
    let validationFields = [
      {
        field: postArr.projectMoneyNeed,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Amount of Money'),
          isDecimal: sails.__('msgFieldDecimal', 'Amount of Money'),
          'minLength:1': sails.__('msgFieldMinLength', '1', 'amount of money'),
          'maxLength:12': sails.__('msgFieldMaxLength', '12', 'amount of money')
        }
      }
    ]

    return await ValidationService.validate(validationFields)
  },
  async postProjectGiversListValidation(postArr) {
    let validationFields = [
      {
        field: postArr.projectGiversList,
        rules: {
          isInputArrRequired: sails.__('msgFieldIsRequired', 'Project Givers Selection')
        }
      }
    ]

    return await ValidationService.validate(validationFields)
  },
  async postProjectDoersListValidation(postArr) {
    let validationFields = [
      {
        field: postArr.projectDoersList,
        rules: {
          isInputArrRequired: sails.__('msgFieldIsRequired', 'Project Doers Selection')
        }
      }
    ]

    return await ValidationService.validate(validationFields)
  },
  async postProjectAddressValidation(postArr) {
    let validationFields = [
      {
        field: postArr.projectAddress,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Address'),
          'minLength:2': sails.__('msgFieldMinLength', '2', 'address'),
          'maxLength:255': sails.__('msgFieldMaxLength', '255', 'address')
        }
      },
      {
        field: postArr.projectCountryId,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Country selection')
        }
      },
      {
        field: postArr.projectStateId,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'State selection')
        }
      },
      {
        field: postArr.projectCityeId,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'City selection')
        }
      },
      {
        field: postArr.projectPincode,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Pincode'),
          isAlphanumeric: sails.__('msgFieldIsAlphanumeric', 'Pincode'),
          'minLength:4': sails.__('msgFieldMinLength', '4', 'pincode'),
          'maxLength:10': sails.__('msgFieldMaxLength', '10', 'pincode')
        }
      }
    ]

    return await ValidationService.validate(validationFields)
  },
  async postProjectEventValidation(postArr) {
    let validationFields = [
      {
        field: postArr.projectEventStartAt,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Event Start Date'),
          'dateFormat:yyyymmdd': sails.__('msgFieldInvalidDateFormate', 'Event Start Date'),
          isNextDate: sails.__('msgFieldValidDOB', 'Event Start Date')
        }
      },
      {
        field: postArr.projectEventEndAt,
        rules: {
          isInputRequired: sails.__('msgFieldIsRequired', 'Event End Date'),
          'dateFormat:yyyymmdd': sails.__('msgFieldInvalidDateFormate', 'Event End Date'),
          isNextDate: sails.__('msgFieldValidDOB', 'Event End Date')
        }
      }
    ]

    return await ValidationService.validate(validationFields)
  },
  async moveProjectDocuments(postProjectDocumentArr) {
    const postProjectId = postProjectDocumentArr.projectId
    const postProjectDocuments = postProjectDocumentArr.projectDocuments

    let projectDocumentData = await postProjectDocuments.map(async (value) => {
      return await this.moveFile(sails.config.appPath + `/.tmp/uploads/${value.fileName}`, sails.config.appPath + `/assets/uploads`, `/${postProjectId}`, `/documents`)
    })

    return projectDocumentData
  },
  async moveProjectVideos(postProjectDocumentArr) {
    const postProjectId = postProjectDocumentArr.projectId
    const postProjectVideos = postProjectDocumentArr.projectVideos

    let projectVideoData = await postProjectVideos.map(async (value) => {
      return await this.moveFile(sails.config.appPath + `/.tmp/uploads/${value.fileName}`, sails.config.appPath + `/assets/uploads`, `/${postProjectId}`, `/videos`)
    })

    return projectVideoData
  },
  //moves the $file to $dir2
  moveFile(file, defaultPath, dir1, dir2) {
    if (!fs.existsSync(defaultPath + dir1)) {
      fs.mkdirSync(defaultPath + dir1)
    }

    if (!fs.existsSync(defaultPath + dir1 + dir2)) {
      fs.mkdirSync(defaultPath + dir1 + dir2)
    }

    //gets file name and adds it to dir2
    var f = path.basename(file)
    var dest = path.resolve(defaultPath + dir1 + dir2, f)

    if (fs.existsSync(file)) {
      fs.rename(file, dest, (err) => {
        if (err) { throw err }
        else { return true }
      })
    } else {
      return false
    }
  },
  getRedisClient(){
    // let redisClient = new Redis('redis://' + sails.config.custom.redisHost + ':' + sails.config.custom.redisPort + '/' + sails.config.custom.redisDb)
    let redisClient = sails.config.getRedisClient()
    return redisClient
  },
}
