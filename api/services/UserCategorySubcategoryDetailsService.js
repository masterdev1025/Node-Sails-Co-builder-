module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get all category and subcategory details method.
   * @date 21 Oct 2019
   */
  getCategorySubcategoryDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select tc.in_category_id as in_category_id, tc.st_category_name as st_category_name, ts.in_subcategory_id as in_subcategory_id, ts.st_subcategory_name as st_subcategory_name from tbl_category tc left join tbl_subcategory ts on ts.in_category_id = tc.in_category_id where tc.st_status = ANY($1) and ts.st_status = ANY($2) order by tc.in_category_id`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user profile category and subcategory details of user.
   * @date 17 Oct 2019
   */
  getUserCategorySubcategoryDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select tucs.in_user_category_id as in_user_category_id, tucs.in_category_id as in_category_id, tucs.in_subcategory_id as in_subcategory_id, tucs.in_user_id as in_user_id, tucs.dt_created_at as dt_created_at, tc.st_category_name as st_category_name, ts.st_subcategory_name as st_subcategory_name from tbl_user_category_subcategory_details tucs left join  tbl_category tc on tc.in_category_id = tucs.in_category_id left join tbl_subcategory ts on ts.in_subcategory_id = tucs.in_subcategory_id where tc.st_status = ANY($1) and ts.st_status = ANY($2) and in_user_id = $3 order by tucs.in_category_id`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add user profile categories details method.
   * @date 19 Oct 2019
   */
  addUserCategoryDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `insert into tbl_user_category_subcategory_details (in_category_id, in_subcategory_id, in_user_id, dt_created_at) VALUES ($1, $2, $3, $4) returning in_user_category_id`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description User profile categories exists check method.
   * @date 19 Oct 2019
   */
  userCategoryExistsCheck: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_user_category_id from tbl_user_skill_details where in_user_id = $1 and in_category_id = $2 and in_subcategory_id = $3`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Remove all previous user profile skills method.
   * @date 21 Oct 2019
   */
  removeUserProfileCategories: async function (dataArr) {
    return await sails.sendNativeQuery(
      `delete from tbl_user_category_subcategory_details where in_user_id = $1`,
      dataArr
    )
  },
}
