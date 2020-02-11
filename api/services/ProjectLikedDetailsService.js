module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get liked project details method.
   * @date 18 Oct 2019
   */
  list: async function (listParam) {
    // let query = `SELECT tpld.in_project_liked_id as in_project_liked_id, pm.in_project_id as in_project_id, pm.st_project_name as st_project_name, pm.st_project_slug as st_project_slug, pm.st_project_description as st_project_description, pm.in_category_id as in_category_id, pm.in_subcategory_id as in_subcategory_id,
    // tc.st_category_name as st_category_name, ts.st_subcategory_name as st_subcategory_name, pm.st_money_involved as st_money_involved, pm.st_money_need as st_money_need, pm.st_project_duration as st_project_duration, pm.st_people_strength as st_people_strength, pm.st_physical_site as st_physical_site, pm.st_address as st_address, tcm.st_country_name as st_country_name, tsm.st_state_name as st_state_name, pm.in_country_id as in_country_id, pm.in_state_id as in_state_id, pm.in_city_id as in_city_id, pm.st_pincode as st_pincode, pm.st_is_activity as st_is_activity, pm.dt_event_start_at as dt_event_start_at, pm.dt_event_end_at as dt_event_end_at, pm.dt_expire_at as dt_expire_at, pm.st_status as st_status, pm.dt_created_at as dt_created_at, pm.dt_updated_at as dt_updated_at, tmpProjMaster.projectCount
    // FROM tbl_project_liked_details tpld
    // left join tbl_project_master pm on pm.in_project_id = tpld.in_project_id
    // left join tbl_category tc on tc.in_category_id = pm.in_category_id
    // left join tbl_subcategory ts on ts.in_subcategory_id = pm.in_subcategory_id
    // left join tbl_country_master tcm on tcm.in_country_id = pm.in_country_id
    // left join tbl_state_master tsm on tsm.in_state_id = pm.in_state_id
    // left join (select count(*) as projectCount, in_user_id from tbl_project_master where st_status = '${sails.config.custom.projectStatus.created}' group by in_user_id ) as tmpProjMaster on tmpProjMaster.in_user_id = pm.in_user_id
    // where 1 = 1`
    let query = `SELECT tpld.in_project_liked_id as in_project_liked_id, pm.in_project_id as in_project_id, pm.st_project_name as st_project_name, pm.st_project_slug as st_project_slug,
	pm.st_project_description as st_project_description, pm.in_category_id as in_category_id, pm.in_subcategory_id as in_subcategory_id,
    tc.st_category_name as st_category_name, tcs.st_subcategory_name as st_subcategory_name, pm.st_money_involved as st_money_involved, pm.st_money_need as st_money_need,
	pm.st_project_duration as st_project_duration, pm.st_people_strength as st_people_strength, pm.st_physical_site as st_physical_site, pm.st_address as st_address,
	tcm.st_country_name as st_country_name, tsm.st_state_name as st_state_name, pm.in_country_id as in_country_id, pm.in_state_id as in_state_id,
	pm.in_city_id as in_city_id, pm.st_pincode as st_pincode, pm.st_is_activity as st_is_activity, pm.dt_event_start_at as dt_event_start_at,
	pm.dt_event_end_at as dt_event_end_at, pm.dt_expire_at as dt_expire_at, pm.st_status as st_status, pm.dt_created_at as dt_created_at,
	pm.dt_updated_at as dt_updated_at, tmpProjMaster.projectCount, array_agg(ts.st_skill_name) as st_skill_name
    FROM tbl_project_liked_details tpld
    left join tbl_project_master pm on pm.in_project_id = tpld.in_project_id
    left join tbl_category tc on tc.in_category_id = pm.in_category_id
    left join tbl_subcategory tcs on tcs.in_subcategory_id = pm.in_subcategory_id
	left join tbl_project_skill_details tsd on tsd.in_project_id = pm.in_project_id
	left join tbl_skill ts on ts.in_skill_id = tsd.in_skill_id
    left join tbl_country_master tcm on tcm.in_country_id = pm.in_country_id
    left join tbl_state_master tsm on tsm.in_state_id = pm.in_state_id
    left join (select count(*) as projectCount, in_user_id from tbl_project_master where st_status = '${sails.config.custom.projectStatus.created}' group by in_user_id ) as tmpProjMaster on tmpProjMaster.in_user_id = pm.in_user_id
    where 1 = 1 group by pm.in_project_id, tpld.in_project_liked_id, tc.st_category_name, tcs.st_subcategory_name, tcm.st_country_name, tsm.st_state_name, tmpProjMaster.projectCount`

    query += ` order by in_project_liked_id desc`

    let totalRows = await sails.sendNativeQuery(query)

    let offset = (listParam.page - 1) * listParam.limit
    query += ` limit ${listParam.limit} offset ${offset}`

    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add project liked details method.
   * @date 18 Oct 2019
   */
  addProjectLikedDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_project_liked_details(in_project_id, in_user_id, dt_created_at) VALUES ($1, $2, $3) returning in_project_liked_id`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description delete project liked details method.
   * @date 18 Oct 2019
   */
  deleteProjectLikedDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `DELETE FROM tbl_project_liked_details WHERE in_project_liked_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description project liked already exist check method.
   * @date 18 Oct 2019
   */
  projectLikedAlreadyExist: async function (dataArr) {
    return await sails.sendNativeQuery(
      `SELECT in_project_liked_id FROM tbl_project_liked_details WHERE in_project_id = $1 and in_user_id = $2`,
      dataArr
    )
  },
  projectLikedNotificationExist: async function (userId, notifierUserId){
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let dataArr = [userId]
      let likeNotificationExistDetail =   await sails.sendNativeQuery(`SELECT tn.in_notification_id, tn.st_notification_description, tn.st_redirect_url, tn.st_status, tn.dt_created_at FROM tbl_notifications as tn LEFT JOIN tbl_notification_module as tnm ON tnm.in_notification_module_id = tn.in_notification_module_id AND tnm.st_notification_module_type_name = 'Project Liked'
      WHERE tn.st_notifier_list @> '[{"id": ${notifierUserId}}]' AND tn.st_status = 'active' and tn.in_sender_id = $1`, dataArr)

      if (likeNotificationExistDetail.rowCount > 0) {
        response.msg = 'User already like project previously.'
      } else {
        response = {
          status: 'success',
          msg: 'User have not send project liked notification.'
        }
      }
    } catch (error) {

      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return response
    }


  }
}
