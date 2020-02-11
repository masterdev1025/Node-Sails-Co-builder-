module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the skill.
   * @date 05 Dec 2019
   */
  list: async function (listParam) {
    let query = `select in_cms_id, st_cms_title, st_cms_slug, st_cms_description, st_editable_status, st_status, dt_created_at, dt_updated_at from tbl_cms where 1 = 1`
    if (listParam.status !== '') {
      query += ` and st_status = '${listParam.status}'`
    }
    if (listParam.search !== '') {
      query += ` and (st_cms_title ILIKE '%${listParam.search}%' or st_cms_description ILIKE '%${listParam.search}%')`
    }

    if (listParam.sort.indexOf('null') > -1) {
      listParam.sort = '-in_cms_id'
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
   * @date 05 Dec 2019
   */
  isExist: async function (dataArr, editFlag) {
    const query = (editFlag) ? 'and in_cms_id != $3' : ''
    return await sails.sendNativeQuery(
      `select in_cms_id, st_cms_title, st_cms_slug, st_cms_description, st_editable_status, st_status, dt_created_at, dt_updated_at from tbl_cms where st_cms_title ILIKE $1 and st_status != $2 ${query}`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert new record.
   * @date 05 Dec 2019
   */
  add: async function (dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_cms (st_cms_title, st_cms_slug, st_cms_description, st_editable_status, st_status, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch record method.
   * @date 05 Dec 2019
   */
  fetch: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_cms_id, st_cms_title, st_cms_slug, st_cms_description, st_status from tbl_cms where in_cms_id = $1 and st_status = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update record method.
   * @date 05 Dec 2019
   */
  edit: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_cms set st_cms_title = $2, st_cms_description = $3, dt_updated_at = $4 where in_cms_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update status record method.
   * @date 05 Dec 2019
   */
  updateStatus: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_cms set st_status = $1, dt_updated_at = $2 where in_cms_id = $3`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Delete record method.
   * @date 05 Dec 2019
   */
  delete: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_cms set st_status = $1, dt_updated_at = $2 where in_cms_id = ANY($3)`,
      dataArr
    )
  }
}
