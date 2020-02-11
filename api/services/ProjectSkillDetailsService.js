module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add project skills details method.
   * @date 07 Oct 2019
   */
  addProjectSkillDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `insert into tbl_project_skill_details (in_project_id, in_skill_id, dt_created_at) VALUES ($1, $2, $3)`,
      dataArr
    )
  },
}
