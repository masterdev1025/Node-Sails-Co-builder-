module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert forgot password request.
   * @date 12 July 2019
   */
  insertForgotPasswordRequest: async function(dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_forgot_password_request(in_user_id, st_email, st_request_token, dt_created_at) VALUES ($1, $2, $3, $4)`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert forgot password request.
   * @date 12 July 2019
   */
  validPasswordResetLink: async function(dataArr) {
    return await sails.sendNativeQuery(
      `select in_forgot_password_id, in_user_id, st_request_token, dt_created_at from tbl_forgot_password_request where st_request_token = $1 and dt_created_at BETWEEN NOW() - INTERVAL '24 HOURS' AND NOW()`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Remove forgot password request.
   * @date 12 July 2019
   */
  removeForgotPasswordLink: async function(dataArr) {
    return await sails.sendNativeQuery(
      `delete from tbl_forgot_password_request where in_forgot_password_id = $1`,
      dataArr
    )
  }
}
