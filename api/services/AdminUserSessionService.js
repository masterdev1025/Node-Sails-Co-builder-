module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert new user session.
   * @date 11 July 2019
   */
  insertUserSession: async function(dataInsertArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_admin_user_session(in_admin_user_id, st_bearer, st_client_details, st_browser_name, st_browser_version, st_client_os, st_client_ip, st_status, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      dataInsertArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Authentiate user session.
   * @date 15 July 2019
   */
  authenticateUserSession: async function(bearerArr) {
    return await sails.sendNativeQuery(
      `SELECT * from tbl_admin_user_session where st_bearer = $1`,
      bearerArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Signed Out user session.
   * @date 15 July 2019
   */
  signOutUserSession: async function(bearerArr) {
    return await sails.sendNativeQuery(
      `UPDATE tbl_admin_user_session set st_status = 'inactive', dt_updated_at = $1 where st_bearer = $2`,
      bearerArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the user sessions.
   * @date 14 August 2019
   */
  list: async function(listParam) {
    let query = `select us.in_user_session_id, us.in_user_id, um.st_first_name, um.st_last_name, um.st_email_address, us.st_browser_name, us.st_browser_version, us.st_client_ip, us.st_client_os, us.st_status, us.dt_created_at, us.dt_updated_at from tbl_user_session us left join tbl_user_master um on us.in_user_id = um.in_user_id where 1 = 1`
    if (listParam.status !== '') {
      query += ` and us.st_status = '${listParam.status}'`
    }
    if (listParam.search !== '') {
      query += ` and (st_first_name ILIKE '%${listParam.search}%' or st_last_name ILIKE '%${listParam.search}%' or st_email_address ILIKE '%${listParam.search}%' or st_browser_name ILIKE '%${listParam.search}%' or st_browser_version ILIKE '%${listParam.search}%' or st_client_ip ILIKE '%${listParam.search}%')`
    }

    if (listParam.sort.indexOf('null') > -1) {
      listParam.sort = '-in_user_id'
    }

    if (listParam.sort.indexOf('+') > -1) {
      let field = listParam.sort.replace('+', '')
      query += ` order by ${field} asc`
    } else {
      let field = listParam.sort.replace('-', '')
      query += ` order by ${field} desc`
    }

    let totalRows = await sails.sendNativeQuery(query)

    let offset = (listParam.page - 1) * listParam.limit
    query += ` limit ${listParam.limit} offset ${offset}`

    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update user session status in user table.
   * @date 14 August 2019
   */
  updateStatus: async function(dataUpdateArr) {
    return await sails.sendNativeQuery(
      `UPDATE tbl_user_session set st_status = $1, dt_updated_at = $2 where in_user_session_id = $3`,
      dataUpdateArr
    )
  }
}
