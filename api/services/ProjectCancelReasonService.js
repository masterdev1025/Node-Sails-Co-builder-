module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert project cancel reason.
   * @date 15 Nov 2019
   */
  add: async function (dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO public.tbl_project_cancel_reason(in_project_id, in_user_id, in_admin_user_id, in_reason_id, st_reason_message, dt_created_at) 	VALUES ($1, $2, $3, $4, $5, $6)`, dataArr
    )
  },
}
