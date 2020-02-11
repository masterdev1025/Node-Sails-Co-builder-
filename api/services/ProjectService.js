module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get project detail method.
   * @date 2nd Jan 2020
   */
  getProjectDetailById: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_project_id, in_user_id, st_project_name, dt_created_at from tbl_project_master where in_project_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get all project listing method.
   * @date 18 Oct 2019
   */
  list: async function (listParam) {
    let tempProjects = []

    // console.log('/var/www/html/thecobuilders/thecobuilders-dev/thecobuilders-api/api/services/ProjectService.js Line(10)')
    // console.log('Categories' + listParam.filter.subCategoryIds.length)
    // console.log('Categories' + listParam.filter.skillIds.length)
    // console.log('Categories' + listParam.filter.locations.length)
    // console.log('Categories' + listParam.filter.price.length)

    // Fetch project according to skills ids.
    if (listParam.filter.subCategoryIds.length > 0 && listParam.filter.skillIds.length > 0 && listParam.filter.locations.length > 0 && listParam.filter.price.length > 0) {
      let tempSubcategoriesIds = listParam.filter.subCategoryIds.join()
      let tempSkillIds = listParam.filter.skillIds.join()
      let tempLocations = listParam.filter.locations.join()
      let tempPrice = parseInt(listParam.filter.price.toString())

      let tempCondition = ''
      switch (tempPrice) {
        case 1:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 0 AND st_money_need <= 200`
          break
        case 2:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 200 AND st_money_need <= 500`
          break
        case 3:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 500 AND st_money_need <= 1000`
          break
        case 4:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 1000`
          break
        default:
          break
      }

      let tempQuery = `select pm.in_project_id from tbl_project_master pm left join tbl_project_skill_details psd on psd.in_project_id = pm.in_project_id left join tbl_user_master tum on tum.in_user_id = pm.in_user_id where pm.st_status NOT IN ('cancel', 'autocancel') AND pm.in_subcategory_id IN (${tempSubcategoriesIds}) AND psd.in_skill_id IN (${tempSkillIds}) AND tum.in_country_id IN (${tempLocations}) AND ${tempCondition} group by pm.in_project_id`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.subCategoryIds.length > 0 && listParam.filter.skillIds.length > 0 && listParam.filter.locations.length > 0) {
      let tempSubcategoriesIds = listParam.filter.subCategoryIds.join()
      let tempSkillIds = listParam.filter.skillIds.join()
      let tempLocations = listParam.filter.locations.join()

      let tempQuery = `select pm.in_project_id from tbl_project_master pm left join tbl_project_skill_details psd on psd.in_project_id = pm.in_project_id left join tbl_user_master tum on tum.in_user_id = pm.in_user_id where pm.st_status NOT IN ('cancel', 'autocancel') AND pm.in_subcategory_id IN (${tempSubcategoriesIds}) AND psd.in_skill_id IN (${tempSkillIds}) AND tum.in_country_id IN (${tempLocations}) group by pm.in_project_id`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.subCategoryIds.length > 0 && listParam.filter.locations.length > 0 && listParam.filter.price.length > 0) {
      let tempSubcategoriesIds = listParam.filter.subCategoryIds.join()
      let tempLocations = listParam.filter.locations.join()
      let tempPrice = parseInt(listParam.filter.price.toString())

      let tempCondition = ''
      switch (tempPrice) {
        case 1:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 0 AND st_money_need <= 200`
          break
        case 2:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 200 AND st_money_need <= 500`
          break
        case 3:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 500 AND st_money_need <= 1000`
          break
        case 4:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 1000`
          break
        default:
          break
      }

      let tempQuery = `select pm.in_project_id from tbl_project_master pm left join tbl_user_master tum on tum.in_user_id = pm.in_user_id where pm.st_status NOT IN ('cancel', 'autocancel') AND pm.in_subcategory_id IN (${tempSubcategoriesIds}) AND tum.in_country_id IN (${tempLocations}) AND ${tempCondition} group by pm.in_project_id`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.skillIds.length > 0 && listParam.filter.locations.length > 0 && listParam.filter.price.length > 0) {
      let tempSkillIds = listParam.filter.skillIds.join()
      let tempLocations = listParam.filter.locations.join()
      let tempPrice = parseInt(listParam.filter.price.toString())

      let tempCondition = ''
      switch (tempPrice) {
        case 1:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 0 AND st_money_need <= 200`
          break
        case 2:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 200 AND st_money_need <= 500`
          break
        case 3:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 500 AND st_money_need <= 1000`
          break
        case 4:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 1000`
          break
        default:
          break
      }

      let tempQuery = `select pm.in_project_id from tbl_project_master pm left join tbl_project_skill_details psd on psd.in_project_id = pm.in_project_id left join tbl_user_master tum on tum.in_user_id = pm.in_user_id where pm.st_status NOT IN ('cancel', 'autocancel') AND psd.in_skill_id IN (${tempSkillIds}) AND tum.in_country_id IN (${tempLocations}) AND ${tempCondition} group by pm.in_project_id`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.subCategoryIds.length > 0 && listParam.filter.skillIds.length > 0) {
      let tempSubcategoriesIds = listParam.filter.subCategoryIds.join()
      let tempSkillIds = listParam.filter.skillIds.join()
      let tempQuery = `select pm.in_project_id from tbl_project_master pm left join tbl_project_skill_details psd on psd.in_project_id = pm.in_project_id where pm.st_status NOT IN ('cancel', 'autocancel') AND pm.in_subcategory_id IN (${tempSubcategoriesIds}) and psd.in_skill_id IN (${tempSkillIds}) group by pm.in_project_id`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.subCategoryIds.length > 0 && listParam.filter.locations.length > 0) {
      let tempSubcategoriesIds = listParam.filter.subCategoryIds.join()
      let tempLocations = listParam.filter.locations.join()
      let tempQuery = `select tpm.in_project_id from tbl_project_master tpm left join tbl_user_master tum on tum.in_user_id = tpm.in_user_id where tpm.st_status NOT IN ('cancel', 'autocancel') AND tpm.in_subcategory_id IN (${tempSubcategoriesIds}) AND tum.in_country_id IN (${tempLocations}) group by tpm.in_project_id`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.subCategoryIds.length > 0 && listParam.filter.price.length > 0) {
      let tempSubcategoriesIds = listParam.filter.subCategoryIds.join()

      let tempPrice = parseInt(listParam.filter.price.toString())
      let tempCondition = ''
      switch (tempPrice) {
        case 1:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 0 AND st_money_need <= 200`
          break
        case 2:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 200 AND st_money_need <= 500`
          break
        case 3:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 500 AND st_money_need <= 1000`
          break
        case 4:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 1000`
          break
        default:
          break
      }

      let tempQuery = `select in_project_id from tbl_project_master where st_status NOT IN ('cancel', 'autocancel') AND in_subcategory_id IN (${tempSubcategoriesIds}) and ${tempCondition} group by in_project_id`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.skillIds.length > 0 && listParam.filter.locations.length > 0) {
      let tempSkillIds = listParam.filter.skillIds.join()
      let tempLocations = listParam.filter.locations.join()
      let tempQuery = `select pm.in_project_id from tbl_project_master pm left join tbl_project_skill_details psd on pm.in_project_id = psd.in_project_id left join tbl_user_master tum on tum.in_user_id = pm.in_user_id left join tbl_country_master tcm on tcm.in_country_id = tum.in_country_id where pm.st_status NOT IN ('cancel', 'autocancel') AND psd.in_skill_id IN (${tempSkillIds}) AND tum.in_country_id IN (${tempLocations}) group by pm.in_project_id`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.skillIds.length > 0 && listParam.filter.price.length > 0) {
      let tempSkillIds = listParam.filter.skillIds.join()

      let tempPrice = parseInt(listParam.filter.price.toString())
      let tempCondition = ''
      switch (tempPrice) {
        case 1:
          tempCondition = `pm.st_money_involved = 'true' AND pm.st_money_need > 0 AND pm.st_money_need <= 200`
          break
        case 2:
          tempCondition = `pm.st_money_involved = 'true' AND pm.st_money_need > 200 AND pm.st_money_need <= 500`
          break
        case 3:
          tempCondition = `pm.st_money_involved = 'true' AND pm.st_money_need > 500 AND pm.st_money_need <= 1000`
          break
        case 4:
          tempCondition = `pm.st_money_involved = 'true' AND pm.st_money_need > 1000`
          break
        default:
          break
      }

      let tempQuery = `select pm.in_project_id from tbl_project_master pm left join tbl_project_skill_details psd on psd.in_project_id = pm.in_project_id where pm.st_status NOT IN ('cancel', 'autocancel') AND ${tempCondition} AND psd.in_skill_id IN (${tempSkillIds}) group by pm.in_project_id`

      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.locations.length > 0 && listParam.filter.price.length > 0) {
      let tempLocations = listParam.filter.locations.join()
      let tempPrice = parseInt(listParam.filter.price.toString())

      let tempCondition = ''
      switch (tempPrice) {
        case 1:
          tempCondition = `pm.st_money_involved = 'true' AND pm.st_money_need > 0 AND pm.st_money_need <= 200`
          break
        case 2:
          tempCondition = `pm.st_money_involved = 'true' AND pm.st_money_need > 200 AND pm.st_money_need <= 500`
          break
        case 3:
          tempCondition = `pm.st_money_involved = 'true' AND pm.st_money_need > 500 AND pm.st_money_need <= 1000`
          break
        case 4:
          tempCondition = `pm.st_money_involved = 'true' AND pm.st_money_need > 1000`
          break
        default:
          break
      }

      let tempQuery = `select pm.in_project_id from tbl_project_master pm left join tbl_user_master tum on tum.in_user_id = pm.in_user_id where pm.st_status NOT IN ('cancel', 'autocancel') AND tum.in_country_id IN (${tempLocations}) AND ${tempCondition} group by pm.in_project_id`

      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.subCategoryIds.length > 0) { // Fetch project according to skills ids.
      let tempSubcategoriesIds = listParam.filter.subCategoryIds.join()
      let tempQuery = `select in_project_id from tbl_project_master where st_status NOT IN ('cancel', 'autocancel') AND in_subcategory_id IN (${tempSubcategoriesIds})`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.skillIds.length > 0) { // Fetch project according to skills ids.
      let tempSkillIds = listParam.filter.skillIds.join()
      let tempQuery = `select psd.in_project_id from tbl_project_master pm left join tbl_project_skill_details psd on pm.in_project_id = psd.in_project_id where pm.st_status NOT IN ('cancel', 'autocancel') AND psd.in_skill_id IN (${tempSkillIds})`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.locations.length > 0) { // Fetch project according to locations.
      let tempLocations = listParam.filter.locations.join()
      let tempQuery = `select tpm.in_project_id from tbl_project_master tpm left join tbl_user_master tum on tum.in_user_id = tpm.in_user_id left join tbl_country_master tcm on tcm.in_country_id = tum.in_country_id where tum.in_country_id IS NOT NULL AND tpm.st_status NOT IN ('cancel', 'autocancel') AND tum.in_country_id IN (${tempLocations})`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    } else if (listParam.filter.price.length > 0) { // Fetch project according to price.
      let tempPrice = parseInt(listParam.filter.price.toString())

      let tempCondition = ''
      switch (tempPrice) {
        case 1:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 0 AND st_money_need <= 200`
          break
        case 2:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 200 AND st_money_need <= 500`
          break
        case 3:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 500 AND st_money_need <= 1000`
          break
        case 4:
          tempCondition = `st_money_involved = 'true' AND st_money_need > 1000`
          break
        default:
          break
      }

      let tempQuery = `select in_project_id from tbl_project_master where st_status NOT IN ('cancel', 'autocancel') AND ${tempCondition}`
      let tempData = await sails.sendNativeQuery(tempQuery)
      if (tempData.rowCount > 0) {
        tempProjects.push(tempData.rows.map((data) => {
          return data.in_project_id
        }))
      }
    }

    let query = `SELECT pm.in_project_id as in_project_id, pm.st_project_name as st_project_name, pm.st_project_slug as st_project_slug, pm.st_project_description as st_project_description,
      pm.in_category_id as in_category_id, pm.in_subcategory_id as in_subcategory_id, tc.st_category_name as st_category_name, tsc.st_subcategory_name as st_subcategory_name, pm.st_document, pm.st_video,
      pm.st_money_involved as st_money_involved, pm.st_money_need as st_money_need, pm.st_project_duration as st_project_duration, pm.st_people_strength as st_people_strength,
      pm.st_physical_site as st_physical_site, pm.st_address as st_address, tcm.st_country_name as st_country_name, tsm.st_state_name as st_state_name,
      pm.in_country_id as in_country_id, pm.in_state_id as in_state_id, pm.in_city_id as in_city_id, pm.st_pincode as st_pincode, pm.st_is_activity as st_is_activity,
      pm.dt_event_start_at as dt_event_start_at, pm.dt_event_end_at as dt_event_end_at, pm.dt_expire_at as dt_expire_at, pm.st_status as st_status,
      pm.dt_created_at as dt_created_at, pm.dt_updated_at as dt_updated_at, tmpProjMaster.projectCount, tmpProjLikedDetail.projectLikedCount, tmpProjQuestion.projectQuestionCount, tmpProjProposal.projectProposalCount, tmpProjOpen.projectOpenCount, array_agg(ts.st_skill_name) as st_skill_name, pld.in_project_liked_id, tcm1.in_country_id as in_user_country_id, tcm1.st_country_name as st_user_country_name, tsm1.in_state_id as in_user_state_id, tsm1.st_state_name as st_user_state_name, um.in_user_id as in_user_id, um.st_first_name as st_first_name, um.st_last_name as st_last_name, um.st_profile_picture as st_profile_picture
    FROM tbl_project_master pm
    left join tbl_category tc on tc.in_category_id = pm.in_category_id
    left join tbl_subcategory tsc on tsc.in_subcategory_id = pm.in_subcategory_id
    left join tbl_project_skill_details tsd on tsd.in_project_id = pm.in_project_id
    left join tbl_skill ts on ts.in_skill_id = tsd.in_skill_id
    right join tbl_skill ts1 on ts1.in_skill_id = tsd.in_skill_id
    left join tbl_project_liked_details pld on pld.in_project_id = pm.in_project_id and pld.in_user_id = ${listParam.userId}
    left join tbl_country_master tcm on tcm.in_country_id = pm.in_country_id
    left join tbl_state_master tsm on tsm.in_state_id = pm.in_state_id
    left join tbl_user_master um on um.in_user_id = pm.in_user_id
    left join tbl_country_master tcm1 on tcm1.in_country_id = um.in_country_id
    left join tbl_state_master tsm1 on tsm1.in_state_id = um.in_state_id
    left join(select count(*) as projectCount, in_user_id from tbl_project_master where st_status = '${sails.config.custom.projectStatus.created}' group by in_user_id) as tmpProjMaster on tmpProjMaster.in_user_id = pm.in_user_id
    left join(select count(*) as projectLikedCount, in_project_id from tbl_project_liked_details group by in_project_id) as tmpProjLikedDetail on tmpProjLikedDetail.in_project_id = pm.in_project_id
    left join(select count(*) as projectQuestionCount, in_project_id from tbl_project_questions where in_parent_id = 0 and st_status = '${sails.config.custom.commonStatus.active}' group by in_project_id) as tmpProjQuestion on tmpProjQuestion.in_project_id = pm.in_project_id
    left join(select count(*) as projectProposalCount, in_project_id from tbl_project_proposal group by in_project_id) as tmpProjProposal on tmpProjProposal.in_project_id = pm.in_project_id
    left join(select count(*) as projectOpenCount, in_project_id from tbl_project_open_details group by in_project_id) as tmpProjOpen on tmpProjOpen.in_project_id = pm.in_project_id
    where 1 = 1`

    if (listParam.status !== '') {
      query += ` and pm.st_status IN ('${listParam.status}')`
    }
    if (listParam.search !== '') {
      query += ` and (st_project_name ILIKE '%${listParam.search}%' or st_project_description ILIKE '%${listParam.search}%')`
    }

    // Fetch sub category wise records.
    // if (listParam.filter.subCategoryIds.length > 0) {
    //   let tempSubcategoryIds = listParam.filter.subCategoryIds.join()
    //   query += ` and (tsc.in_subcategory_id IN ('${tempSubcategoryIds}'))`
    // }

    // Fetch skill wise records using project Ids.
    if (listParam.filter.subCategoryIds.length > 0 || listParam.filter.skillIds.length > 0 || listParam.filter.locations.length > 0 || listParam.filter.price.length > 0) {
      let tempProjectIds = (tempProjects.length > 0) ? tempProjects.join() : 0
      query += ` and (pm.in_project_id IN (${tempProjectIds}))`
    }

    query += ` group by pm.in_project_id, tc.st_category_name, tsc.st_subcategory_name, tcm.st_country_name, tsm.st_state_name, tmpProjMaster.projectCount, tmpProjLikedDetail.projectLikedCount, tmpProjQuestion.projectQuestionCount, tmpProjProposal.projectProposalCount, tmpProjOpen.projectOpenCount, pld.in_project_liked_id, tcm1.in_country_id, tsm1.in_state_id, um.in_user_id`

    if (listParam.field !== '' && listParam.sorttype !== '') {
      let sortArr = ['in_project_id']

      query += sortArr.includes(listParam.field) ? ` order by ${listParam.field} ${listParam.sorttype}` : ` order by lower(${listParam.field}) ${listParam.sorttype}`
    }

    let totalRows = await sails.sendNativeQuery(query)

    let offset = (listParam.page - 1) * listParam.limit
    query += ` limit ${listParam.limit} offset ${offset}`

    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get my categories details method.
   * @date 13 Nov 2019
   */
  myCategories: async function (dataArr) {
    let query = await sails.sendNativeQuery(
      `SELECT tucsd.in_subcategory_id, tsc.st_subcategory_name from tbl_user_category_subcategory_details tucsd left join tbl_subcategory tsc on tsc.in_subcategory_id = tucsd.in_subcategory_id where tucsd.in_user_id = $1 order by tsc.st_subcategory_name asc`,
      dataArr
    )

    if (query.rowCount === 0) {
      query = await sails.sendNativeQuery(
        `SELECT tucsd.in_subcategory_id, tsc.st_subcategory_name from tbl_user_category_subcategory_details tucsd left join tbl_subcategory tsc on tsc.in_subcategory_id = tucsd.in_subcategory_id where 1 = 1 group by tucsd.in_subcategory_id, tsc.st_subcategory_name order by tsc.st_subcategory_name asc`
      )
    }

    return query
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get my skills details method.
   * @date 13 Nov 2019
   */
  mySkills: async function (dataArr) {
    let query = await sails.sendNativeQuery(
      `SELECT tusd.in_skill_id, ts.st_skill_name from tbl_user_skill_details tusd left join tbl_skill ts on ts.in_skill_id = tusd.in_skill_id where tusd.in_user_id = $1 order by ts.st_skill_name`,
      dataArr
    )

    if (query.rowCount === 0) {
      query = await sails.sendNativeQuery(
        `SELECT tusd.in_skill_id, ts.st_skill_name from tbl_user_skill_details tusd left join tbl_skill ts on ts.in_skill_id = tusd.in_skill_id where 1 = 1 group by tusd.in_skill_id, ts.st_skill_name order by ts.st_skill_name`,
      )
    }

    return query
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get my location details method.
   * @date 19 Nov 2019
   */
  locationDetails: async function (dataArr) {
    let query = await sails.sendNativeQuery(
      `select tcm.in_country_id, tcm.st_country_name from tbl_project_master tpm left join tbl_country_master tcm on tcm.in_country_id = tpm.in_country_id where tpm.st_status != ANY($1) AND tpm.in_country_id IS NOT NULL group by tcm.in_country_id, tcm.st_country_name order by tcm.st_country_name asc`,
      dataArr
    )

    return query
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get project details method.
   * @date 08 Nov 2019
   */
  projectDetails: async function (listParam) {
    let query = `SELECT pm.in_project_id as in_project_id, pm.in_user_id as in_user_id, pm.st_project_name as st_project_name, pm.st_project_slug as st_project_slug, pm.st_project_description as st_project_description,
      tc.st_category_name as st_category_name, tsc.st_subcategory_name as st_subcategory_name,
      pm.st_document, pm.st_video, pm.st_money_involved as st_money_involved, pm.st_money_need as st_money_need, pm.st_project_duration as st_project_duration, pm.st_people_strength as st_people_strength,
      pm.st_physical_site as st_physical_site, pm.st_address as st_address, tcm.st_country_name as st_country_name, tsm.st_state_name as st_state_name, tcim.st_city_name,
      pm.st_pincode as st_pincode, pm.st_is_activity as st_is_activity,
      pm.dt_event_start_at as dt_event_start_at, pm.dt_event_end_at as dt_event_end_at, pm.dt_expire_at as dt_expire_at, pm.st_status as st_status,
      pm.dt_created_at as dt_created_at, pm.dt_updated_at as dt_updated_at, tmpProjMaster.projectCount, array_agg(ts.st_skill_name) as st_skill_name, pld.in_project_liked_id, tcm1.st_country_name as st_user_country_name, tsm1.st_state_name as st_user_state_name, um.dt_created_at as dt_user_created_at, um.st_first_name as st_first_name, um.st_last_name as st_last_name, um.st_profile_picture as st_profile_picture
    FROM tbl_project_master pm
    left join tbl_category tc on tc.in_category_id = pm.in_category_id
    left join tbl_subcategory tsc on tsc.in_subcategory_id = pm.in_subcategory_id
    left join tbl_project_skill_details tsd on tsd.in_project_id = pm.in_project_id
    left join tbl_skill ts on ts.in_skill_id = tsd.in_skill_id
    left join tbl_project_liked_details pld on pld.in_project_id = pm.in_project_id and pld.in_user_id = ${listParam.userId}
    left join tbl_country_master tcm on tcm.in_country_id = pm.in_country_id
    left join tbl_state_master tsm on tsm.in_state_id = pm.in_state_id
    left join tbl_city_master tcim on tcim.in_city_id = pm.in_city_id
    left join tbl_user_master um on um.in_user_id = pm.in_user_id
    left join tbl_country_master tcm1 on tcm1.in_country_id = um.in_country_id
    left join tbl_state_master tsm1 on tsm1.in_state_id = um.in_state_id
    left join(select count(*) as projectCount, in_user_id from tbl_project_master where st_status = '${sails.config.custom.projectStatus.created}' group by in_user_id) as tmpProjMaster on tmpProjMaster.in_user_id = pm.in_user_id
    where pm.in_project_id = ${listParam.projectId} group by pm.in_project_id, tc.st_category_name, tsc.st_subcategory_name, tcm.st_country_name, tsm.st_state_name, tcim.st_city_name, tmpProjMaster.projectcount, pld.in_project_liked_id, tcm1.st_country_name, tsm1.st_state_name, um.in_user_id`

    return await sails.sendNativeQuery(query)
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Add project skills details method.
   * @date 07 Oct 2019
   */
  addProject: async function (dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_project_master (in_user_id, st_project_name, st_project_slug, st_project_description, in_category_id, in_subcategory_id, st_document, st_video, st_money_involved, st_money_need, st_project_duration, st_people_strength, st_physical_site, st_address, in_country_id, in_state_id,  in_city_id, st_pincode, st_is_activity, dt_event_start_at, dt_event_end_at, st_givers_needed, st_local_givers, st_doers_needed, st_status, dt_created_at,  dt_updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27) returning in_project_id`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update project status method.
   * @date 15 Nov 2019
   */
  updateProjectStatus: async function (dataArr) {
    return await sails.sendNativeQuery(
      `UPDATE tbl_project_master SET st_status = $2, dt_updated_at = $3 WHERE in_project_id = $1`,
      dataArr
    )
  },
  /**
   * @author Abilash
   * @description get badgers project list.
   * @date 15 Nov 2019
   */
  getBadgesPostedProjects: async function (params) {
    let limit = params.limit
    let offset = (params.page - 1) * params.limit
    let orderBy = 'pm.dt_created_at'
    let order = params.sorttype
    let limitOffset = ` order by ${orderBy} ${order} limit ${limit} offset ${offset}`

    let groupBy = ` group by pm.in_project_id, tc.in_category_id, tsc.in_subcategory_id `

    let where = ` where pm.in_user_id = ${params.userId}`

    if (params.status !== '') {
      where += ` and pm.st_status IN ('${params.status}')`
    }
    if (params.search !== '') {
      where += ` and (st_project_name ILIKE '%${params.search}%')`
    }

    let query = `select pm.in_project_id, count(distinct tpp.in_project_proposal_id) as proposalCount, (select sum(in_amount) as donatedAmount from tbl_transactions where in_project_id = pm.in_project_id), pm.st_project_name, pm.st_money_need, pm.st_status, tc.st_category_name as st_category_name, tsc.st_subcategory_name as st_subcategory_name from tbl_project_master pm`
    query += ` left join tbl_category tc on tc.in_category_id = pm.in_category_id`
    query += ` left join tbl_subcategory tsc on tsc.in_subcategory_id = pm.in_subcategory_id `
    query += ` left join tbl_project_proposal tpp on tpp.in_project_id = pm.in_project_id `
    query += ` ${where} ${groupBy} ${limitOffset}`

    let queryCount = `select ${params.field} from tbl_project_master pm ${where} `

    console.log(query)

    let totalRows = await sails.sendNativeQuery(queryCount)
    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
  /**
   * @author Abilash
   * @description Doers Submitted Proposals List
   * @date 06 Dec 2019
   */
  getDoersSubmittedProposals: async function (params) {
    let limit = params.limit
    let offset = (params.page - 1) * params.limit
    let orderBy = 'pp.dt_created_at'
    let order = params.sorttype

    let where = ` where pp.in_user_id = ${params.userId}`

    if (params.status !== '') {
      where += ` and pp.st_status IN ('${params.status}')`
    }

    if (params.search !== '') {
      where += ` and (pm.st_project_name ILIKE '%${params.search}%')`
    }

    let query = `select pm.${params.field}, pp.st_status, pp.in_project_proposal_id, usr.st_first_name, usr.st_last_name, pm.st_project_name, pm.dt_created_at, pp.dt_created_at as proposteddate from tbl_project_master pm
    join tbl_project_proposal pp on pp.in_project_id = pm.in_project_id
    join tbl_user_master usr on usr.in_user_id = pm.in_user_id
    ${where} order by ${orderBy} ${order}`
    let totalRows = await sails.sendNativeQuery(query)
    query += ` limit ${limit} offset ${offset}`
    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
  /**
   * @author Abilash
   * @description Doers Invitations List
   * @date 06 Dec 2019
   */
  getDoersInvitation: async function (params) {
    let limit = params.limit
    let offset = (params.page - 1) * params.limit
    let orderBy = 'prd.dt_created_at'
    let order = params.sorttype

    let where = ` where prd.in_user_id = ${params.userId}`

    if (params.status !== '') {
      where += ` and prd.st_status IN ('${params.status}')`
    }

    if (params.requestStatus !== '') {
      where += ` and prd.st_request_status IN ('${params.requestStatus}')`
    }

    if (params.search !== '') {
      where += ` and (pm.st_project_name ILIKE '%${params.search}%')`
    }

    let query = `select pm.${params.field}, usr.st_first_name, usr.st_last_name, pm.st_project_name, pm.dt_created_at, prd.dt_created_at as invitedate, prd.dt_updated_at as dt_updated_at from tbl_project_master pm
    join tbl_doers_project_request_details prd on prd.in_project_id = pm.in_project_id
    join tbl_user_master usr on usr.in_user_id = pm.in_user_id
    ${where} order by ${orderBy} ${order}`

    let totalRows = await sails.sendNativeQuery(query)
    query += ` limit ${limit} offset ${offset}`
    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
  /**
   * @author Khushang
   * @description Donation Invitations List
   * @date 13th Dec 2019
   */
  getDonationInvitation: async function (params) {
    let limit = params.limit
    let offset = (params.page - 1) * params.limit
    let orderBy = 'gprd.dt_created_at'
    let order = params.sorttype

    let where = ` where gprd.in_user_id = ${params.userId} and gprd.st_approve='f'`

    if (params.status !== '') {
      where += ` and gprd.st_status IN ('${params.status}')`
    }

    if (params.search !== '') {
      where += ` and (pm.st_project_name ILIKE '%${params.search}%')`
    }

    let query = `select pm.${params.field}, usr.st_first_name, usr.st_last_name, pm.st_project_name, pm.dt_created_at, gprd.st_approve, gprd.dt_created_at as invitedate from tbl_project_master pm
    join tbl_givers_project_request_details gprd on gprd.in_project_id = pm.in_project_id
    join tbl_user_master usr on usr.in_user_id = pm.in_user_id
    ${where} order by ${orderBy} ${order}`

    let totalRows = await sails.sendNativeQuery(query)
    query += ` limit ${limit} offset ${offset}`
    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
  /**
   * @author Khushang
   * @description Invested Proposals List
   * @date 20th Dec 2019
   */
  getInvestedProposals: async function (params) {
    let limit = params.limit
    let offset = (params.page - 1) * params.limit
    let orderBy = 'tt.dt_initiated'
    let order = params.sorttype

    let where = ` where tt.in_user_id = ${params.userId}`

    if (params.status !== '') {
      where += ` and tt.st_status IN ('${params.status}')`
    }

    if (params.search !== '') {
      where += ` and ((pm.st_project_name ILIKE '%${params.search}%') or (tt.st_paypal_id ILIKE '%${params.search}%') or (tt.in_amount::character varying ILIKE '%${params.search}%'))`
    }

    let query = `select um.st_first_name, um.st_last_name, pm.in_user_id, tt.in_transaction_id, pm.${params.field}, pm.st_project_name, pm.st_status as project_status, pm.dt_created_at, tt.in_amount, tt.st_payment_type, tt.st_paypal_id, tt.dt_paypal_create_time, tt.dt_initiated, tt.dt_paid, tt.dt_cancelled, tt.dt_requested_return, tt.dt_returned, tt.st_status from tbl_project_master pm
    join tbl_user_master um on um.in_user_id = pm.in_user_id
    join tbl_transactions tt on tt.in_project_id = pm.in_project_id
    ${where} order by ${orderBy} ${order}`

    let totalRows = await sails.sendNativeQuery(query)
    query += ` limit ${limit} offset ${offset}`
    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
  /**
   * @author Khushang
   * @description Invested Proposals List
   * @date 20th Dec 2019
   */
  getInvestedProposalDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select pm.in_project_id, pm.st_project_name, pm.dt_created_at, tt.in_amount, tt.st_payment_type, tt.st_paypal_id, tt.dt_paypal_create_time, tt.dt_initiated, tt.dt_paid, tt.dt_cancelled, tt.dt_requested_return, tt.dt_returned, tt.st_status from tbl_project_master pm
    join tbl_transactions tt on tt.in_project_id = pm.in_project_id where tt.in_transaction_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang Bhavnagarwala
   * @description Get Project wise received proposals List
   * @date 02nd Jan 2020
   */
  getProjectWiseReceivedProposals: async function (params) {
    let projectId = params.projectId
    let limit = params.limit
    let offset = (params.page - 1) * params.limit
    let orderBy = 'pp.in_project_proposal_id'
    let order = params.sorttype

    let where = ` where pp.in_project_id = ${projectId}`

    if (params.status !== '') {
      where += ` and pp.st_pay_type IN ('${params.status}')`
    }

    if (params.search !== '') {
      where += ` and (pm.st_project_name ILIKE '%${params.search}%')`
    }

    let query = `select pm.${params.field}, pm.st_project_name, um.st_cobuilders_id, um.in_user_id, um.st_first_name, um.st_last_name, pp.in_project_proposal_id, pp.st_pay_type, pp.in_project_duration, pp.st_cover_letter, pp.st_total_price, pp.st_service_fee, pp.st_earn_price, pp.st_status, pp.st_proposal_submit_status, pp.st_job_status, pp.in_reason_id, pp.st_withdraw_reason_message, pm.dt_created_at, pp.dt_created_at as proposteddate, rm.st_reason_description from tbl_project_proposal pp
    left join tbl_project_master pm on pp.in_project_id = pm.in_project_id
    left join tbl_user_master um on um.in_user_id = pp.in_user_id
    left join tbl_reasons rm on rm.in_reason_id = pp.in_reason_id
    ${where} order by ${orderBy} ${order}`

    let totalRows = await sails.sendNativeQuery(query)
    query += ` limit ${limit} offset ${offset}`
    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
  /**
   * @author Khushang Bhavnagarwala
   * @description Get Project wise donation details List
   * @date 13th Jan 2020
   */
  getProjectWiseDonationDetails: async function (params) {
    let projectId = params.projectId
    let limit = params.limit
    let offset = (params.page - 1) * params.limit
    let orderBy = 'tt.in_transaction_id'
    let order = params.sorttype

    let where = ` where tt.in_project_id = ${projectId}`

    if (params.status !== '') {
      where += ` and tt.st_status IN ('${params.status}')`
    }

    if (params.search !== '') {
      where += ` and ((pm.st_project_name ILIKE '%${params.search}%') or (tt.st_paypal_id ILIKE '%${params.search}%') or (tt.in_amount::character varying ILIKE '%${params.search}%'))`
    }

    let query = `select pm.${params.field}, pm.st_project_name, um.st_first_name, um.st_last_name, tt.st_payment_type, tt.in_amount, tt.st_paypal_id, tt.st_payment_method, tt.st_status, tt.dt_paypal_create_time, tt.dt_initiated, tt.dt_paid, tt.dt_cancelled, tt.dt_requested_return, tt.dt_returned from tbl_transactions tt
    join tbl_project_master pm on tt.in_project_id = pm.in_project_id
    join tbl_user_master um on um.in_user_id = tt.in_user_id
    ${where} order by ${orderBy} ${order}`

    let totalRows = await sails.sendNativeQuery(query)
    query += ` limit ${limit} offset ${offset}`
    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
  /**
 * @author Vishnu Divetia
 * @description Return user id array who will get notification | Conditions : not current user && same category && sub category && country id
 * @date 5th Fab 2020
 */
  async getPostProjectNotifierUserList(userId, categoryId, subCategoryId, countryId) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      let dataArr = [userId, categoryId, subCategoryId, countryId]
      let notifierUserListDetails = await sails.sendNativeQuery(`SELECT tum.in_user_id FROM tbl_user_category_subcategory_details AS tucsd
      LEFT JOIN tbl_user_master AS tum ON tum.in_user_id = tucsd.in_user_id where in_category_id = $2 and in_subcategory_id = $3 and in_country_id = $4 and tum.in_user_id != $1 group by tum.in_user_id`, dataArr)
      if (notifierUserListDetails.rowCount > 0){
        // TODO reverify this assignment
        let userIdsArr = notifierUserListDetails.rows.map(item => item.in_user_id )
        response = {
          status: 'success',
          msg: 'Notifier users list get successfully.',
          data: {
            notifierUserList: userIdsArr
          }
        }
      } else {
        response.msg = 'Fail to get notifier userlist.'
      }

    } catch (error) {
      console.log(error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return response
    }

  }
}
