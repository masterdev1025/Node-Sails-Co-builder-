module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the subcategory.
   * @date 02 Oct 2019
   */
  list: async function (listParam) {
    let query = `select ts.in_subcategory_id as in_subcategory_id, ts.in_category_id as in_category_id, tc.st_category_name as st_category_name, ts.st_subcategory_name as st_subcategory_name, ts.st_subcategory_description as st_subcategory_description, ts.st_subcategory_info as st_subcategory_info, ts.st_status as st_status, ts.dt_created_at as dt_created_at, ts.dt_updated_at as dt_updated_at from tbl_subcategory ts left join tbl_category tc on tc.in_category_id = ts.in_category_id where tc.st_status = '${sails.config.custom.accountStatus.active}'`
    if (listParam.status !== '') {
      query += ` and st_status = '${listParam.status}'`
    }
    if (listParam.search !== '') {
      query += ` and (st_subcategory_name ILIKE '%${listParam.search}%' or st_subcategory_description ILIKE '%${listParam.search}%')`
    }

    if (listParam.sort.indexOf('null') > -1) {
      listParam.sort = '-in_subcategory_id'
    }

    let sortArr = ['in_subcategory_id', 'dt_created_at']
    if (listParam.sort.indexOf('+') > -1) {
      let field = listParam.sort.replace('+', '')
      query += sortArr.includes(field) ? ` order by ${field} asc` : ` order by lower(${field}) asc`
    } else {
      let field = listParam.sort.replace('-', '')
      query += sortArr.includes(field) ? ` order by ${field} desc` : ` order by lower(${field}) desc`
    }

    let totalRows = await sails.sendNativeQuery(query)

    let offset = (listParam.page - 1) * listParam.limit
    query += ` limit ${listParam.limit} offset ${offset}`

    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
  getActiveCategoryList: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_category_id, st_category_name from tbl_category where st_status = $1`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Already exist check.
   * @date 02 Oct 2019
   */
  isExist: async function (dataArr, editFlag) {
    const query = (editFlag) ? 'and in_subcategory_id != $3' : ''
    return await sails.sendNativeQuery(
      `select in_subcategory_id, in_category_id, st_subcategory_name, st_subcategory_description, st_subcategory_info, st_status from tbl_subcategory where st_subcategory_name ILIKE $1 and st_status != $2 ${query}`,
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
      `INSERT INTO tbl_subcategory (in_category_id, st_subcategory_name, st_subcategory_description, st_subcategory_info, st_status, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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
      `select in_subcategory_id, in_category_id, st_subcategory_name, st_subcategory_description, st_subcategory_info, st_status from tbl_subcategory where in_subcategory_id = $1 and st_status = $2`,
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
      `update tbl_subcategory set in_category_id = $2, st_subcategory_name = $3, st_subcategory_description = $4, st_subcategory_info = $5, dt_updated_at = $6 where in_subcategory_id = $1`,
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
      `update tbl_subcategory set st_status = $1, dt_updated_at = $2 where in_subcategory_id = $3`,
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
      `update tbl_subcategory set st_status = $1, dt_updated_at = $2 where in_subcategory_id = ANY($3)`,
      dataArr
    )
  }
}
