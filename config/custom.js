/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */
var Redis = require('ioredis')
// development, stage, production
let APP_VERSION = process.env.NODE_ENV
// let APP_VERSION_NO = 'V10.4.19-1';

let APP_NAME = 'The CoBuilders'
let APP_URL
let API_URL
let APP_TOKEN_SECONDS
let APP_SESSION_SECONDS
// let APP_EMAIL_HOST;
// let APP_EMAIL_PORT;
// let APP_EMAIL_SECURE;
let APP_EMAIL_USERNAME
let APP_EMAIL_PASSWORD
let APP_NOREPLY_EMAIL
let APP_SUPPORT_EMAIL
// let DB_HOST;
// let DB_DATABASE;
// let DB_USERNAME;
// let DB_PASSWORD;
// let API_CORS;
// let APP_SOCKET_CORS;

// let APP_GOOGLE_RECAPTCHA_SITE_KEY = '6LfkLa0UAAAAALSr8I853jxtBJoHqFLdMA2yuZ1k'; // TheCoBuilders V3 => vish.khush.2k17@gmail.com
// let APP_GOOGLE_RECAPTCHA_SECRET_KEY = '6LfkLa0UAAAAACXqBdDtB6LP02X0kxZ_w11Uwzbr'; // TheCoBuilders V3 => vish.khush.2k17@gmail.com

// let APP_GOOGLE_RECAPTCHA_SITE_KEY = '6Lc-D64UAAAAAEpDO_GVaS0Au_1KuA-dUpoL_Vjh'; // TheCoBuilders V2 => vish.khush.2k17@gmail.com
// let APP_GOOGLE_RECAPTCHA_SECRET_KEY = '6Lc-D64UAAAAABLLiUY5q3TqCL1eUNEOmyg4tp4E'; // TheCoBuilders V2 => vish.khush.2k17@gmail.com

// let APP_GOOGLE_RECAPTCHA_SITE_KEY = '6LeUTa4UAAAAAMfhjcIaAOphTRODkY7Vzcq_RoeD'; // TheCoBuilders V2 => micheal nelson(TheCoBuilders)
// let APP_GOOGLE_RECAPTCHA_SECRET_KEY = '6LeUTa4UAAAAADV8aAwXeZY_BPwKZ99C_3a15kwT'; // TheCoBuilders V2 => micheal nelson(TheCoBuilders)

// let APP_GOOGLE_RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test Key
let APP_GOOGLE_RECAPTCHA_SECRET_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe' // Test Key

let APP_GOOGLE_RECAPTCHA_CALL_URL =
  'https://www.google.com/recaptcha/api/siteverify'

let APP_PAYPAL_CLIENT_ID
let APP_PAYPAL_SECRET

console.log('process.env.BUILD from config: ' + APP_VERSION)
if (APP_VERSION === 'development') {
  // development
  APP_URL = 'http://localhost:8080'
  API_URL = 'http://localhost:1337'
  APP_TOKEN_SECONDS = 2592000 // 30 Days
  APP_SESSION_SECONDS = 21600 // 6 Hours
  APP_EMAIL_PORT = 465
  APP_EMAIL_SECURE = true
  // APP_EMAIL_USERNAME = 'vish.khush.2k17@gmail.com'
  // APP_EMAIL_PASSWORD = 'qdqedxpknptizlcu' // Khushang personal account
  // APP_EMAIL_PASSWORD = 'wxpgkrldjkcmzrwc' // Khushang personal account

  // APP_EMAIL_USERNAME = 'michaelrythms@gmail.com'
  // APP_EMAIL_PASSWORD = 'qwhlvqoyfmgejgqs' // Micheal personal account

  APP_EMAIL_USERNAME = 'info@thecobuilders.com'
  APP_EMAIL_PASSWORD = 'gkbddlhsvgwgvijm' // GSuite info@thecobuilders.com account

  APP_NOREPLY_EMAIL = 'noreply@thecobuilders.com'
  APP_SUPPORT_EMAIL = 'support@thecobuilders.com'
  APP_PAYPAL_CLIENT_ID = 'AUOQ6pK97G5INQg1OyvYhd1FNK17wJ2C5cSv3qY_3p9NqQW60kdfnTEDH0aTGTXvdXmb_NVmrkWQ4VM6'
  APP_PAYPAL_SECRET = 'EGmypJKsIHTYS8b4wjyDFxnUpO_lGxLJKkiJc4ugjv4yDHgpoRqsZSQqmxK_Zk1_H8CGvKo7VTcHwgzL'
  REDIS_HOST = '127.0.0.1'
  REDIS_PORT = '6379'
  REDIS_DB = '4'
  REDIS_CONNECTION_OBJECT = new Redis('redis://' + REDIS_HOST + ':' + REDIS_PORT + '/' + REDIS_DB)
  // let redisClient = new Redis('redis://' + config.redisHost + ':' + config.redisPort + '/' + config.redisDb)
} else if (APP_VERSION === 'stage') {
  // stage
  APP_URL = 'https://stage.thecobuilders.com'
  API_URL = 'https://apistage.thecobuilders.com'
  APP_TOKEN_SECONDS = 2592000 // 30 Days
  APP_SESSION_SECONDS = 21600 // 6 Hours
  APP_EMAIL_PORT = 465
  APP_EMAIL_SECURE = true
  // APP_EMAIL_USERNAME = 'AKIATQJEPLXCK5IOZ45C'
  // APP_EMAIL_PASSWORD = 'BKxYEK69RtG3bL9yM6BsjWglMdkoeAsnr2kFHxN025Je'
  APP_EMAIL_USERNAME = 'info@thecobuilders.com'
  APP_EMAIL_PASSWORD = 'gkbddlhsvgwgvijm' // GSuite info@thecobuilders.com account
  APP_NOREPLY_EMAIL = 'noreply@thecobuilders.com'
  APP_SUPPORT_EMAIL = 'support@thecobuilders.com'
  APP_PAYPAL_CLIENT_ID = 'AUOQ6pK97G5INQg1OyvYhd1FNK17wJ2C5cSv3qY_3p9NqQW60kdfnTEDH0aTGTXvdXmb_NVmrkWQ4VM6'
  APP_PAYPAL_SECRET = 'EGmypJKsIHTYS8b4wjyDFxnUpO_lGxLJKkiJc4ugjv4yDHgpoRqsZSQqmxK_Zk1_H8CGvKo7VTcHwgzL'
  REDIS_HOST = '127.0.0.1'
  REDIS_PORT = '6379'
  REDIS_DB = '4'
  REDIS_CONNECTION_OBJECT = new Redis('redis://' + REDIS_HOST + ':' + REDIS_PORT + '/' + REDIS_DB)
} else {
  // production
  APP_URL = 'https://www.thecobuilders.com'
  API_URL = 'https://api.thecobuilders.com'
  APP_TOKEN_SECONDS = 2592000 // 30 Days
  APP_SESSION_SECONDS = 21600 // 6 Hours
  APP_EMAIL_PORT = 465
  APP_EMAIL_SECURE = true
  // APP_EMAIL_USERNAME = 'info@thecobuilders.com'
  // APP_EMAIL_PASSWORD = 'babbdnntqagtozon'
  APP_EMAIL_USERNAME = 'info@thecobuilders.com'
  APP_EMAIL_PASSWORD = 'gkbddlhsvgwgvijm' // GSuite info@thecobuilders.com account
  APP_NOREPLY_EMAIL = 'noreply@thecobuilders.com'
  APP_SUPPORT_EMAIL = 'support@thecobuilders.com'
  APP_PAYPAL_CLIENT_ID = 'AUOQ6pK97G5INQg1OyvYhd1FNK17wJ2C5cSv3qY_3p9NqQW60kdfnTEDH0aTGTXvdXmb_NVmrkWQ4VM6'
  APP_PAYPAL_SECRET = 'EGmypJKsIHTYS8b4wjyDFxnUpO_lGxLJKkiJc4ugjv4yDHgpoRqsZSQqmxK_Zk1_H8CGvKo7VTcHwgzL'
  REDIS_HOST = '127.0.0.1'
  REDIS_PORT = '6379'
  REDIS_DB = '4'
  REDIS_CONNECTION_OBJECT = new Redis('redis://' + REDIS_HOST + ':' + REDIS_PORT + '/' + REDIS_DB)
}

module.exports.custom = {
  /***************************************************************************
   *                                                                          *
   * Any other custom config this Sails app should use during development.    *
   *                                                                          *
   ***************************************************************************/
  // mailgunDomain: 'transactional-mail.example.com',
  // mailgunSecret: 'key-testkeyb183848139913858e8abd9a3',
  // stripeSecret: 'sk_test_Zzd814nldl91104qor5911gjald',
  // …
  coBuilderName: 'Bukola Michael Nelson',
  appName: APP_NAME,
  appUrl: APP_URL,
  apiUrl: API_URL,
  appEmailUsername: APP_EMAIL_USERNAME,
  appEmailPassword: APP_EMAIL_PASSWORD,
  noreplyEmail: APP_NOREPLY_EMAIL,
  supportEmail: APP_SUPPORT_EMAIL,
  sessionSeconds: APP_SESSION_SECONDS,
  tokenSeconds: APP_TOKEN_SECONDS,
  googleRecaptchaCallUrl: APP_GOOGLE_RECAPTCHA_CALL_URL,
  googleRecaptchaSecretKey: APP_GOOGLE_RECAPTCHA_SECRET_KEY,
  notRequiredAuthArr: [
    // #frontuser
    '/api/user/signin',
    '/api/user/verifyverificationcode',
    '/api/user/signup',
    '/api/user/emailconfirm',
    '/api/user/forgotpassword',
    '/api/user/checkforgotpasswordlink',
    '/api/user/resetpassword',
    '/api/user/emailexist',
    '/api/user/emailnotexist',
    '/api/user/updatesession',
    '/api/user/resendotp',
    '/api/page/fetch', // CMS Pages
    '/api/faq/fetch', // FAQs page
    '/api/admin/user/signin',
    '/api/blog',
    '/api/blog/view/*',
    '/api/blog/subscribe',
    '/api/blog/blogdetail/*',
    '/api/blog/blogdetail/:*',
    '/api/blog/blogdetail/:title'
    //'/api/signout',
    // #admin
    // 'authenticateadminuser',
  ],
  defaultConfig: {
    page: 1,
    limit: 20
  },
  projectDefaultConfig: {
    page: 1,
    limit: 10
  },
  notificationDefaultConfig: {
    page: 1,
    limit: 10
  },
  defaultProfileComplete: 30,
  totalFieldProfileComplete: 70,
  totalFields: 9,
  accountStatus: {
    pending: 'pending',
    active: 'active',
    inactive: 'inactive',
    delete: 'delete'
  },
  commonStatus: {
    active: 'active',
    inactive: 'inactive'
  },
  reasonFor: {
    project: 'project',
    withdrawal: 'withdrawal',
    projectInvitation: 'projectInvitation',
  },
  requestStatus: {
    pending: 'pending',
    accept: 'accept',
    reject: 'reject',
  },
  jobStatus: {
    hired: 'hired',
    closed: 'closed',
    withdrawn: 'withdrawn',
  },
  projectStatus: {
    created: 'created',
    awarded: 'awarded',
    inProgress: 'inProgress',
    review: 'review',
    complete: 'complete',
    autocomplete: 'autocomplete',
    cancel: 'cancel',
    autocancel: 'autocancel'
  },
  proposalStatus: {
    active: 'active',
    review: 'review',
    inProgress: 'inProgress',
    closed: 'closed',
    reject: 'reject',
    archive: 'archive'
  },
  proposalSubmitStatus: {
    manual: 'manual',
    invitation: 'invitation'
  },
  projectPayType: {
    milestone: 'milestone',
    project: 'project'
  },
  projectDuration: {
    1: 'Less than 1 week',
    2: 'Less than 1 month',
    3: '1 to 3 months',
    4: '3 to 6 months',
    5: 'More than 6 months',
  },
  cmsPageStatus: {
    editable: 'editable',
    uneditable: 'uneditable'
  },
  faqPageStatus: {
    editable: 'editable',
    uneditable: 'uneditable'
  },
  paymentStatus: {
    initiated: 'initiated',
    paid: 'paid',
    cancelled: 'cancelled',
    requestedReturn: 'requested_return',
    returned: 'returned',
    pending: 'pending'
  },
  allowedProfileImageTypes: ['image/jpg', 'image/jpeg', 'image/png'],
  allowedDocumentFileSize: 2048000, // 2 MB
  allowedDocumentFileTypes: [
    // Image file (.jpeg, .jpg)
    'image/jpg',
    'image/jpeg',
    'image/pjpeg',
    // Image file (.png)
    'image/png',
    // Image file (.gif)
    'image/gif',
    // PDF file (.pdf)
    'application/pdf',
    // Excel file (.xls, .xlsx)
    'application/excel',
    'application/vnd.ms-excel',
    'application/x-excel',
    'application/x-msexcel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // CSV file (.csv)
    'text/csv',
    // Doc file (.doc, .docx)
    'application/doc',
    'application/ms-doc',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  allowedVideoFileSize: 10240000, // 10 MB
  allowedVideoFileTypes: [
    // Avi video file (.avi)
    'application/x-troff-msvideo',
    'video/avi',
    'video/msvideo',
    'video/x-msvideo',
    // Mov video file (.mov)
    'video/quicktime',
    'video/x-quicktime',
    'image/mov',
    'audio/aiff',
    'audio/x-midi',
    'audio/x-wav',
    // MP4 video file (.mp4)
    'video/mp4',
    // Ogg video file (.ogg)
    'audio/ogg',
    'video/ogg',
    // wmv video file (.wmv)
    'video/x-ms-wmv',
    'video/x-ms-asf',
    // webm video file (.webm)
    'video/webm',
    // mkv video file (.mkv)
    'video/x-matroska'
  ],
  priceDetails: {
    1: '$0 - $200',
    2: '$201 - $500',
    3: '$501 - $1000',
    4: '> $1000',
  },
  paypalClientId: APP_PAYPAL_CLIENT_ID,
  paypalSecret: APP_PAYPAL_SECRET,
  redisHost: REDIS_HOST,
  redisPort: REDIS_PORT,
  redisDb: REDIS_DB,
  redisConnectionObject: REDIS_CONNECTION_OBJECT
}
