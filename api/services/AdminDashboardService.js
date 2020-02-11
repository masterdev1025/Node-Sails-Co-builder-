module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch all the request logs.
   * @date 14 August 2019
   */
  getData: async function() {
    $usersStatusArr = [[sails.config.custom.accountStatus.active]]
    let totalUsers = await sails.sendNativeQuery(
      `select count(*) from tbl_user_master where st_status = ANY($1)`,
      $usersStatusArr
    )

    $activeUsersStatusArr = [[sails.config.custom.accountStatus.active]]
    let totalActiveUsers = await sails.sendNativeQuery(
      `select count(*) from tbl_user_session where st_status = ANY($1)`,
      $activeUsersStatusArr
    )

    return {
      totalUsersCount: totalUsers.rows[0].count,
      totalActiveUsersCount: totalActiveUsers.rows[0].count
    }
  }
}
