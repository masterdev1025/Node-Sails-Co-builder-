module.exports = {
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user details from userId.
   * @date 25 July 2019
   */
  getUserDetailById: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_user_master where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user details from email address.
   * @date 1 Oct 2019
   */
  getUserDetailByEmail: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_user_master where st_email_address = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user details from userId.
   * @date 05 Oct 2019
   */
  getUserDetailByParam: async function (dataArr, isAllUsers, skillIds = []) {
    // If isAllUsers true then omit only current user.
    // If isAllUsers false then omit current user and set timezone to either default or current user timezone.
    let condition = ''
    if (isAllUsers) {
      condition = `um.in_user_id != $1 and um.st_status = $2`
    } else {
      let tmpArr = []
      tmpArr.push(dataArr[0])

      // #TODO Use timezone from somewhere specific.
      currentUserData = await sails.sendNativeQuery(
        `select in_user_id, st_cobuilders_id, st_first_name, st_last_name, st_email_address, st_timezone from tbl_user_master where in_user_id = $1`,
        tmpArr
      )

      // #TODO: set default timezone if timezone is not set.
      let timezone = 'IST'
      if (currentUserData.rowCount > 0) {
        timezone = currentUserData.rows[0].st_timezone
      }

      condition = `um.in_user_id != $1 and um.st_status = $2 and um.st_timezone = '${timezone}'`
    }

    if (skillIds.length > 0) {
      // #TODO Use timezone from somewhere specific.
      const usersSkillsWiseData = await sails.sendNativeQuery(
        `select in_user_id from tbl_user_skill_details where in_skill_id = ANY($1) and in_user_id != $2 group by in_user_id`,
        [skillIds, dataArr[0]]
      )

      let userSkillsWiseIds = []
      if (usersSkillsWiseData.rowCount > 0) {
        userSkillsWiseIds = usersSkillsWiseData.rows.map(data => (data.in_user_id))
        condition += ` and um.in_user_id IN (${userSkillsWiseIds})`
      }

      // Just put it inside the above if condition if we want to display other skills user's list.
      // #TODO
      // condition += ` and um.in_user_id IN (${userSkillsWiseIds})`
    }

    // return await sails.sendNativeQuery(
    //   `select in_user_id, st_cobuilders_id, CONCAT(st_first_name, ' ', st_last_name ,' (', st_email_address, ')') as full_name, st_email_address, st_timezone from tbl_user_master where ${condition}`,
    //   dataArr
    // )
    return await sails.sendNativeQuery(
      `select um.in_user_id as in_user_id, um.st_cobuilders_id as st_cobuilders_id, CONCAT(st_first_name, ' ', st_last_name) as full_name, um.st_email_address as st_email_address, um.st_timezone as st_timezone, cm.st_country_name as st_country_name, sm.st_state_name as st_state_name from tbl_user_master um
      left join tbl_country_master cm on cm.in_country_id = um.in_country_id
        left join tbl_state_master sm on sm.in_state_id = um.in_state_id where ${condition}`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Authentiate user at a time of login.
   * @date 11 July 2019
   */
  authenticateUser: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_user_master where st_email_address = $1 AND st_password = $2 AND st_status != $3`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Email address exists or not.
   * @date 11 July 2019
   */
  emailExist: async function (dataArr) {
    return await sails.sendNativeQuery(
      'select in_user_id, st_first_name, st_last_name, st_email_address, st_status from tbl_user_master where st_email_address = $1 and st_status != $2',
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Email address exists or not.
   * @date 11 July 2019
   */
  editEmailExist: async function (dataArr) {
    return await sails.sendNativeQuery(
      'select in_user_id, st_first_name, st_last_name, st_email_address, st_status from tbl_user_master where in_user_id != $1 and st_email_address = $2 and st_status != $3',
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Phone Number exists or not.
   * @date 13 Sept 2019
   */
  editPhoneExist: async function (dataArr) {
    return await sails.sendNativeQuery(
      'select in_user_id, st_first_name, st_last_name, st_phone_number, st_status from tbl_user_master where in_user_id != $1 and st_phone_number = $2 and st_status != $3',
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert Logged in user details.
   * @date 17 Sept 2019
   */
  insertLoggedInUser: async function (
    userId,
    bearer,
    clientDetails,
    locationDetails,
    userIP
  ) {
    let dataInsertArr = [
      userId,
      bearer,
      clientDetails.clientDetails,
      clientDetails.browserName,
      clientDetails.browserVersion,
      clientDetails.clientOs,
      userIP,
      locationDetails.data.continent,
      locationDetails.data.countryCode,
      locationDetails.data.country,
      locationDetails.data.state,
      locationDetails.data.city,
      locationDetails.data.isp,
      locationDetails.data.lat,
      locationDetails.data.lon,
      'active',
      CustomService.currentDate(),
      CustomService.currentDate()
    ]

    // Insert user session history.
    return await UserSessionService.insertUserSession(dataInsertArr)
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Insert new user.
   * @date 12 July 2019
   */
  insertUser: async function (dataArr) {
    return await sails.sendNativeQuery(
      `INSERT INTO tbl_user_master(st_first_name, st_last_name, st_email_address, st_password, st_phone_number, in_country_id, in_state_id, in_city_id, st_verification_code, st_status, st_phone_verified, in_terms_and_conditions, st_register_at, dt_created_at, dt_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update user password in user table.
   * @date 12 July 2019
   */
  updateUserPassword: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_password = $1, dt_updated_at = $2 where in_user_id = $3 and st_status = $4`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Email confirmation check.
   * @date 24 July 2019
   */
  emailConfirmCheck: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_user_master where st_verification_code = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Email confirmation status change.
   * @date 24 July 2019
   */
  changeEmailConfirmationStatus: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_status = $1, dt_updated_at = $2 where st_verification_code = $3`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Email confirmation check.
   * @date 24 July 2019
   */
  phoneNumberVerifiedCheck: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_user_master where in_user_id = $1 and st_phone_verified = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user details from userId.
   * @date 17 July 2019
   */
  currentPasswordCheck: async function (dataSearchArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_user_master where in_user_id = $1 AND st_password = $2`,
      dataSearchArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user profile settings details from userId.
   * @date 14 Sept 2019
   */
  getUserAndProfileDetailById: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select st_cobuilders_id, st_phone_verified, upd.st_two_step_verification from tbl_user_master um left join tbl_user_profile_details upd on um.in_user_id = upd.in_user_id where um.in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user details from userId.
   * @date 27 Aug 2019
   */
  getUserProfileDetailById: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select st_cobuilders_id, st_first_name, st_last_name, st_email_address, st_company_name, st_business_title, st_website, st_about,
    st_country_code, st_phone_number, st_profile_picture, dt_dob, st_verification_code, st_phone_verification_code, st_status, st_phone_verified, in_terms_and_conditions,
    st_address, st_country_name, st_state_name, st_city_name, st_pincode, st_timezone, um.in_country_id, um.in_state_id, um.in_city_id, TO_CHAR(dt_dob, 'yyyy-mm-dd') as dt_dob, dt_created_at
    from tbl_user_master um
    left join tbl_country_master cm ON cm.in_country_id = um.in_country_id
    left join tbl_state_master sm ON sm.in_state_id = um.in_state_id
    left join tbl_city_master cim ON cim.in_city_id = um.in_city_id where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user details from userId.
   * @date 27 Aug 2019
   */
  getPublicUserProfileDetailById: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select COUNT(pm.in_project_id) as project_create_count, sum(case when pm.st_status = 'created' then 1 else 0 end) as createdProejct, sum(case when pm.st_status = 'complete' then 1 else 0 end) as completedProject, sum(case when pm.st_status = 'cancel' then 1 else 0 end) as cancelProject, (SELECT sum(in_amount) as in_amount FROM tbl_transactions where st_status = 'paid' and in_user_id = $1) as donatedAmount, (select array_agg(ts.st_skill_name) from tbl_user_skill_details tusd left join tbl_skill ts on tusd.in_skill_id = ts.in_skill_id where tusd.in_user_id = $1) as user_skills, st_cobuilders_id, st_first_name, st_last_name, st_email_address, st_company_name, st_business_title, st_website, st_about, st_country_code, st_phone_number, st_profile_picture, um.st_address, st_country_name, st_state_name, st_city_name, um.st_pincode, um.in_country_id, um.in_state_id, um.in_city_id, TO_CHAR(dt_dob, 'yyyy-mm-dd') as dt_dob, um.dt_created_at
    from tbl_user_master um
    left join tbl_country_master cm ON cm.in_country_id = um.in_country_id
    left join tbl_state_master sm ON sm.in_state_id = um.in_state_id
    left join tbl_city_master cim ON cim.in_city_id = um.in_city_id
    left join tbl_project_master pm ON (pm.in_user_id = um.in_user_id)
	  where um.in_user_id = $1 group by um.in_user_id, cm.in_country_id, sm.in_state_id, cim.in_city_id`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update user details.
   * @date 27 Aug 2019
   */
  updateUserAccountDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_first_name = $2, st_last_name = $3, st_email_address = $4, dt_dob = $5, dt_updated_at = $6 where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update user location details.
   * @date 27 Aug 2019
   */
  updateUserLocationDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_address = $2, in_country_id = $3, in_state_id = $4, in_city_id = $5, st_pincode = $6, st_timezone = $7, dt_updated_at = $8 where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update user company details.
   * @date 18th Jan 2020
   */
  updateUserCompanyDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_company_name = $2, st_business_title = $3, st_website = $4, st_about = $5, dt_updated_at = $6 where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update user phone.
   * @date 13 Sept 2019
   */
  updateUserPhoneDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_country_code = $2, st_phone_number = $3, dt_updated_at = $4 where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update phone verification code is exists or not.
   * @date 14 Sept 2019
   */
  verificationCodeExist: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select in_user_id, st_phone_verification_code from tbl_user_master where in_user_id = $1 and st_phone_verification_code = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Phone verification status change.
   * @date 14 Sept 2019
   */
  changePhoneVerificatonStatus: async function (updateStatusArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_phone_verification_code = $2, st_phone_verified = $3, dt_updated_at = $4 where in_user_id = $1`,
      updateStatusArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Verify user phone.
   * @date 14 Sept 2019
   */
  verifyUserPhoneDetails: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_phone_verified = $2, st_phone_verification_code = null, dt_updated_at = $3 where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update user details.
   * @date 27 Aug 2019
   */
  resetUserAccountonEmailChange: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_verification_code = $2, st_status = $3, dt_updated_at = $4 where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update user phone details.
   * @date 27 Aug 2019
   */
  resetUserAccountonPhoneChange: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_phone_verification_code = $2, st_phone_verified = $3, dt_updated_at = $4 where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get all country details.
   * @date 4th Sept 2019
   */
  getAllCountries: async function () {
    return await sails.sendNativeQuery(`select * from tbl_country_master`)
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get country details by Id.
   * @date 4th Sept 2019
   */
  getCountryById: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_country_master where in_country_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get state details by country id.
   * @date 4th Sept 2019
   */
  getStateByCountryId: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_state_master where in_country_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get city details by state id.
   * @date 4th Sept 2019
   */
  getCityByStateId: async function (dataArr) {
    return await sails.sendNativeQuery(
      `select * from tbl_city_master where in_state_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Update profile picture.
   * @date 27th Sept 2019
   */
  setUserProfilePicture: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_profile_picture = $1 where in_user_id = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Remove profile picture.
   * @date 30th Sept 2019
   */
  deleteUserProfilePicture: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_user_master set st_profile_picture = '' where in_user_id = $1`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch doers detail skill wise.
   * @date 06 Nov 2019
   */
  fetchDoersSkillWiseList: async function (req, isAllGivers, doersSkillIdWise) {
    // userListing (Users listing without current user.)
    let fetchUserListing = []
    let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

    if (fetchUserDetails.userId !== undefined) {
      let userId = fetchUserDetails.userId

      let dataArr = [userId, sails.config.custom.accountStatus.active]
      tempUserData = await UserService.getUserDetailByParam(dataArr, isAllGivers, doersSkillIdWise)
      if (tempUserData.rowCount) {
        fetchUserListing = tempUserData.rows
      }
    }
    return fetchUserListing
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Fetch givers detail skill wise.
   * @date 06 Nov 2019
   */
  fetchGiversSkillWiseList: async function (req, isAllDoers, giversSkillIdWise) {
    // userListing (Users listing without current user.)
    let fetchUserListing = []
    let fetchUserDetails = await CustomService.fetchUserDetails(req, req.body.response)

    if (fetchUserDetails.userId !== undefined) {
      let userId = fetchUserDetails.userId

      let dataArr = [userId, sails.config.custom.accountStatus.active]
      tempUserData = await UserService.getUserDetailByParam(dataArr, isAllDoers, giversSkillIdWise)
      if (tempUserData.rowCount) {
        fetchUserListing = tempUserData.rows
      }
    }
    return fetchUserListing
  },
  /**
 * @author Vishnu S. Divetia
 * @description get active user list
 * @date 28 December 2019
 */
  getChatActiveUserList: async function (dataArr) {
    // return await sails.sendNativeQuery(
    //   `select st_cobuilders_id, st_first_name, st_last_name, st_profile_picture from tbl_user_master where st_status = $1 and in_user_id != $2`,
    //   dataArr
    // )
    return await sails.sendNativeQuery(
      `select tmp_group.in_chat_room_id, tmp_group.st_room_type, tmp_group.st_chat_room_name, tmp_group.st_message, max(tmp_group.st_profile_picture) as st_profile_picture ,
	      max(tmp_group.dt_created_at) as dt_created_at, max(tmp_group.in_chat_message_id) as message_id from (
        select test.in_chat_room_id,
        test.st_room_type,
        (CASE
            WHEN test.st_room_type = 'multiple' THEN tcr.st_chat_room_name
            ELSE concat(tum.st_first_name,' ',tum.st_last_name)
        END
        ) as st_chat_room_name,
        tum.st_cobuilders_id,
        tum.st_profile_picture,
            tcrd.in_user_id as userTwo,
            tbl_tmp_message.st_message,
        tbl_tmp_message.dt_created_at,
        (CASE
            WHEN tbl_tmp_message.in_chat_message_id is null  THEN 0
            ELSE tbl_tmp_message.in_chat_message_id
        END) as in_chat_message_id
        from (
          select in_user_id, in_chat_room_id,st_room_type from tbl_chat_room_details
          where in_user_id = $2
          group by in_user_id, in_chat_room_id,st_room_type) as test
        LEFT JOIN tbl_chat_room_details as tcrd ON (tcrd.in_chat_room_id = test.in_chat_room_id)
        LEFT JOIN tbl_chat_rooms as tcr ON test.in_chat_room_id = tcr.in_chat_room_id
        LEFT JOIN tbl_user_master as tum ON tum.in_user_id = tcrd.in_user_id
        LEFT JOIN (
			    select in_chat_message_id, in_chat_room_id, st_message, dt_created_at from (
  			  	select in_chat_message_id, in_chat_room_id, dt_created_at ,st_message, row_number() over (partition by in_chat_room_id order by in_chat_message_id desc) as rn
  					  from tbl_chat_messages where st_status = 'active') t where rn = 1 order by in_chat_message_id
				  ) as tbl_tmp_message ON tbl_tmp_message.in_chat_room_id = tcr.in_chat_room_id
        where tcrd.in_user_id != $2 and tum.st_status = $1
        ) as tmp_group group by tmp_group.in_chat_room_id, tmp_group.st_room_type,tmp_group.st_chat_room_name, tmp_group.st_message order by max(tmp_group.in_chat_message_id) desc`,
      dataArr
    )
  },
  getChatActiveUserNotificationCount: async function (roomArr, userId) {
    let dataArr = [roomArr, userId]
    return await sails.sendNativeQuery(
      `select in_chat_room_id, in_user_id, in_chat_unread_message_count from tbl_chat_room_details where in_chat_room_id = ANY($1) AND in_user_id = $2`,
      dataArr
    )
  },
  /**
   * @author Khushang M. Bhavnagarwala
   * @description Get user details from userId.
   * @date 27 Aug 2019
   */
  list: async function (listParam) {
    let query = `select COUNT(pm.in_project_id) as project_create_count, sum(case when pm.st_status = 'created' then 1 else 0 end) as createdProejct,
sum(case when pm.st_status = 'complete' then 1 else 0 end) as completedProject,
sum(case when pm.st_status = 'cancel' then 1 else 0 end) as cancelProject,
(select array_agg(ts.st_skill_name) from tbl_user_skill_details tusd left join tbl_skill ts on tusd.in_skill_id = ts.in_skill_id and tusd.in_user_id = um.in_user_id where ts.st_skill_name IS NOT NULL) as user_skills,
um.in_user_id, st_cobuilders_id, st_first_name, st_last_name, st_email_address, st_company_name, st_business_title, st_website, st_about, st_country_code,
st_phone_number, st_profile_picture, um.st_address, st_country_name, st_state_name, st_city_name, um.st_pincode, um.st_timezone, um.in_country_id, um.in_state_id,
um.in_city_id, TO_CHAR(dt_dob, 'yyyy-mm-dd') as dt_dob, um.dt_created_at
    from tbl_user_master um
    left join tbl_country_master cm ON cm.in_country_id = um.in_country_id
    left join tbl_state_master sm ON sm.in_state_id = um.in_state_id
    left join tbl_city_master cim ON cim.in_city_id = um.in_city_id
    left join tbl_project_master pm ON (pm.in_user_id = um.in_user_id)
	  where 1 = 1`

    if (listParam.status !== '') {
      query += ` and um.st_status IN ('${listParam.status}')`
    }
    if (listParam.search !== '') {
      query += ` and (st_first_name ILIKE '%${listParam.search}%' or st_last_name ILIKE '%${listParam.search}%')`
    }

    query += ` group by um.in_user_id, cm.in_country_id, sm.in_state_id, cim.in_city_id`

    if (listParam.field !== '' && listParam.sorttype !== '') {
      let sortArr = ['um.in_user_id']

      query += sortArr.includes(listParam.field) ? ` order by ${listParam.field} ${listParam.sorttype}` : ` order by lower(${listParam.field}) ${listParam.sorttype}`
    }

    let totalRows = await sails.sendNativeQuery(query)

    let offset = (listParam.page - 1) * listParam.limit
    query += ` limit ${listParam.limit} offset ${offset}`

    let allRecords = await sails.sendNativeQuery(query)

    return { rows: allRecords.rows, rowCount: totalRows.rowCount }
  },
}
