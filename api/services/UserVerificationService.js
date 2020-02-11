module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Check verification code if it is exist or not.
   * @date 17 July 2019
   */
  checkUserVerificationCode: async function(dataArr) {
    return await sails.sendNativeQuery(
      `SELECT in_user_verification_code, in_user_id, st_email_address, st_bearer, st_verification_code FROM tbl_user_verification_code WHERE in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Check verification code by email if it is exist or not.
   * @date 1 Oct 2019
   */
  fetchUserVerificationCodeByEmail: async function(dataArr) {
    return await sails.sendNativeQuery(
      `SELECT in_user_verification_code, in_user_id, st_email_address, st_bearer, st_verification_code FROM tbl_user_verification_code WHERE st_email_address = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert new user verification code details.
   * @date 17 July 2019
   */
  insertUserVerficationCode: async function(dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_user_verification_code(in_user_id, st_email_address, st_bearer, st_verification_code, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6)`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update user verification code details.
   * @date 17 July 2019
   */
  updateUserVerficationCode: async function(dataArr) {
    return await sails.sendNativeQuery(
      `UPDATE tbl_user_verification_code SET st_email_address = $2, st_bearer = $3, st_verification_code = $4, dt_updated_at = $5 WHERE in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Verify verification code if it is exist or not.
   * @date 17 July 2019
   */
  verifyVerificationCode: async function(dataArr) {
    return await sails.sendNativeQuery(
      `SELECT in_user_verification_code, in_user_id, st_email_address, st_bearer, st_verification_code FROM tbl_user_verification_code WHERE st_verification_code = $1 AND st_email_address = $2`,
      dataArr
    )
  }
}
