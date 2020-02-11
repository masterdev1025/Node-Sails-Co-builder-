module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the skill.
   * @date 02 Oct 2019
   */
  list: async function (listParam) {
    let query = `select in_skill_id, st_skill_name, st_skill_description, st_skill_info, st_status, dt_created_at, dt_updated_at from tbl_skill where 1 = 1`
    if (listParam.status !== '') {
      query += ` and st_status = '${listParam.status}'`
    }
    if (listParam.search !== '') {
      query += ` and (st_skill_name ILIKE '%${listParam.search}%' or st_skill_description ILIKE '%${listParam.search}%')`
    }

    if (listParam.sort.indexOf('null') > -1) {
      listParam.sort = '-in_skill_id'
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
   * @description Already exist check.
   * @date 02 Oct 2019
   */
  isExist: async function (dataArr, editFlag) {
    const query = (editFlag) ? 'and in_skill_id != $3' : ''
    return await sails.sendNativeQuery(
      `select in_skill_id, st_skill_name, st_skill_description, st_skill_info, st_status from tbl_skill where st_skill_name ILIKE $1 and st_status != $2 ${query}`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert new record.
   * @date 02 Oct 2019
   */
  add: async function (dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_skill (st_skill_name, st_skill_description, st_skill_info, st_status, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6)`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch record method.
   * @date 01 Oct 2019
   */
  fetch: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_skill_id, st_skill_name, st_skill_description, st_skill_info, st_status from tbl_skill where in_skill_id = $1 and st_status = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update record method.
   * @date 01 Oct 2019
   */
  edit: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_skill set st_skill_name = $2, st_skill_description = $3 , st_skill_info = $4, dt_updated_at = $5 where in_skill_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update status record method.
   * @date 01 Oct 2019
   */
  updateStatus: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_skill set st_status = $1, dt_updated_at = $2 where in_skill_id = $3`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Delete record method.
   * @date 01 Oct 2019
   */
  delete: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_skill set st_status = $1, dt_updated_at = $2 where in_skill_id = ANY($3)`,
      dataArr
    )
  }
}
