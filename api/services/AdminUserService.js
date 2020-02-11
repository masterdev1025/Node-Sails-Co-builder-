module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user details from userId.
   * @date 25 July 2019
   */
  getUserDetailById: async function (dataSearchArr) {
    return await sails.sendNativeQuery(
      `SELECT * from tbl_admin_user_master where in_admin_user_id = $1`,
      dataSearchArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Authentiate user at a time of login.
   * @date 11 July 2019
   */
  authenticateUser: async function (dataSearchArr) {
    return await sails.sendNativeQuery(
      `SELECT * from tbl_admin_user_master where st_email_address = $1 AND st_password = $2`,
      dataSearchArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Email address exists or not.
   * @date 11 July 2019
   */
  emailExist: async function (dataExistArr) {
    return await sails.sendNativeQuery(
      'SELECT in_admin_user_id, st_first_name, st_last_name, st_email_address, st_status from tbl_admin_user_master where st_email_address = $1 and st_status != $2',
      dataExistArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the users.
   * @date 10 August 2019
   */
  list: async function (listParam) {
    let query = `select in_user_id, st_cobuilders_id, st_first_name, st_last_name, st_email_address, st_phone_number, in_country_id, in_state_id, in_city_id, st_status, st_register_at from tbl_user_master where 1 = 1`
    if (listParam.status !== '') {
      query += ` and st_status = '${listParam.status}'`
    }
    if (listParam.search !== '') {
      query += ` and (st_cobuilders_id ILIKE '%${listParam.search}%' or st_first_name ILIKE '%${listParam.search}%' or st_last_name ILIKE '%${listParam.search}%' or st_email_address ILIKE '%${listParam.search}%' or st_phone_number ILIKE '%${listParam.search}%')`
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
   * @description Update user status in user table.
   * @date 10 August 2019
   */
  updateStatus: async function (dataUpdateArr) {
    return await sails.sendNativeQuery(
      `UPDATE tbl_user_master set st_status = $1, dt_updated_at = $2 where in_user_id = $3`,
      dataUpdateArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update user status in user table.
   * @date 10 August 2019
   */
  delete: async function (dataUpdateArr) {
    return await sails.sendNativeQuery(
      `UPDATE tbl_user_master set st_status = $1, dt_updated_at = $2 where in_user_id = ANY($3)`,
      dataUpdateArr
    )
  }
}
