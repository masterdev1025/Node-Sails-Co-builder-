module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch project proposal skill.
   * @date 23 Nov 2019
   */
  fetchProjectProposal: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select pp.*, tr.st_reason_description from tbl_project_proposal pp left join tbl_reasons tr on tr.in_reason_id = pp.in_reason_id where pp.in_project_id = $1 and pp.in_user_id = $2`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert project proposal method.
   * @date 23 Nov 2019
   */
  insertProjectProposal: async function (dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_project_proposal(in_project_id, in_user_id, st_pay_type, in_project_duration, st_cover_letter, st_total_price, st_service_fee, st_earn_price, st_document, st_video, st_status, st_proposal_submit_status, st_job_status, in_reason_id, st_withdraw_reason_message, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) returning in_project_proposal_id`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update project proposal details method.
   * @date 14th Dec 2019
   */
  updateProjectProposal: async function (dataArr) {
    return await sails.sendNativeQuery(
      `UPDATE public.tbl_project_proposal SET st_status = $3, st_job_status = $4, in_reason_id = $5, st_withdraw_reason_message = $6, dt_updated_at = $7 WHERE in_project_proposal_id = $1 and in_user_id = $2`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update project proposal status method.
   * @date 31st Jan 2020
   */
  updateProjectProposalStatus: async function (dataArr) {
    return await sails.sendNativeQuery(
      `UPDATE public.tbl_project_proposal SET st_status = $2, dt_updated_at = $3 WHERE in_project_proposal_id = $1`, dataArr
    )
  },
}
