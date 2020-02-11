/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  '/': { view: 'pages/homepage' },

  /***************************************************************************
   *                                                                          *
   * More custom routes here...                                               *
   * (See https://sailsjs.com/config/routes for examples.)                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the routes in this file, it   *
   * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
   * not match any of those, it is matched against static assets.             *
   *                                                                          *
   ***************************************************************************/
  // 'get /api/user': 'UserController.list',
  // 'get /api/user/:id': 'UserController.list',
  // 'post /api/user': 'UserController.create',
  // 'put /api/user/:id': 'UserController.edit',
  // 'delete /api/user/:id': 'UserController.delete',

  'get /uploads/*': { target: 'ImageController.image', skipAssets: false },
  'get /static/*': { target: 'ImageController.static', skipAssets: false },

  'post /api/user/updatesession': 'UserController.updateSession',

  // ========================= Front Panel =========================
  // Users (Sign In, Sign Out, Forgot Password, Reset Password)
  'post /api/user/signin': 'UserController.signIn',
  'post /api/user/verifyverificationcode': 'UserController.verifyVerificationCode',
  'post /api/user/signout': 'UserController.signOut',
  'post /api/user/signup': 'UserController.signUp',
  'post /api/user/emailconfirm': 'UserController.emailConfirm',
  'post /api/user/forgotpassword': 'UserController.forgotPassword',
  'post /api/user/checkforgotpasswordlink': 'UserController.checkForgotPasswordLink',
  'post /api/user/resetpassword': 'UserController.resetPassword',
  'post /api/user/emailexist': 'UserController.emailExist',
  'post /api/user/emailnotexist': 'UserController.emailNotExist',
  'post /api/user/resendotp': 'UserController.resendOTP',
  'post /api/user/encryptdecrypt': 'UserController.encryptDecrypt',
  // 'post /api/user/getuserdetailbyparam': 'UserController.getUserDetailByParam',
  'post /api/user/fetchdoersskillwise': 'UserController.fetchDoersSkillWise',
  'post /api/user/fetchgiversskillwise': 'UserController.fetchGiversSkillWise',
  'post /api/user/getchatactiveuserlist': 'UserController.getChatActiveUserList',
  'post /api/user/userprofiledetails': 'UserController.userProfileDetails',
  'post /api/user/getuserprofilecategoriesdetails': 'UserController.getUserProfileCategoriesDetails',

  'post /api/user/list': 'UserController.list',

  // Password and Security (Change password)
  'post /api/passwordsecurity/changepassword': 'PasswordSecurityController.changePassword',
  'post /api/passwordsecurity/getpasswordsecuritydetails': 'PasswordSecurityController.getPasswordSecurityDetails',
  'post /api/passwordsecurity/updatetwostepverification': 'PasswordSecurityController.updateTwoStepVerification',

  // Profile Management
  'post /api/profile/getuserprofiledetails': 'ProfileController.getUserProfileDetails',
  'post /api/profile/getprofiledetails': 'ProfileController.getProfileDetails',
  'post /api/profile/updateuserprofileaccount': 'ProfileController.updateUserProfileAccount',
  'post /api/profile/updateusercompanydetails': 'ProfileController.updateUserCompanyDetails',
  'post /api/profile/updateuserprofilelocation': 'ProfileController.updateUserProfileLocation',
  'post /api/profile/updateuserprofilephone': 'ProfileController.updateUserProfilePhone',
  'post /api/profile/verifyuserprofilephone': 'ProfileController.verifyUserProfilePhone',
  'post /api/profile/resendotp': 'ProfileController.resendOTP',
  'post /api/profile/getallcountries': 'ProfileController.getAllCountries',
  'post /api/profile/getstatebycountryid': 'ProfileController.getStateByCountryId',
  'post /api/profile/getcitybystateid': 'ProfileController.getCityByStateId',
  'post /api/profile/uploadprofilepicture': 'ProfileController.uploadProfilePicture',
  'post /api/profile/deleteprofilepicture': 'ProfileController.deleteProfilePicture',

  // Profile Settings Management
  'post /api/profilesettings/getuserprofilesettingsdetails': 'ProfileSettingsController.getUserProfileSettingsDetails',
  'post /api/profilesettings/updateearningprivate': 'ProfileSettingsController.updateEarningPrivate',
  'post /api/profilesettings/updatenewprojectnotification': 'ProfileSettingsController.updateNewProjectNotification',
  'post /api/profilesettings/updatenewsletter': 'ProfileSettingsController.updateNewsletter',

  'post /api/profilesettings/getcategoriesdetails': 'ProfileSettingsController.getCategoriesDetails',
  'post /api/profilesettings/getuserprofilecategoriesdetails': 'ProfileSettingsController.getUserProfileCategoriesDetails',
  'post /api/profilesettings/updateuserprofilecategories': 'ProfileSettingsController.updateUserProfileCategories',

  'post /api/profilesettings/getskillsdetails': 'ProfileSettingsController.getSkillsDetails',
  'post /api/profilesettings/getuserprofileskillsdetails': 'ProfileSettingsController.getUserProfileSkillsDetails',
  'post /api/profilesettings/updateuserprofileskills': 'ProfileSettingsController.updateUserProfileSkills',

  // Project Management
  'post /api/project/list': 'ProjectController.list',
  'post /api/project/posted': 'ProjectController.getPostedList',
  'post /api/project/submitted-proposals': 'ProjectController.getSubmittedProposals',
  'post /api/project/received-propsals': 'ProjectController.getReceivedProposals',
  'post /api/project/project-milestone-details': 'ProjectController.projectMilestoneDetails',
  'post /api/project/updaterecievedproposalstatus': 'ProjectController.updateRecievedProposalStatus',
  'post /api/project/donation-details': 'ProjectController.getDonationDetails',
  'post /api/project/doersprojectinvitations': 'ProjectController.getDoersInvitations',
  'post /api/project/donationinvitations': 'ProjectController.getDonationInvitations',
  'post /api/project/investedproposals': 'ProjectController.getInvestedProposals',
  'post /api/project/getinvestedproposaldetails': 'ProjectController.getInvestedProposalDetails',
  'post /api/project/fetchprojectrelateddata': 'ProjectController.fetchProjectRelatedData',
  'post /api/project/fetchactivesubcategorylist': 'ProjectController.fetchActiveSubcategoryList',
  'post /api/project/addproject': 'ProjectController.addProject',
  'post /api/project/uploaddocument': 'ProjectController.uploadDocument',
  'post /api/project/uploadvideo': 'ProjectController.uploadVideo',
  'post /api/project/projectdetails': 'ProjectController.projectDetails',
  'post /api/project/filterdetails': 'ProjectController.filterDetails',
  'post /api/project/cancelproject': 'ProjectController.cancelProject',
  'post /api/project/projectaskquestions': 'ProjectController.projectAskQuestions',
  'post /api/project/askquestion': 'ProjectController.askQuestion',
  'post /api/project/reply': 'ProjectController.reply',
  'post /api/project/editmessage': 'ProjectController.editMessage',
  'post /api/project/deletemessage': 'ProjectController.deleteMessage',
  'post /api/project/submitproposal': 'ProjectController.submitProposal',
  'post /api/project/openproject': 'ProjectController.openProject',
  'post /api/project/withdrawproposal': 'ProjectController.withdrawProposal',
  'post /api/project/rejectinvitation': 'ProjectController.rejectInvitation',
  'post /api/project/sendoffer': 'ProjectController.sendOffer',

  // Liked Project
  'post /api/projectliked/list': 'ProjectLikedController.list',
  'post /api/projectliked/like': 'ProjectLikedController.addProjectToLiked',
  'post /api/projectliked/dislike': 'ProjectLikedController.deleteProjectFromLiked',

  // Pages (CMS Pages)
  'post /api/page/fetch': 'PageController.fetch',

  // FAQs
  'post /api/faq/fetch': 'FaqController.fetch',

  //blogs
  'post /api/blog': 'BlogController.getBlog',
  'post /api/blog/subscribe': 'BlogController.subscribe',
  'post /api/blog/getComments': 'BlogController.getComments',
  'post /api/blog/addComment': 'BlogController.addComment',
  'post /api/blog/blogdetail': 'BlogController.getBlogDetail',
  'post /api/blog/blogUpdate': 'BlogController.blogCorn',

  //notification
  'post /api/notification/list': 'NotificationController.list',
  'post /api/notification/deletenotification': 'NotificationController.deleteNotification',
  'post /api/notification/getnotification': 'NotificationController.getNotification',
  'post /api/notification/markallnotificationasread': 'NotificationController.markAllNotificationAsRead',
  'post /api/notification/getnotificationmessagefromtemplate': 'NotificationController.getNotificationMessageFromTemplate',

  // ========================= Admin Panel =========================
  'post /api/admin/requestlog/list': 'AdminRequestLogController.list',

  // Dashboard
  'post /api/admin/dashboard/getdata': 'AdminDashboardController.getData',

  // User Management
  'post /api/admin/user/signin': 'AdminUserController.signIn',
  'post /api/admin/user/signout': 'AdminUserController.signOut',
  'post /api/admin/user/list': 'AdminUserController.list',
  'post /api/admin/user/updatestatus': 'AdminUserController.updateStatus',
  'post /api/admin/user/delete': 'AdminUserController.delete',

  // User Session Management
  'post /api/admin/user/session/list': 'AdminUserSessionController.list',
  'post /api/admin/user/session/updatestatus': 'AdminUserSessionController.updateStatus',

  // Category Management
  'post /api/admin/category/list': 'AdminCategoryController.list',
  'post /api/admin/category/add': 'AdminCategoryController.add',
  'post /api/admin/category/fetch': 'AdminCategoryController.fetch',
  'post /api/admin/category/edit': 'AdminCategoryController.edit',
  'post /api/admin/category/updatestatus': 'AdminCategoryController.updateStatus',
  'post /api/admin/category/delete': 'AdminCategoryController.delete',

  // SubCategory Management
  'post /api/admin/subcategory/list': 'AdminSubcategoryController.list',
  'post /api/admin/subcategory/add': 'AdminSubcategoryController.add',
  'post /api/admin/subcategory/fetch': 'AdminSubcategoryController.fetch',
  'post /api/admin/subcategory/getactivecategorylist': 'AdminSubcategoryController.getActiveCategoryList',
  'post /api/admin/subcategory/edit': 'AdminSubcategoryController.edit',
  'post /api/admin/subcategory/updatestatus': 'AdminSubcategoryController.updateStatus',
  'post /api/admin/subcategory/delete': 'AdminSubcategoryController.delete',

  // Skill Management
  'post /api/admin/skill/list': 'AdminSkillController.list',
  'post /api/admin/skill/add': 'AdminSkillController.add',
  'post /api/admin/skill/fetch': 'AdminSkillController.fetch',
  'post /api/admin/skill/edit': 'AdminSkillController.edit',
  'post /api/admin/skill/updatestatus': 'AdminSkillController.updateStatus',
  'post /api/admin/skill/delete': 'AdminSkillController.delete',

  // CMS Management
  'post /api/admin/cms/list': 'AdminCMSController.list',
  'post /api/admin/cms/add': 'AdminCMSController.add',
  'post /api/admin/cms/fetch': 'AdminCMSController.fetch',
  'post /api/admin/cms/edit': 'AdminCMSController.edit',
  'post /api/admin/cms/updatestatus': 'AdminCMSController.updateStatus',
  'post /api/admin/cms/delete': 'AdminCMSController.delete',

  // FAQ Management
  'post /api/admin/faq/list': 'AdminFAQController.list',
  'post /api/admin/faq/add': 'AdminFAQController.add',
  'post /api/admin/faq/fetch': 'AdminFAQController.fetch',
  'post /api/admin/faq/edit': 'AdminFAQController.edit',
  'post /api/admin/faq/updatestatus': 'AdminFAQController.updateStatus',
  'post /api/admin/faq/delete': 'AdminFAQController.delete',

  //payments
  'post /api/payment/clientauth': 'PaymentController.clientAuth',
  'post /api/payment/donate': 'PaymentController.donate',
  'post /api/payment/refund': 'PaymentController.refund',
  'post /api/payment/getcards': 'PaymentController.getCardDetails',
  'post /api/payment/refundcheck': 'PaymentController.checkRefund',
  'post /api/payment/checkpaymentstatus': 'PaymentController.checkPaymentStatus',

  // messages
  'post /joinroom': 'MessageController.joinRoom',
  'post /joinexistingroom': 'MessageController.joinExistingRoom',
  'post /userstartedtyping': 'MessageController.userStartedTyping',
  'post /userstoppedtyping': 'MessageController.userStoppedTyping',
  'post /sendmessage': 'MessageController.sendMessage',
  'post /editmessage': 'MessageController.editMessage',
  'post /deletemessage': 'MessageController.deleteMessage',
  'post /getuserchathistory': 'MessageController.getUserChatHistory',
  'post /userchatstatus': 'MessageController.userChatStatus',
  'post /leaveroom': 'MessageController.leaveRoom',

  // Blog Category Management
  'post /api/admin/blog-category/list': 'AdminBlogCategoryController.list',
  'post /api/admin/blog-category/add': 'AdminBlogCategoryController.add',
  'post /api/admin/blog-category/fetch': 'AdminBlogCategoryController.fetch',
  'post /api/admin/blog-category/edit': 'AdminBlogCategoryController.edit',
  'post /api/admin/blog-category/updatestatus': 'AdminBlogCategoryController.updateStatus',
  'post /api/admin/blog-category/delete': 'AdminBlogCategoryController.delete',

  // Blog Feed Management
  'post /api/admin/blog-feed/list': 'AdminBlogFeedController.list',
  'post /api/admin/blog-feed/add': 'AdminBlogFeedController.add',
  'post /api/admin/blog-feed/fetch': 'AdminBlogFeedController.fetch',
  'post /api/admin/blog-feed/getactivecategorylist': 'AdminBlogFeedController.getActiveCategoryList',
  'post /api/admin/blog-feed/edit': 'AdminBlogFeedController.edit',
  'post /api/admin/blog-feed/updatestatus': 'AdminBlogFeedController.updateStatus',
  'post /api/admin/blog-feed/delete': 'AdminBlogFeedController.delete',
}
