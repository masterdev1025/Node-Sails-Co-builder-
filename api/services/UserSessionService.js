module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert new user session.
   * @date 11 July 2019
   */
  insertUserSession: async function(dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_user_session(in_user_id, st_bearer, st_client_details, st_browser_name, st_browser_version, st_client_os, st_client_ip, st_continent, st_country_code, st_country, st_state, st_city, st_isp, st_lat, st_lon, st_status, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Verify user token.
   * @date 02 Oct 2019
   */
  verifyUserToken: async function(dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_user_session where st_bearer = $1 AND st_status = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Authentiate user session.
   * @date 15 July 2019
   */
  authenticateUserSession: async function(dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_user_session where st_bearer = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Signed Out user session.
   * @date 15 July 2019
   */
  signOutUserSession: async function(dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_session set st_status = 'inactive', dt_updated_at = $1 where st_bearer = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Remove user's all session.
   * @date 13 Sept 2019
   */
  removeUserSession: async function(dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_session set st_status = 'inactive', dt_updated_at = $1 where in_user_id = $2`,
      dataArr
    )
  }
}
