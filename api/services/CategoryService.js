module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the category.
   * @date 05 Oct 2019
   */
  fetchActiveCategoryList: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_category_id, st_category_name from tbl_category where st_status = $1`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the category by Id.
   * @date 17 Oct 2019
   */
  fetchActiveCategoryById: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_category_id, st_category_name from tbl_category where st_status = $1 AND in_category_id = ANY($2)`, dataArr
    )
  },
}
