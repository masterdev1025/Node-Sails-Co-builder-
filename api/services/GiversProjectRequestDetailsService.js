module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add project givers details method.
   * @date 07 Oct 2019
   */
  addGiversProjectRequestDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `insert into tbl_givers_project_request_details (in_project_id, in_user_id, st_approve, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5)`,
      dataArr
    )
  },
}
