module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the request logs.
   * @date 14 August 2019
   */
  list: async function(listParam) {
    let query = `select rl.in_request_log_id, rl.in_user_id, um.st_email_address, rl.st_request_url, rl.st_request_ip, rl.st_request_from, rl.st_request_browser, rl.st_browser_version, rl.st_client_os, rl.st_request_time from tbl_request_log rl left join tbl_user_master um on um.in_user_id = rl.in_user_id where 1 = 1`
    if (listParam.status !== '') {
      query += ` and st_status = '${listParam.status}'`
    }
    if (listParam.search !== '') {
      query += ` and (st_email_address ILIKE '%${listParam.search}%' or st_request_url ILIKE '%${listParam.search}%' or st_request_ip ILIKE '%${listParam.search}%' or st_request_browser ILIKE '%${listParam.search}%' or st_browser_version ILIKE '%${listParam.search}%' or st_client_os ILIKE '%${listParam.search}%')`
    }

    if (listParam.sort.indexOf('null') > -1) {
      listParam.sort = '-in_request_log_id'
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
  }
}
