let numberRegExp = /^\d+$/
// let decimalRegExp = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/
let decimalRegExp = /^[0-9]+(\.[0-9]{1,2})?$/
let stringRegExp = /^[a-zA-Z]+$/
// let emailRegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
// let emailRegExp = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
let emailRegExp = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
let alphanumericRegExp = /^\w+$/
let passwordRegExp = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,32}$/
let yyyymmddDateFormat = /^(19|20)\d{2}\-(0[1-9]|1[0-2])\-(0[1-9]|1\d|2\d|3[01])$/
let urlRegExp = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i

module.exports = {
  validate: async function (validationRules) {
    let validationFlag = true
    let validationMsg = ''

    let totalValidationRulesCount = validationRules.length
    if (totalValidationRulesCount > 0) {
      for (let rulesIndex = 0; rulesIndex < totalValidationRulesCount; rulesIndex++) {
        let value = validationRules[rulesIndex].field
        let rules = validationRules[rulesIndex].rules

        let extraField = validationRules[rulesIndex].comparePassword !== undefined && validationRules[rulesIndex].comparePassword !== '' ? validationRules[rulesIndex].comparePassword : ''

        let validationResponse = await this.checkValidationRules(rules, value, extraField)
        validationFlag = validationResponse.status
        validationMsg = validationResponse.error

        if (validationResponse.status === false) {
          break
        }
      }
    } else {
      validationFlag = false
      validationMsg = 'Something went wrong with vaildations.'
    }

    return { status: validationFlag, error: validationMsg }
  },
  checkValidationRules: async function (allRules, value, extraField) {
    let validationFlag = true
    let validationMsg = ''

    let rules = _.keys(allRules)
    let messages = _.values(allRules)

    if (rules.length === messages.length) {
      let totalRulesCount = rules.length
      for (let index = 0; index < totalRulesCount; index++) {
        if (rules[index] !== '') {
          let ruleName = rules[index]

          // For minLength and maxLength
          // console.log(rules[index]);
          // console.log((ruleName !== undefined && ruleName !== '' && ruleName.includes(':') && (ruleName.includes('minLength') || ruleName.includes('maxLength'))));
          if (ruleName !== undefined && ruleName !== '' && ruleName.includes(':') && (ruleName.includes('minLength') || ruleName.includes('maxLength'))) {
            let splitData = ruleName.split(':')
            ruleName = splitData[0]
            ruleLength = splitData[1]
          }
          if (ruleName !== undefined && ruleName !== '' && ruleName.includes(':') && ruleName.includes('dateFormat')) {
            let splitData = ruleName.split(':')
            ruleName = splitData[0]
            dateFormat = splitData[1]
          }

          switch (ruleName) {
            case 'isInputRequired':
              validationFlag = await this.validationIsInputRequired(value)
              break
            case 'isInputArrRequired':
              validationFlag = await this.validationIsInputArrRequired(value)
              break
            case 'isNumber':
              validationFlag = await this.validationIsNumber(value)
              break
            case 'isDecimal':
              validationFlag = await this.validationIsDecimal(value)
              break
            case 'isString':
              validationFlag = await this.validationIsString(value)
              break
            case 'isAlphanumeric':
              validationFlag = await this.validationIsAlphanumeric(value)
              break
            case 'isEmail':
              validationFlag = await this.validationIsEmail(value)
              break
            case 'isBoolean':
              validationFlag = await this.validationIsBoolean(value)
              break
            case 'minLength':
              validationFlag = await this.validationMinLength(value, ruleLength)
              break
            case 'maxLength':
              validationFlag = await this.validationMaxLength(value, ruleLength)
              break
            case 'isPassword':
              validationFlag = await this.validationIsPassword(value)
              break
            case 'isUrl':
              validationFlag = await this.validationIsUrl(value)
              break
            case 'isComparePassword':
              validationFlag = await this.validationIsComparePassword(value, extraField)
              break
            case 'isPreviousDate':
              validationFlag = await this.validationIsPreviousDate(value)
              break
            case 'isNextDate':
              validationFlag = await this.validationIsNextDate(value)
              break
            case 'dateFormat':
              validationFlag = await this.validationDateFormat(value, dateFormat)
              break
            default:
              break
          }

          validationMsg = validationFlag ? '' : messages[index]
          // console.log(validationMsg);
          if (validationFlag === false) {
            break
          }
        }
      }

      // console.log({ 'status': validationFlag, 'error': validationMsg });
    } else {
      validationFlag = false
      validationMsg = 'Please pass valid validation parameters.'
    }

    return { status: validationFlag, error: validationMsg }
  },
  validationIsInputRequired: async function (value) {
    return (await (value !== '' && value !== null && value !== undefined)) ? true : false
  },
  validationIsInputArrRequired: async function (value) {
    return (await (value !== '' && value !== null && value !== undefined && value.length > 0)) ? true : false
  },
  validationIsNumber: async function (value) {
    return (await (value.match(numberRegExp) !== null)) ? true : false
  },
  validationIsDecimal: async function (value) {
    return (await (value.match(decimalRegExp) !== null)) ? true : false
  },
  validationIsString: async function (value) {
    return (await (value.match(stringRegExp) !== null)) ? true : false
  },
  validationIsBoolean: async function (value) {
    return (await (typeof value === 'boolean')) ? true : false
  },
  validationIsAlphanumeric: async function (value) {
    return (await (value.match(alphanumericRegExp) !== null)) ? true : false
  },
  validationIsEmail: async function (value) {
    return (await (value.match(emailRegExp) !== null)) ? true : false
  },
  validationMinLength: async function (value, ruleLength) {
    return (await (value !== undefined && value !== '' && value.length >= ruleLength)) ? true : false
  },
  validationMaxLength: async function (value, ruleLength) {
    return (await (value !== undefined && value !== '' && value.length <= ruleLength)) ? true : false
  },
  validationIsPassword: async function (value) {
    return (await (value.match(passwordRegExp) !== null)) ? true : false
  },
  validationIsComparePassword: async function (value, password) {
    return (await (value === password)) ? true : false
  },
  validationDateFormat: async function (value, dateFormat) {
    let regexCheck = ''
    switch (dateFormat) {
      case 'yyyymmdd':
        regexCheck = yyyymmddDateFormat
        break

      default:
        break
    }
    return (await (value.match(regexCheck) !== null)) ? true : false
  },
  validationIsPreviousDate: async function (value) {
    var selectedDate = new Date(value)
    var now = new Date()
    return (await (selectedDate < now)) ? true : false
  },
  validationIsNextDate: async function (value) {
    var selectedDate = new Date(value)
    var now = new Date()
    return (await (selectedDate > now)) ? true : false
  },
  validationIsUrl: async function (value) {
    return (await (value.match(urlRegExp) !== null)) ? true : false
  },
}
