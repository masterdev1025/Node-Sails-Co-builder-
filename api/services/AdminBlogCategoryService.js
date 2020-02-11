module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the category.
  * @date 06th Feb 2019
   */
  list: async function (listParam) {
    let query = `select in_blog_category_id, st_blog_category, st_status, dt_created_at, dt_updated_at from tbl_blog_category where 1 = 1`
    if (listParam.status !== '') {
      query += ` and st_status = '${listParam.status}'`
    }
    if (listParam.search !== '') {
      query += ` and (st_blog_category ILIKE '%${listParam.search}%')`
    }

    if (listParam.sort.indexOf('null') > -1) {
      listParam.sort = '-in_blog_category_id'
    }

    let sortArr = ['in_blog_category_id', 'dt_created_at']
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
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Already exist check.
   * @date 06th Feb 2019
   */
  isExist: async function (dataArr, editFlag) {
    const query = (editFlag) ? 'and in_blog_category_id != $3' : ''
    return await sails.sendNativeQuery(
      `select in_blog_category_id, st_blog_category, st_status from tbl_blog_category where st_blog_category ILIKE $1 and st_status != $2 ${query}`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert new record.
   * @date 06th Feb 2019
   */
  add: async function (dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_blog_category (st_blog_category, st_status, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4)`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch record method.
   * @date 06th Feb 2019
   */
  fetch: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_blog_category_id, st_blog_category, st_status from tbl_blog_category where in_blog_category_id = $1 and st_status = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update record method.
   * @date 06th Feb 2019
   */
  edit: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_blog_category set st_blog_category = $2, dt_updated_at = $3 where in_blog_category_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update status record method.
   * @date 06th Feb 2019
   */
  updateStatus: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_blog_category set st_status = $1, dt_updated_at = $2 where in_blog_category_id = $3`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Delete record method.
   * @date 06th Feb 2019
   */
  delete: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_blog_category set st_status = $1, dt_updated_at = $2 where in_blog_category_id = ANY($3)`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Check whether blog category is deletable method.
   * @date 06th Feb 2019
   */
  isBlogCatgoryDeletable: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select count(*) from tbl_blog_feed where in_blog_category_id = $1 and st_status = ANY($2)`,
      dataArr
    )
  }
}
