module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert user earning details.
   * @date 9 Sept 2019
   */
  // #TODO: Update user profile settings.
  insertUserProfileSettings: async function (dataInsertArr) {
    return await sails.sendNativeQuery(
      `insert into tbl_user_profile_details (in_user_id, st_earning_private, st_new_project_notification, st_newsletter, st_two_step_verification, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      dataInsertArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert user earning details.
   * @date 9 Sept 2019
   */
  // insertUserProfileSettings: async function (dataInsertArr) {
  //   return await sails.sendNativeQuery(`insert into tbl_user_profile_details (in_user_id, st_earning_private, st_new_project_notification, st_newsletter, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6)`, dataInsertArr);
  // },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update new project notification details.
   * @date 7 Sept 2019
   */
  updateTwoStepVerification: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_profile_details set st_two_step_verification = $2, dt_updated_at = $3 where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Two-step verifiation enable or not.
   * @date 11 July 2019
   */
  twoStepVerificationEnable: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_user_profile_details where in_user_id = $1 AND st_two_step_verification = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user profile settings details from userId.
   * @date 7 Sept 2019
   */
  getUserProfileSettingsDetailById: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_user_profile_details where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Profile settings record exist or not..
   * @date 9 Sept 2019
   */
  profileSettingsExist: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_user_profile_details where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update user earning details.
   * @date 7 Sept 2019
   */
  updateUserEarning: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_profile_details set st_earning_private = $2, dt_updated_at = $3 where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update new project notification details.
   * @date 7 Sept 2019
   */
  updateNewProjectNotification: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_profile_details set st_new_project_notification = $2, dt_updated_at = $3 where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update of receives a CoBuilder Newsletter details.
   * @date 7 Sept 2019
   */
  updateNewsletter: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_profile_details set st_newsletter = $2, dt_updated_at = $3 where in_user_id = $1`,
      dataArr
    )
  }
}
