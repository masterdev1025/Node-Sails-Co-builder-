module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the subcategory.
   * @date 02 Oct 2019
   */
  list: async function (listParam) {
    let query = `select tbf.in_blog_feed_id as in_blog_feed_id, tbf.in_blog_category_id as in_blog_category_id, tbc.st_blog_category as st_blog_category, tbf.st_blog_feed_url as st_blog_feed_url, tbf.st_status as st_status, tbf.dt_created_at as dt_created_at, tbf.dt_updated_at as dt_updated_at from tbl_blog_feed tbf left join tbl_blog_category tbc on tbc.in_blog_category_id = tbf.in_blog_category_id where tbc.st_status = '${sails.config.custom.accountStatus.active}'`
    if (listParam.status !== '') {
      query += ` and st_status = '${listParam.status}'`
    }
    if (listParam.search !== '') {
      query += ` and (st_blog_feed_url ILIKE '%${listParam.search}%')`
    }

    if (listParam.sort.indexOf('null') > -1) {
      listParam.sort = '-in_blog_feed_id'
    }

    let sortArr = ['in_blog_feed_id', 'dt_created_at']
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
      `select in_blog_category_id, st_blog_category from tbl_blog_category where st_status = $1`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Already exist check.
   * @date 02 Oct 2019
   */
  isExist: async function (dataArr, editFlag) {
    const query = (editFlag) ? 'and in_blog_feed_id != $3' : ''
    return await sails.sendNativeQuery(
      `select in_blog_feed_id, in_blog_category_id, st_blog_feed_url, st_status from tbl_blog_feed where st_blog_feed_url ILIKE $1 and st_status != $2 ${query}`,
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
      `INSERT INTO tbl_blog_feed (in_blog_category_id, st_blog_feed_url, st_status, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5)`,
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
      `select in_blog_feed_id, in_blog_category_id, st_blog_feed_url, st_status from tbl_blog_feed where in_blog_feed_id = $1 and st_status = $2`,
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
      `update tbl_blog_feed set in_blog_category_id = $2, st_blog_feed_url = $3, dt_updated_at = $4 where in_blog_feed_id = $1`,
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
      `update tbl_blog_feed set st_status = $1, dt_updated_at = $2 where in_blog_feed_id = $3`,
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
      `update tbl_blog_feed set st_status = $1, dt_updated_at = $2 where in_blog_feed_id = ANY($3)`,
      dataArr
    )
  }
}
