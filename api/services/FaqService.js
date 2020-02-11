module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all skill.
   * @date 05 Oct 2019
   */
  fetch: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select st_faq_title, st_faq_description from tbl_faq where st_status = $1 order by in_faq_id`, dataArr
    )
  },
}
