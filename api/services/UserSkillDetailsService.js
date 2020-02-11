module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add user skills details method.
   * @date 18 Oct 2019
   */
  getSkillsDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_skill_id, st_skill_name, st_skill_description, st_skill_info from tbl_skill where st_status = ANY($1) order by st_skill_name`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add user skills details method.
   * @date 18 Oct 2019
   */
  getUserSkillDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select usd.in_user_skill_id as in_user_skill_id, usd.in_user_id as in_user_id, usd.in_skill_id as in_skill_id, sk.st_skill_name as st_skill_name, usd.dt_created_at as dt_created_at from tbl_user_skill_details usd left join tbl_skill sk on sk.in_skill_id = usd.in_skill_id where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add user skills details method.
   * @date 18 Oct 2019
   */
  addUserSkillDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `insert into tbl_user_skill_details (in_user_id, in_skill_id, dt_created_at) VALUES ($1, $2, $3) returning in_user_skill_id`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description User profile skills exists check method.
   * @date 18 Oct 2019
   */
  userSkillExistsCheck: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_user_skill_id from tbl_user_skill_details where in_user_id = $1 and in_skill_id = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Remove all previous user profile skills method.
   * @date 21 Oct 2019
   */
  removeUserProfileSkills: async function (dataArr) {
    return await sails.sendNativeQuery(
      `delete from tbl_user_skill_details where in_user_id = $1`,
      dataArr
    )
  },
}
