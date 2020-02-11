module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all skill.
   * @date 05 Oct 2019
   */
  insertProjectMilestoneDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_project_milestone_details(in_project_proposal_id, st_milestone_description, st_milestone_date, st_milestone_price, st_status, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch project milestone details.
   * @date 30 Nov 2019
   */
  fetchProjectMilestoneDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select tpmd.* from tbl_project_proposal tpp left join tbl_project_milestone_details tpmd on tpmd.in_project_proposal_id = tpp.in_project_proposal_id where tpp.in_project_id = $1 and tpp.in_user_id = $2 and tpp.st_pay_type = $3 order by tpmd.in_project_milestone_detail_id`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch project milestone details.
   * @date 30 Nov 2019
   */
  fetchAllMilestoneDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_project_milestone_details where in_project_proposal_id = $1 and st_status = $2 order by in_project_milestone_detail_id`, dataArr
    )
  },
}
