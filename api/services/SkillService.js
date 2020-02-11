module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all skill.
   * @date 05 Oct 2019
   */
  fetchActiveSkillList: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_skill_id, st_skill_name from tbl_skill where st_status = $1 order by st_skill_name asc`, dataArr
    )
  },
}
