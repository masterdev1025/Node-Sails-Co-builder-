module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch project doers request details method.
   * @date 16th Dec 2019
   */
  fetchDoersProjectRequestDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select dprd.in_doers_project_request_id, dprd.in_project_id, dprd.in_user_id, dprd.st_request_status, dprd.in_reason_id, dprd.st_reject_reason_message, dprd.st_status, dprd.dt_created_at, dprd.dt_updated_at, tr.st_reason_description from tbl_doers_project_request_details dprd left join tbl_reasons tr on tr.in_reason_id = dprd.in_reason_id where dprd.in_project_id = $1 and dprd.in_user_id = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add project doers request details method.
   * @date 07th Oct 2019
   */
  addDoersProjectRequestDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `insert into tbl_doers_project_request_details (in_project_id, in_user_id, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4)`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update project doers request details method.
   * @date 17th Dec 2019
   */
  updateDoersProjectRequestDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `UPDATE tbl_doers_project_request_details SET st_status = $3, st_request_status = $4, in_reason_id = $5, st_reject_reason_message = $6, dt_updated_at = $7 WHERE in_doers_project_request_id = $1 and in_user_id = $2`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update project doers request details method.
   * @date 19th Dec 2019
   */
  updateDoersProjectRequestStatus: async function (dataArr) {
    return await sails.sendNativeQuery(
      `UPDATE tbl_doers_project_request_details SET st_request_status = $3, dt_updated_at = $4 WHERE in_project_id = $1 and in_user_id = $2`, dataArr
    )
  },
}
