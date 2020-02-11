module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all skill.
   * @date 05 Oct 2019
   */
  fetch: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select st_cms_title, st_cms_description from tbl_cms where st_cms_slug = $1 and st_status = $2`, dataArr
    )
  },
}
