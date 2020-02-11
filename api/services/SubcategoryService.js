module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the subcategory.
   * @date 05 Oct 2019
   */
  fetchActiveSubcategoryList: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_subcategory_id, in_category_id, st_subcategory_name from tbl_subcategory where st_status = $1 and in_category_id = $2`, dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the subcategory by Id.
   * @date 17 Oct 2019
   */
  fetchActiveSubcategoryById: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_category_id, st_category_name from tbl_category where st_status = $1 AND in_subcategory_id = ANY($2)`, dataArr
    )
  },
}
