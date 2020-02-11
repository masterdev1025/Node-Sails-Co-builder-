module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all skill.
   * @date 05 Oct 2019
   */
  list: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_reason_id, st_reason_description from tbl_reasons where in_reason_for = $1 AND st_status = $2 order by in_reason_id asc`, dataArr
    )
  },
}
