module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add project open details method.
   * @date 29 Nov 2019
   */
  addProjectOpenDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO public.tbl_project_open_details(in_project_id, in_user_id, st_request_browser, st_browser_version, st_client_os, st_request_ip, dt_created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Exist check project open details method.
   * @date 29 Nov 2019
   */
  checkProjectOpenDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `SELECT in_project_open_id, in_project_id, in_user_id, st_request_browser, st_browser_version, st_client_os, st_request_ip, dt_created_at FROM tbl_project_open_details where in_project_id = $1 and in_user_id = $2 and st_request_browser = $3 and st_browser_version = $4 and st_client_os = $5 and st_request_ip = $6`,
      dataArr
    )
  },
}
