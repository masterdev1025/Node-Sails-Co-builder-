module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all questions related to specific project.
   * @date 16th Nov 2019
   */
  list: async function (dataArr) {
    // select vpq.in_project_question_id as in_project_question_id, vpq.in_project_id as in_project_id, vpq.in_user_id as in_user_id, vpq.st_message as st_message, vpq.in_parent_id as in_parent_id, vpq.dt_created_at as dt_created_at, um.st_first_name, um.st_last_name, um.st_profile_picture from view_project_questions vpq left join tbl_user_master um on um.in_user_id = vpq.in_user_id where in_project_id = $1 order by path_info limit $2 offset $3
    return await sails.sendNativeQuery(
      `select vpq.in_project_question_id as in_project_question_id, vpq.in_project_id as in_project_id, vpq.in_user_id as in_user_id, vpq.st_message as st_message, vpq.in_parent_id as in_parent_id, vpq.dt_created_at as dt_created_at, um.st_first_name, um.st_last_name, um.st_profile_picture from view_project_questions vpq left join tbl_user_master um on um.in_user_id = vpq.in_user_id where in_project_id = $1 order by path_info`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add project questions.
   * @date 21th Nov 2019
   */
  add: async function (dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_project_questions(in_project_id, in_parent_id, in_user_id, st_message, st_status, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Edit project questions.
   * @date 21th Nov 2019
   */
  edit: async function (dataArr) {
    return await sails.sendNativeQuery(
      `UPDATE tbl_project_questions SET st_message = $2, dt_updated_at = $3 WHERE in_project_question_id = $1`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update status project questions.
   * @date 21th Nov 2019
   */
  updateStatus: async function (dataArr) {
    return await sails.sendNativeQuery(
      `UPDATE tbl_project_questions SET st_status = $2, dt_updated_at = $3 WHERE in_project_question_id = $1`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Parent question exist or not.
   * @date 20th Dec 2019
   */
  isParentQuestionActive: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_project_question_id, in_user_id from tbl_project_questions where in_project_question_id = $1 and st_status = $2`, dataArr
    )
  }
}
