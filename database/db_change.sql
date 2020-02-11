CREATE TYPE requestFrom AS ENUM ('admin', 'client', 'app');
CREATE TABLE tbl_request_log
(
    in_request_log_id bigserial,
    in_user_id bigint,
    st_request_url character varying(2000),
    st_request_ip character varying(25),
    st_request_params text,
    st_request_from requestFrom,
    st_request_browser character varying(255),
    st_browser_version character varying(255),
    st_client_os character varying(255),
    st_request_token character varying(2000),
    st_request_time timestamp with time zone,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_request_log_id)
);

CREATE TYPE userStatus AS ENUM ('pending', 'active', 'inactive', 'delete');

CREATE TABLE tbl_country_master
(
    in_country_id bigserial,
    st_sortname character varying(3),
    st_country_name character varying(150),
    st_phonecode character varying(10),
    PRIMARY KEY (in_country_id)
);

CREATE TABLE tbl_state_master
(
    in_state_id bigserial,
    st_state_name character varying(30),
    in_country_id int,
    PRIMARY KEY (in_state_id)
);

CREATE TABLE tbl_city_master
(
    in_city_id bigserial,
    st_city_name character varying(30),
    in_state_id int,
    PRIMARY KEY (in_city_id)
);

CREATE TABLE tbl_user_verification_code
(
    in_user_verification_code bigserial,
    in_user_id bigint,
    st_email_address character varying(255),
    st_bearer text,
    st_verification_code character varying(20),
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_user_verification_code)
);

CREATE TABLE tbl_category
(
    in_category_id bigserial,
    st_category_name character varying(100),
    st_category_description character varying(255),
    st_category_info character varying(255),
    st_status userStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_category_id)
);

CREATE TABLE tbl_subcategory
(
    in_subcategory_id bigserial,
    in_category_id bigint,
    st_subcategory_name character varying(100),
    st_subcategory_description character varying(255),
    st_subcategory_info character varying(255),
    st_status userStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_subcategory_id)
);

-- Default insert query
-- INSERT INTO public.tbl_request_log(in_user_id, st_request_url, st_request_ip, st_request_params, st_request_from, st_request_browser, st_browser_version, st_client_os, st_request_token, st_request_time) VALUES (1, 'localhost:1337/api/test', '192.168.0.1', '{"asdfasdfasdf": "dsaf asdf"}', 'client', 'Chrome', '73.0.0', 'Linux', 'asfasdfasdfasdf', '2019-07-10T06:44:14.948Z');

CREATE TYPE userSessionStatus AS ENUM ('active', 'inactive');
CREATE TABLE tbl_user_session
(
    in_user_session_id bigserial,
    in_user_id bigint,
    st_bearer text,
    st_client_details text,
    st_browser_name character varying(255),
    st_browser_version character varying(255),
    st_client_os character varying(255),
    st_client_ip character varying(25),
    st_continent character varying(100),
    st_country_code character varying(25),
    st_country character varying(100),
    st_state character varying(100),
    st_city character varying(100),
    st_isp character varying(100),
    st_lat character varying(100),
    st_lon character varying(100),
    st_status userSessionStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_user_session_id)
);

-- Default insert query.
-- INSERT INTO tbl_user_session(in_user_id, st_bearer, st_client_details, st_browser_name, st_browser_version, st_client_os, st_client_ip, st_continent, st_country_code, st_country, st_state, st_city, st_isp, st_lat, st_lon, st_status, dt_created_at, dt_updated_at) VALUES (1, 'bearerasdfasdfasdf', '{"asdfasdf": "Asdfasdfasdf"}', 'Chrome', '74.0.0', 'Linux', '127.0.0.1', 'Asia', '+91', 'India', 'Gujarat', 'Surat', 'R. K. Infratel Limited', '21.19594', '72.83023', 'active', NOW(), NOW());



CREATE SEQUENCE cobuilders_id_seq;
SELECT setval('cobuilders_id_seq', 1000000);

CREATE TABLE tbl_user_master
(
    in_user_id bigserial,
    st_cobuilders_id character varying(255) DEFAULT 'CB' || nextval('cobuilders_id_seq'),
    st_first_name character varying(255),
    st_last_name character varying(255),
    st_email_address character varying(255),
    st_password character varying(255),
    st_country_code character varying(10),
    st_phone_number character varying(25),
    st_profile_picture character varying(100),
    st_address character varying(255),
    in_country_id bigint,
    in_state_id bigint,
    in_city_id bigint,
    st_pincode character varying(15),
    st_timezone character varying(40),
    dt_dob date,
    st_verification_code character varying(25),
    st_phone_verification_code character varying(25),
    st_status userStatus,
    st_phone_verified userStatus,
    in_terms_and_conditions int,
    st_register_at timestamp with time zone,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_user_id)
);

select in_user_id, st_cobuilders_id, st_first_name, st_last_name, st_email_address, st_phone_number, dt_dob, st_verification_code, st_phone_verification_code, st_status, st_phone_verified, in_terms_and_conditions,
 TO_CHAR(dt_dob, 'yyyy-mm-dd') as dt_dob, st_country_name, st_state_name, st_city_name
from tbl_user_master um
left join tbl_country_master cm ON cm.in_country_id = um.in_country_id
left join tbl_state_master sm ON sm.in_state_id = um.in_state_id
left join tbl_city_master cim ON cim.in_city_id = um.in_city_id
where in_user_id = 17;

-- Default insert query.
--
INSERT INTO public.tbl_user_master(st_first_name, st_last_name, st_email_address, st_password, st_country_code, st_phone_number, st_profile_picture,st_address, in_country_id, in_state_id, in_city_id, st_pincode, st_timezone, dt_dob, st_verification_code, st_phone_verification_code, st_status, st_phone_verified, in_terms_and_conditions, st_register_at, dt_created_at, dt_updated_at) values
('Khushang','Bhavnagarwala','test2@gmail.com','f925916e2754e5e03f75dd58a5733251','+91', '', '','Salabatpura', 0,0,0,null,'IST',null,'y0ca83h7zg', null,'active','pending',1,'2019-08-13 13:04:08+00','2019-08-13 13:04:08+00','2019-08-17 09:04:27+00'),
('Khushang','Bhavnagarwala','asdf@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','', '','Salabatpura',0,0,0,null,'IST',null,'66upq56p4cc', null,'active','pending',1,'2019-08-13 13:06:39+00','2019-08-13 13:06:39+00','2019-08-13 13:06:39+00'),
('Khushang','Bhavnagarwala','qwer@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','', '','Salabatpura',0,0,0,null,'IST',null,'t7wx8he8l1', null,'active','pending',1,'2019-08-13 13:14:12+00','2019-08-13 13:14:12+00','2019-08-13 13:22:17+00'),
('Qwer','Tyui','tyui@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','', 'Salabatpura',0,0,0,null,'IST',null,'oimpywrzmy', null,'pending','pending',1,'2019-08-13 13:15:04+00','2019-08-13 13:15:04+00','2019-08-13 13:15:04+00'),
('Zxcv','Bnmb','zxcv@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','', '','Salabatpura',0,0,0,null,'IST',null,'x4xm5s9xqk', null,'active','pending',1,'2019-08-13 13:16:03+00','2019-08-13 13:16:03+00','2019-08-13 13:22:19+00'),
('Asdf','Ghjk','asdf1@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','', '','Salabatpura',0,0,0,null,'IST',null,'tsu8yxz4qr', null,'pending','pending',1,'2019-08-13 13:16:57+00','2019-08-13 13:16:57+00','2019-08-13 13:16:57+00'),
('Ghjk','Hjkl','ghjk@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',0,0,0,null,'IST',null,'ag7wm2nc6v', null,'active','pending',1,'2019-08-13 13:18:13+00','2019-08-13 13:18:13+00','2019-08-14 11:16:03+00'),
('Adfg','Gjhk','adfg@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',0,0,0,null,'IST',null,'oid9ivisqs', null,'delete','pending',1,'2019-08-13 13:19:06+00','2019-08-13 13:19:06+00','2019-08-14 15:10:16+00'),
('Rewq','Iuyt','rewq@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',0,0,0,null,'IST',null,'1gslggqi2w6', null,'delete','pending',1,'2019-08-13 13:19:55+00','2019-08-13 13:19:55+00','2019-08-14 15:10:16+00'),
('Fdsa','Kjhg','fdsa@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',0,0,0,null,'IST',null,'af0nc32deg', null,'delete','pending',1,'2019-08-13 13:20:38+00','2019-08-13 13:20:38+00','2019-08-14 11:15:50+00'),
('Test','Pqwer','test3@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',0,0,0,null,'IST',null,'irpc9nx7id8', null,'active','pending',1,'2019-08-13 13:21:21+00','2019-08-13 13:21:21+00','2019-08-19 07:31:18+00'),
('Post','Man','test4@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',0,0,0,null,'IST',null,'tqdtjjkq70d', null,'active','pending',1,'2019-08-19 09:27:56+00','2019-08-19 09:27:56+00','2019-08-19 09:28:12+00'),
('Scott','Tiger','scotttiger@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',0,0,0,null,'IST',null,'f7sz4ubyxsp', null,'pending','pending',1,'2019-08-19 09:33:29+00','2019-08-19 09:33:29+00','2019-08-19 09:33:29+00'),
('Khushang','Bhavnagarwala','test5@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',0,0,0,null,'IST',null,'z5ud0kj9x1', null,'active','pending',1,'2019-08-19 09:36:48+00','2019-08-19 09:36:48+00','2019-08-19 09:38:26+00'),
('Khushang','Bhavnagarwala','test6@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',0,0,0,null,'IST',null,'ufdz2lcj4gq',null,'active','pending',0,'2019-08-23 11:12:51+00','2019-08-23 11:12:51+00','2019-08-23 11:19:31+00'),
('Khushang','Bhavnagarwala','test7@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',0,0,0,null,'IST',null,'x7lur0fkp3',null,'active','pending',0,'2019-08-23 11:49:43+00','2019-08-23 11:49:43+00','2019-08-23 13:22:10+00'),
('Khushang','Bhavnagarwala','bkhushang@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',101,12,1041,null,'IST',null,'3j7qn49jnlo',null,'active','pending',0,'2019-08-23 13:30:09+00','2019-08-23 13:30:09+00','2019-08-23 13:34:15+00'),
('Khushang','Bhavnagarwala','vish.khush.2k17@gmail.com','f925916e2754e5e03f75dd58a5733251','+91','','','Salabatpura',101,12,1041,null,'IST',null,'3j7qn49jnlo',null,'active','pending',0,'2019-08-23 13:30:09+00','2019-08-23 13:30:09+00','2019-08-23 13:34:15+00');

CREATE TYPE commonStatus AS ENUM ('active', 'inactive');

CREATE TABLE tbl_user_profile_details
(
    in_user_profile_details_id bigserial,
    in_user_id bigint,
    st_earning_private commonStatus,
    st_new_project_notification commonStatus,
    st_newsletter commonStatus,
    st_two_step_verification commonStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_user_profile_details_id)
);

CREATE TABLE tbl_forgot_password_request
(
    in_forgot_password_id bigserial,
    in_user_id bigint,
    st_email character varying(255),
    st_request_token character varying(255),
    dt_created_at timestamp with time zone,
    PRIMARY KEY (in_forgot_password_id)
);

-- Default insert query.
-- INSERT INTO public.tbl_forgot_password_request(in_user_id, st_email, st_request_token, dt_created_at) VALUES (1, 'bkhushang@gmail.com', 'asdfasdfasdfasdf', NOW());

CREATE TABLE tbl_admin_user_session
(
    in_admin_user_session_id bigserial,
    in_admin_user_id bigint,
    st_bearer text,
    st_client_details text,
    st_browser_name character varying(255),
    st_browser_version character varying(255),
    st_client_os character varying(255),
    st_client_ip character varying(25),
    st_status userSessionStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_admin_user_session_id)
);

-- Default insert query.
-- INSERT INTO tbl_admin_user_session(in_admin_user_id, st_bearer, st_client_details, st_browser_name, st_browser_version, st_client_os, st_client_ip, in_status, dt_created_at, dt_updated_at) VALUES (1, 'bearerasdfasdfasdf', '{"asdfasdf": "Asdfasdfasdf"}', 'Chrome', '74.0.0', 'Linux', '127.0.0.1', 'active', NOW(), NOW());

CREATE TABLE tbl_admin_user_master
(
    in_admin_user_id bigserial,
    st_first_name character varying(255),
    st_last_name character varying(255),
    st_email_address character varying(255),
    st_password character varying(255),
    st_phone_number character varying(25),
    in_country_id bigint,
    in_state_id bigint,
    in_city_id bigint,
    st_verification_code character varying(25),
    st_status userStatus,
    st_register_at timestamp with time zone,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_admin_user_id)
);

-- Default insert query.
-- INSERT INTO public.tbl_admin_user_master(st_first_name, st_last_name, st_email_address, st_password, st_phone_number, in_country_id, in_state_id, in_city_id, st_verification_code, st_status, st_register_at, dt_created_at, dt_updated_at) VALUES ('Administrator', 'User', 'admin@gmail.com', 'e10adc3949ba59abbe56e057f20f883e', '7894561230', 15, 10, 56, '1234', 'active', '2019-07-11T10:25:06Z', '2019-07-11T10:25:06Z', '2019-07-11T10:25:06Z');

CREATE INDEX index_tbl_subcategory_in_category_id ON tbl_subcategory (in_category_id);

CREATE TABLE tbl_skill
(
    in_skill_id bigserial,
    st_skill_name character varying(100),
    st_skill_description character varying(255),
    st_skill_info character varying(255),
    st_status userStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_skill_id)
);

CREATE TYPE projectStatus AS ENUM ('created', 'awarded', 'inProgress', 'review', 'complete', 'autocomplete', 'cancel', 'autocancel');

CREATE TABLE tbl_project_master
(
    in_project_id bigserial,
    in_user_id bigint,
    st_project_name character varying(255),
    st_project_slug character varying(1000),
    st_project_description text,
    in_category_id bigint,
    in_subcategory_id bigint,
    st_document text,
    st_video text,
    st_money_involved boolean,
    st_money_need numeric(10,2),
    st_project_duration int,
    st_people_strength int,
    st_physical_site boolean,
    st_address varchar(255),
    in_country_id bigint,
    in_state_id bigint,
    in_city_id bigint,
    st_pincode varchar(10),
    st_is_activity boolean,
    dt_event_start_at timestamp with time zone,
    dt_event_end_at timestamp with time zone,
    dt_expire_at timestamp with time zone,
    st_givers_needed boolean,
    st_local_givers boolean,
    st_doers_needed boolean,
    st_status projectStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_project_id)
);

INSERT INTO tbl_project_master (in_user_id, st_project_name,st_project_slug , st_project_description, in_category_id, in_subcategory_id, st_document, st_video,
								st_money_involved,st_money_need,st_project_duration, st_people_strength, st_physical_site, st_address, in_country_id,
								in_state_id, in_city_id, st_pincode, st_is_activity, dt_event_start_at,dt_event_end_at,
								st_givers_needed, st_local_givers, st_doers_needed, st_status, dt_created_at, dt_updated_at)
VALUES (1, 'Project One', 'project-one', 'Project Description', 1 , 2 , null, null,
		true, 10, 2, 499, true, 'Surat', 101,
		12, 1041, '395003', true, '2019-10-10' , '2019-10-10',
		true, true, null, 'created' , NOW(), NOW());

CREATE TABLE tbl_project_skill_details
(
    in_project_skill_id bigserial,
    in_project_id bigint,
    in_skill_id bigint,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_project_skill_id)
);

CREATE TABLE tbl_doers_project_request_details
(
    in_doers_project_request_id bigserial,
    in_project_id bigint,
    in_user_id bigint,
    st_approve boolean,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_doers_project_request_id)
);

CREATE TABLE tbl_givers_project_request_details
(
    in_givers_project_request_id bigserial,
    in_project_id bigint,
    in_user_id bigint,
    st_approve boolean,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_givers_project_request_id)
);

--=========================================================================================================
-- Uploaded all above code on stage server at 11th Oct.
--=========================================================================================================

--=========================================================================================================
-- Upload By : Khushang M. Bhavnagarwala
-- Date By : 11th Oct 2019
-- Updated on Stage : 21st Oct 2019
--=========================================================================================================

CREATE TABLE tbl_user_category_subcategory_details
(
    in_user_category_id bigserial,
    in_category_id bigint,
    in_subcategory_id bigint,
    in_user_id bigint,
    dt_created_at timestamp with time zone,
    PRIMARY KEY (in_user_category_id)
);

CREATE TABLE tbl_project_liked_details
(
    in_project_liked_id bigserial,
    in_project_id bigint,
    in_user_id bigint,
    dt_created_at timestamp with time zone,
    PRIMARY KEY (in_project_liked_id)
);

CREATE TABLE tbl_user_skill_details
(
    in_user_skill_id bigserial,
    in_user_id bigint,
    in_skill_id bigint,
    dt_created_at timestamp with time zone,
    PRIMARY KEY (in_user_skill_id)
);

--=========================================================================================================
-- Note remove tbl_project_skill_details column => dt_updated_at
--=========================================================================================================

-- SELECT pm.in_project_id as in_project_id, pm.st_project_name as st_project_name, pm.st_project_slug as st_project_slug, pm.st_project_description as st_project_description,
--     pm.in_category_id as in_category_id, pm.in_subcategory_id as in_subcategory_id, tc.st_category_name as st_category_name, tsc.st_subcategory_name as st_subcategory_name,
-- 	pm.st_money_involved as st_money_involved, pm.st_money_need as st_money_need, pm.st_project_duration as st_project_duration, pm.st_people_strength as st_people_strength,
-- 	pm.st_physical_site as st_physical_site, pm.st_address as st_address, tcm.st_country_name as st_country_name, tsm.st_state_name as st_state_name,
-- 	pm.in_country_id as in_country_id, pm.in_state_id as in_state_id, pm.in_city_id as in_city_id, pm.st_pincode as st_pincode, pm.st_is_activity as st_is_activity,
-- 	pm.dt_event_start_at as dt_event_start_at, pm.dt_event_end_at as dt_event_end_at, pm.dt_expire_at as dt_expire_at, pm.st_status as st_status,
-- 	pm.dt_created_at as dt_created_at, pm.dt_updated_at as dt_updated_at, tmpProjMaster.projectCount, array_agg(ts.st_skill_name) as st_skills
--     FROM tbl_project_master pm
--     left join tbl_category tc on tc.in_category_id = pm.in_category_id
--     left join tbl_subcategory tsc on tsc.in_subcategory_id = pm.in_subcategory_id
-- 	left join tbl_project_skill_details tsd on tsd.in_project_id = pm.in_project_id
-- 	left join tbl_skill ts on ts.in_skill_id = tsd.in_skill_id
--     left join tbl_country_master tcm on tcm.in_country_id = pm.in_country_id
--     left join tbl_state_master tsm on tsm.in_state_id = pm.in_state_id
--     left join (select count(*) as projectCount, in_user_id from tbl_project_master where st_status = 'created' group by in_user_id ) as tmpProjMaster on tmpProjMaster.in_user_id = pm.in_user_id
--     where 1 = 1 group by pm.in_project_id, tc.st_category_name, tsc.st_subcategory_name, tcm.st_country_name, tsm.st_state_name, tmpprojmaster.projectcount

-- SELECT pm.in_project_id as in_project_id, pm.st_project_name as st_project_name, pm.st_project_slug as st_project_slug, pm.st_project_description as st_project_description,
--     pm.in_category_id as in_category_id, pm.in_subcategory_id as in_subcategory_id, tc.st_category_name as st_category_name, tsc.st_subcategory_name as st_subcategory_name,
-- 	pm.st_money_involved as st_money_involved, pm.st_money_need as st_money_need, pm.st_project_duration as st_project_duration, pm.st_people_strength as st_people_strength,
-- 	pm.st_physical_site as st_physical_site, pm.st_address as st_address, tcm.st_country_name as st_country_name, tsm.st_state_name as st_state_name,
-- 	pm.in_country_id as in_country_id, pm.in_state_id as in_state_id, pm.in_city_id as in_city_id, pm.st_pincode as st_pincode, pm.st_is_activity as st_is_activity,
-- 	pm.dt_event_start_at as dt_event_start_at, pm.dt_event_end_at as dt_event_end_at, pm.dt_expire_at as dt_expire_at, pm.st_status as st_status,
-- 	pm.dt_created_at as dt_created_at, pm.dt_updated_at as dt_updated_at, tmpProjMaster.projectCount, tmpSkill.st_skill_name as st_skill_name
--     FROM tbl_project_master pm
--     left join tbl_category tc on tc.in_category_id = pm.in_category_id
--     left join tbl_subcategory tsc on tsc.in_subcategory_id = pm.in_subcategory_id
-- 	left join tbl_country_master tcm on tcm.in_country_id = pm.in_country_id
--     left join tbl_state_master tsm on tsm.in_state_id = pm.in_state_id
--     left join (select count(*) as projectCount, in_user_id from tbl_project_master where st_status = 'created' group by in_user_id ) as tmpProjMaster on tmpProjMaster.in_user_id = pm.in_user_id
-- 	left join (select pm.in_project_id as in_project_id, array_agg(ts.st_skill_name) as st_skill_name from tbl_project_master pm
-- 					left join tbl_project_skill_details psd on psd.in_project_id = pm.in_project_id
-- 					left join tbl_skill ts on ts.in_skill_id = psd.in_skill_id
-- 					group by pm.in_project_id ) as tmpSkill on tmpSkill.in_project_id = pm.in_project_id
--     where 1 = 1

--=========================================================================================================
-- Upload By : Khushang M. Bhavnagarwala
-- Date By : 21st Oct 2019
-- Updated on Stage : Done (16th Nov)
--=========================================================================================================

CREATE TYPE reasonFor AS ENUM ('project', 'withdrawal','projectInvitation');

CREATE TABLE tbl_reasons
(
    in_reason_id bigserial,
    in_reason_for reasonFor,
    st_reason_description character varying(255),
    st_status commonStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_reason_id)
);

CREATE TABLE tbl_project_cancel_reason
(
    in_project_cancel_reason_id bigserial,
    in_project_id bigint,
    in_user_id bigint,
    in_admin_user_id bigint,
    in_reason_id bigint,
    st_reason_message character varying(255),
    dt_created_at timestamp with time zone,
    PRIMARY KEY (in_project_cancel_reason_id)
);

CREATE TABLE tbl_project_questions
(
    in_project_question_id bigserial,
    in_project_id bigint,
    in_parent_id bigint,
    in_user_id bigint,
    st_message text,
    st_status userStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_project_question_id)
);


-- INSERT INTO public.tbl_project_questions(
-- 	in_project_id, in_parent_id, in_user_id, st_message, st_status, dt_created_at, dt_updated_at)
-- 	VALUES (33, 0, 4, 'This is for test.', 'active', '2019-11-06 08:14:03+00', '2019-11-06 08:14:03+00');

-- INSERT INTO public.tbl_project_questions(
-- 	in_project_id, in_parent_id, in_user_id, st_message, st_status, dt_created_at, dt_updated_at)
-- 	VALUES (33, 1, 17, 'Its fine.', 'active', '2019-11-06 08:16:03+00', '2019-11-06 08:16:03+00');

-- INSERT INTO public.tbl_project_questions(
-- 	in_project_id, in_parent_id, in_user_id, st_message, st_status, dt_created_at, dt_updated_at)
-- 	VALUES (33, 1, 17, 'You can do it.', 'active', '2019-11-06 08:16:20+00', '2019-11-06 08:16:20+00');

-- INSERT INTO public.tbl_project_questions(
-- 	in_project_id, in_parent_id, in_user_id, st_message, st_status, dt_created_at, dt_updated_at)
-- 	VALUES (33, 1, 4, 'Ok. Thank you so much.', 'active', '2019-11-06 08:17:20+00', '2019-11-06 08:17:20+00');

-- INSERT INTO public.tbl_project_questions(
-- 	in_project_id, in_parent_id, in_user_id, st_message, st_status, dt_created_at, dt_updated_at)
-- 	VALUES (33, 1, 4, 'Ok. Thank you so much.', 'active', '2019-11-06 08:17:20+00', '2019-11-06 08:17:20+00');

--===========================================================================================================================
-- Parent Child relation query.
--===========================================================================================================================

-- with recursive rel_tree as (
--    select in_project_question_id, in_project_id, in_user_id, st_message, in_parent_id, dt_created_at, 1 as level, array[in_project_question_id] as path_info
--    from tbl_project_questions
--    where in_parent_id = 0 and st_status = 'active'
--    union all
--    select c.in_project_question_id, c.in_project_id, c.in_user_id, rpad('', p.level * 2, '') || c.st_message, c.in_parent_id, c.dt_created_at, p.level + 1, p.path_info||c.in_project_question_id
--    from tbl_project_questions c
--      join rel_tree p on c.in_parent_id = p.in_project_question_id and st_status = 'active'
-- )
-- select rt.in_project_question_id as in_project_question_id, rt.in_project_id as in_project_id, rt.in_user_id as in_user_id, rt.st_message as st_message,
-- rt.in_parent_id as in_parent_id, rt.dt_created_at as dt_created_at, um.st_first_name, um.st_last_name
-- from rel_tree rt
-- left join tbl_user_master um on um.in_user_id = rt.in_user_id where in_project_id = 34
-- order by path_info;

--===========================================================================================================================
-- Parent Child relation query example starts.
--===========================================================================================================================

-- CREATE SEQUENCE relations_rel_id_seq
--     INCREMENT BY 1
--     NO MAXVALUE
--     NO MINVALUE
--     CACHE 1;

-- CREATE TABLE relations(
-- 	rel_id bigint DEFAULT nextval('relations_rel_id_seq'::regclass) NOT NULL PRIMARY KEY,
-- 	rel_name text,
-- 	rel_display text,
-- 	rel_parent bigint
-- );

-- INSERT INTO relations("rel_name","rel_display","rel_parent")
-- VALUES
-- ('rel1','rel1_display',NULL),
-- ('rel2','rel2_display',NULL),
-- ('rel11','rel11_display',1),
-- ('rel21','rel22_display',2),
-- ('rel111','rel111_display',3),
-- ('rel112','rel112_display',3),
-- ('rel113','rel113_display',3),
-- ('rel211','rel211_display',4),
-- ('rel212','rel212_display',4),
-- ('rel1121','rel1121_display',6);

-- with recursive rel_tree as (
--    select rel_id, rel_name, rel_parent, 1 as level, array[rel_id] as path_info
--    from relations
--    where rel_parent is null
--    union all
--    select c.rel_id, rpad('_', p.level * 2) || c.rel_name, c.rel_parent, p.level + 1, p.path_info||c.rel_id
--    from relations c
--      join rel_tree p on c.rel_parent = p.rel_id
-- )
-- select rel_id, rel_name
-- from rel_tree
-- order by path_info;

--===========================================================================================================================
-- Parent Child relation query example ends.
--===========================================================================================================================
--=========================================================================================================
-- Upload By : Khushang M. Bhavnagarwala
-- Date By : 16 Nov 2019
-- Updated on Stage : Done (30th Nov)
--=========================================================================================================

CREATE RECURSIVE VIEW view_project_questions (in_project_question_id, in_project_id, in_user_id, st_message, in_parent_id, dt_created_at, level, path_info) AS
(select in_project_question_id, in_project_id, in_user_id, st_message, in_parent_id, dt_created_at, 1 as level, array[in_project_question_id] as path_info
   from tbl_project_questions
   where in_parent_id = 0 and st_status = 'active'
   union all
   select c.in_project_question_id, c.in_project_id, c.in_user_id, rpad('', p.level * 2, '') || c.st_message, c.in_parent_id, c.dt_created_at, p.level + 1, p.path_info||c.in_project_question_id
   from tbl_project_questions c
     join view_project_questions p on c.in_parent_id = p.in_project_question_id and st_status = 'active');

-- select vpq.in_project_question_id as in_project_question_id, vpq.in_project_id as in_project_id, vpq.in_user_id as in_user_id, vpq.st_message as st_message, vpq.in_parent_id as in_parent_id, vpq.dt_created_at as dt_created_at, um.st_first_name, um.st_last_name from view_project_questions vpq left join tbl_user_master um on um.in_user_id = vpq.in_user_id where in_project_id = 34 order by path_info

--=========================================================================================================
-- Upload By : Khushang M. Bhavnagarwala
-- Date By : 23 Nov 2019
-- Updated on Stage : Done (23 Nov 2019)
--=========================================================================================================

CREATE TYPE projectPayType AS ENUM ('milestone', 'project');
CREATE TABLE tbl_project_proposal
(
    in_project_proposal_id bigserial,
    in_project_id bigint,
    in_user_id bigint,
    st_pay_type projectPayType,
    in_project_duration int,
    st_cover_letter text,
    st_total_price numeric(10,2),
    st_service_fee numeric(10,2),
    st_earn_price numeric(10,2),
    st_document text,
    st_video text,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_project_proposal_id)
);

CREATE TABLE tbl_project_milestone_details
(
    in_project_milestone_detail_id bigserial,
    in_project_proposal_id bigint,
    st_milestone_description text,
    st_milestone_date timestamp with time zone,
    st_milestone_price numeric(10,2),
    dt_created_at timestamp with time zone,
    PRIMARY KEY (in_project_milestone_detail_id)
);

--=========================================================================================================
-- Upload By : Khushang M. Bhavnagarwala
-- Date By : 23 Nov 2019
-- Updated on Stage : Done (30th Nov 2019)
--=========================================================================================================

CREATE TABLE tbl_project_open_details
(
    in_project_open_id bigserial,
    in_project_id bigint,
    in_user_id bigint,
    st_request_browser character varying(255),
    st_browser_version character varying(255),
    st_client_os character varying(255),
    st_request_ip character varying(25),
    dt_created_at timestamp with time zone,
    PRIMARY KEY (in_project_open_id)
);

--=========================================================================================================
-- Upload By : Khushang M. Bhavnagarwala
-- Date By : 04 Nov 2019
-- Updated on Stage : Done (8th Dec 2019)
--=========================================================================================================

CREATE TYPE cmsStatus AS ENUM ('editable', 'uneditable');
CREATE TABLE tbl_cms
(
    in_cms_id bigserial,
    st_cms_title character varying(255),
    st_cms_slug character varying(255),
    st_cms_description text,
    st_editable_status cmsstatus,
    st_status userStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_cms_id)
);

--=========================================================================================================
-- Upload By : Abilash
-- Date By : 07 Dec 2019
-- Updated on Stage : Done (8th Dec 2019)
--=========================================================================================================

CREATE TYPE proposalStatus AS ENUM ('active', 'archive');

ALTER TABLE tbl_project_proposal
ADD st_status proposalStatus NOT NULL DEFAULT 'active';

ALTER TABLE tbl_doers_project_request_details
ADD st_status proposalStatus NOT NULL DEFAULT 'active';

--=========================================================================================================
-- Upload By : Khushang
-- Date By : 13 Dec 2019
-- Updated on Stage : Done (14th Dec 2019)
--=========================================================================================================

CREATE SEQUENCE tbl_doers_project_request_details_in_doers_project_request_id_seq;
SELECT setval('tbl_doers_project_request_details_in_doers_project_request_id_seq', 1000000);

CREATE TABLE public.tbl_doers_project_request_details_new
(
    in_doers_project_request_id bigserial NOT NULL,
    in_project_id bigint,
    in_user_id bigint,
    st_approve boolean,
	st_status proposalstatus NOT NULL DEFAULT 'active'::proposalstatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone
);

INSERT INTO tbl_doers_project_request_details_new SELECT in_doers_project_request_id, in_project_id, in_user_id, st_approve, st_status, dt_created_at, dt_updated_at FROM tbl_doers_project_request_details;

DROP TABLE tbl_doers_project_request_details CASCADE;

ALTER TABLE tbl_doers_project_request_details_new RENAME TO tbl_doers_project_request_details;

ALTER TABLE tbl_givers_project_request_details
ADD st_status proposalStatus NOT NULL DEFAULT 'active';

CREATE TABLE public.tbl_givers_project_request_details_new
(
    in_givers_project_request_id bigserial NOT NULL,
    in_project_id bigint,
    in_user_id bigint,
    st_approve boolean,
    st_status proposalstatus NOT NULL DEFAULT 'active'::proposalstatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_givers_project_request_id)
);

INSERT INTO tbl_givers_project_request_details_new SELECT in_givers_project_request_id, in_project_id, in_user_id, st_approve, st_status, dt_created_at, dt_updated_at FROM tbl_givers_project_request_details;

DROP TABLE tbl_givers_project_request_details CASCADE;

ALTER TABLE tbl_givers_project_request_details_new RENAME TO tbl_givers_project_request_details;

CREATE TYPE jobStatus AS ENUM ('hired', 'closed', 'withdrawn');

CREATE TABLE public.tbl_project_proposal_new
(
    in_project_proposal_id bigserial NOT NULL,
    in_project_id bigint,
    in_user_id bigint,
    st_pay_type projectpaytype,
    in_project_duration integer,
    st_cover_letter text COLLATE pg_catalog."default",
    st_total_price numeric(10,2),
    st_service_fee numeric(10,2),
    st_earn_price numeric(10,2),
    st_document text COLLATE pg_catalog."default",
    st_video text COLLATE pg_catalog."default",
    st_status proposalstatus NOT NULL DEFAULT 'active'::proposalstatus,
    st_job_status jobStatus NULL,
    in_reason_id bigint,
    st_withdraw_reason_message text COLLATE pg_catalog."default",
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_project_proposal_id)
);

INSERT INTO tbl_project_proposal_new(in_project_proposal_id, in_project_id, in_user_id, st_pay_type, in_project_duration, st_cover_letter, st_total_price, st_service_fee, st_earn_price, st_document, st_video, st_status, dt_created_at, dt_updated_at) SELECT in_project_proposal_id, in_project_id, in_user_id, st_pay_type, in_project_duration, st_cover_letter, st_total_price, st_service_fee, st_earn_price, st_document, st_video, st_status, dt_created_at, dt_updated_at FROM tbl_project_proposal;

DROP TABLE tbl_project_proposal CASCADE;

ALTER TABLE tbl_project_proposal_new RENAME TO tbl_project_proposal;

--=========================================================================================================
-- Upload By : Khushang
-- Date By : 16 Dec 2019
-- Updated on Stage : Done (18th Dec 2019)
--=========================================================================================================

CREATE TYPE requestStatus AS ENUM ('pending', 'accept', 'reject');

CREATE TABLE public.tbl_doers_project_request_details_new
(
    in_doers_project_request_id bigserial,
    in_project_id bigint,
    in_user_id bigint,
    st_request_status requestStatus NOT NULL DEFAULT 'pending'::requestStatus,
    in_reason_id bigint,
    st_reject_reason_message text,
    st_status proposalstatus NOT NULL DEFAULT 'active'::proposalstatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone
);

INSERT INTO tbl_doers_project_request_details_new(in_project_id, in_user_id, st_status, dt_created_at, dt_updated_at) SELECT in_project_id, in_user_id, st_status, dt_created_at, dt_updated_at FROM tbl_doers_project_request_details;

DROP TABLE tbl_doers_project_request_details CASCADE;

ALTER TABLE tbl_doers_project_request_details_new RENAME TO tbl_doers_project_request_details;

-- Update the project proposal table.

CREATE TYPE proposalSubmitStatus AS ENUM ('manual', 'invitation');

CREATE TABLE tbl_project_proposal_new
(
    in_project_proposal_id bigserial,
    in_project_id bigint,
    in_user_id bigint,
    st_pay_type projectpaytype,
    in_project_duration integer,
    st_cover_letter text COLLATE pg_catalog."default",
    st_total_price numeric(10,2),
    st_service_fee numeric(10,2),
    st_earn_price numeric(10,2),
    st_document text COLLATE pg_catalog."default",
    st_video text COLLATE pg_catalog."default",
    st_status proposalstatus NOT NULL DEFAULT 'active'::proposalstatus,
    st_proposal_submit_status proposalSubmitStatus NOT NULL DEFAULT 'manual'::proposalSubmitStatus,
    st_job_status jobstatus,
    in_reason_id bigint,
    st_withdraw_reason_message text COLLATE pg_catalog."default",
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone, PRIMARY KEY (in_project_proposal_id)
);

INSERT INTO tbl_project_proposal_new(in_project_id, in_user_id, st_pay_type, in_project_duration, st_cover_letter, st_total_price, st_service_fee, st_earn_price, st_document, st_video, st_status, st_job_status, in_reason_id, st_withdraw_reason_message, dt_created_at, dt_updated_at) SELECT in_project_id, in_user_id, st_pay_type, in_project_duration, st_cover_letter, st_total_price, st_service_fee, st_earn_price, st_document, st_video, st_status, st_job_status, in_reason_id, st_withdraw_reason_message, dt_created_at, dt_updated_at FROM tbl_project_proposal;

DROP TABLE tbl_project_proposal CASCADE;

ALTER TABLE tbl_project_proposal_new RENAME TO tbl_project_proposal;

-- ALTER TYPE reasonFor ADD VALUE 'projectInvitation' AFTER 'withdrawal';

INSERT INTO public.tbl_reasons(
	in_reason_for, st_reason_description, st_status, dt_created_at, dt_updated_at)
	VALUES ('projectInvitation', 'Budget is too low.', 'active', '2019-10-19 12:28:33+00', '2019-10-19 12:28:33+00'),
    ('projectInvitation', 'My skills not matched with requirement.', 'active', '2019-10-19 12:28:33+00', '2019-10-19 12:28:33+00'),
     ('projectInvitation', 'Too busy with other project.', 'active', '2019-10-19 12:28:33+00', '2019-10-19 12:28:33+00'),
     ('projectInvitation', 'Not interested in this project.', 'active', '2019-10-19 12:28:33+00', '2019-10-19 12:28:33+00'),
     ('projectInvitation', 'Not interested to work with this badger.', 'active', '2019-10-19 12:28:33+00', '2019-10-19 12:28:33+00'),
     ('projectInvitation', 'Other', 'active', '2019-10-19 12:28:33+00', '2019-10-19 12:28:33+00');

--=========================================================================================================
-- Upload By : Abilash
-- Date By : 18 Dec 2019
-- Updated on Stage : Done (19th Dec 2019)
--=========================================================================================================

CREATE TYPE paymentType AS ENUM
('donated', 'settlement');
CREATE TYPE paymentStatus AS ENUM
('initiated', 'paid', 'cancelled', 'requested_return', 'returned');

CREATE TABLE tbl_transactions
(
    in_transaction_id SERIAL,
    in_user_id bigint,
    in_project_id bigint,
    st_payment_type paymentType NOT NULL,
    in_amount numeric(10,2),
    st_paypal_id CHAR(40),
    st_payment_method CHAR(20),
    st_paypal_approval_url CHAR(200),
    dt_paypal_create_time TIMESTAMP with time zone,
    dt_initiated TIMESTAMP with time zone,
    dt_paid TIMESTAMP with time zone,
    dt_cancelled TIMESTAMP with time zone,
    dt_requested_return TIMESTAMP with time zone,
    dt_returned TIMESTAMP with time zone,
    st_status paymentStatus default 'initiated'
);

--=========================================================================================================
-- Upload By : Vishnu
-- Date By : 03 Dec 2019
-- Updated on Stage : Done (6th Jan 2020)
--=========================================================================================================

CREATE TYPE chatMessageType AS ENUM ('text', 'file', 'app');
CREATE TYPE chatFileType AS ENUM ('text','image', 'pdf', 'excel', 'word');
CREATE TYPE chatStatus AS ENUM ('active', 'updated', 'deleted');

CREATE TABLE tbl_chat_messages
(
    in_chat_message_id bigserial,
    in_chat_room_id bigint,
    in_sender_user_id bigint,
    st_message text,
    st_message_type chatMessageType,
    st_file_type chatFileType,
    st_file_name character varying(100),
    st_status chatStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_chat_message_id)
);

CREATE TABLE tbl_chat_updated_messages
(
    in_chat_updated_message_id bigserial,
    in_chat_message_id bigint,
    in_chat_room_id bigint,
    in_sender_user_id bigint,
    st_message text,
    st_message_type chatMessageType,
    st_file_type chatFileType,
    st_file_name character varying(100),
    st_status chatStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_chat_updated_message_id)
);

CREATE TYPE chatRoomStatus AS ENUM ('active', 'inactive', 'deleted');
CREATE TABLE tbl_chat_rooms
(
    in_chat_room_id bigserial,
    st_chat_room_name character varying(255),
    st_status chatRoomStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_chat_room_id)
);

CREATE TYPE roomType AS ENUM ('single', 'multiple');
CREATE TABLE tbl_chat_room_details
(
    in_chat_room_detail_id bigserial,
    in_chat_room_id bigint,
    in_user_id bigint,
    in_chat_unread_message_count bigint,
    st_room_type roomType,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_chat_room_detail_id)
);

--=========================================================================================================
-- Upload By : Abilash
-- Date By : 8th Jan 2020
-- Updated on Stage : Done (15th Jan 2020)
--=========================================================================================================

ALTER TYPE paymentStatus RENAME TO paymentStatus_old;

CREATE TYPE paymentStatus AS ENUM
('initiated', 'paid', 'cancelled', 'requested_return', 'returned', 'pending');

ALTER TABLE tbl_transactions ALTER COLUMN st_status DROP DEFAULT;

ALTER TABLE tbl_transactions ALTER COLUMN st_status TYPE paymentStatus USING
st_status::text::paymentStatus;

ALTER TABLE tbl_transactions ALTER COLUMN st_status SET DEFAULT 'initiated';

DROP TYPE paymentStatus_old;

ALTER TABLE tbl_transactions ADD COLUMN st_reason VARCHAR(100);


--=========================================================================================================
-- Upload By : Abilash
-- Date By : 10 Jan 2019
-- Updated on Stage : Done (15th Jan 2020)
--=========================================================================================================

CREATE TABLE tbl_blog_items
(
    in_item_id bigserial,
    in_blog_id bigint,
    st_item_title VARCHAR(200),
    st_blog_category VARCHAR(25),
    st_item_link VARCHAR(200),
    st_item_content VARCHAR(400),
    st_item_content_snippet VARCHAR(300),
    st_item_guid VARCHAR(200),
    st_item_isodate timestamp with time zone,
    st_title_unique VARCHAR (200),
    st_img_url VARCHAR(255),
    st_blog_type VARCHAR(25),
    dt_created timestamp with time zone,
    dt_updated timestamp with time zone
);

CREATE TYPE blogType AS ENUM
('own', 'rss');

--=========================================================================================================
-- Upload By : Abilash
-- Date By : 13 Jan 2020
-- Updated on Stage : Done (15th Jan 2020)
--=========================================================================================================
TRUNCATE tbl_blog_items;

ALTER TABLE tbl_blog_items ALTER COLUMN in_blog_id TYPE int USING in_blog_id::integer;

ALTER TABLE tbl_blog_items ALTER COLUMN in_blog_id SET DEFAULT NULL;

INSERT into tbl_blog_items
    (st_item_title, st_blog_category, st_item_isodate, st_item_content, st_item_content_snippet, dt_created, dt_updated, st_title_unique, st_blog_type)
VALUES
    ('Ideas Category First Sample', 'ideas', '2020-01-13T07:23:24Z', 'First Sample Ideas Post. Hope you like it', 'A Brief Description about sample ideas first post', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z', 'Ideas_Category_First_Sample', 'own'),
    ('Ideas Category Second Sample', 'ideas', '2020-01-13T07:23:24Z', 'Second Sample Ideas Post. Hope you like it', 'A Brief Description about sample ideas second post', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z', 'Ideas_Category_Second_Sample', 'own'),
    ('Business Category First Sample', 'business', '2020-01-13T07:23:24Z', 'First Sample Business Post. Hope you like it', 'A Brief Description about sample Business first post', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z', 'Business_Category_First_Sample', 'own'),
    ('Business Category Second Sample', 'business', '2020-01-13T07:23:24Z', 'Second Sample Business Post. Hope you like it', 'A Brief Description about sample Business second post', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z', 'Business_Category_Second_Sample', 'own');

CREATE TYPE subscriptionStatus AS ENUM('active', 'inactive');

CREATE TABLE tbl_subscriptions
(
    in_subscription_id SERIAL,
    st_email_address VARCHAR(255),
    st_status subscriptionStatus,
    dt_created timestamp with time zone,
    dt_updated timestamp with time zone
);

--=========================================================================================================
-- Upload By : Abilash
-- Date By : 14 Jan 2020
--=========================================================================================================

CREATE TABLE tbl_blogs
(
    in_blog_id SERIAL,
    st_blog_url VARCHAR(255),
    st_blog_category VARCHAR(50),
    dt_created timestamp
    with time zone,
    dt_updated timestamp
    with time zone
);

INSERT into tbl_blogs
    (st_blog_url, st_blog_category, dt_created, dt_updated)
VALUES
    ('http://feeds.bbci.co.uk/news/business/rss.xml', 'business', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z');

--=========================================================================================================
-- Upload By : Khushang Bhavnagarwala
-- Date By : 18th Jan 2020
-- Updated on Stage : Done (18th Jan 2020)
--=========================================================================================================
-- Update the user master table.

CREATE TABLE tbl_user_master_new
(
    in_user_id bigserial,
    st_cobuilders_id character varying(255) DEFAULT 'CB' || nextval('cobuilders_id_seq'),
    st_first_name character varying(255),
    st_last_name character varying(255),
    st_email_address character varying(255),
    st_password character varying(255),
    st_company_name character varying(100),
    st_business_title character varying(100),
    st_website character varying(255),
    st_country_code character varying(10),
    st_phone_number character varying(25),
    st_profile_picture character varying(100),
    st_address character varying(255),
    in_country_id bigint,
    in_state_id bigint,
    in_city_id bigint,
    st_pincode character varying(15),
    st_timezone character varying(40),
    dt_dob date,
    st_verification_code character varying(25),
    st_phone_verification_code character varying(25),
    st_status userStatus,
    st_phone_verified userStatus,
    in_terms_and_conditions int,
    st_register_at timestamp with time zone,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_user_id)
);

INSERT INTO tbl_user_master_new(in_user_id, st_cobuilders_id, st_first_name, st_last_name, st_email_address, st_password, st_country_code, st_phone_number, st_profile_picture, st_address, in_country_id, in_state_id, in_city_id, st_pincode, st_timezone, dt_dob, st_verification_code, st_phone_verification_code, st_status, st_phone_verified, in_terms_and_conditions, st_register_at, dt_created_at, dt_updated_at) SELECT in_user_id, st_cobuilders_id, st_first_name, st_last_name, st_email_address, st_password, st_country_code, st_phone_number, st_profile_picture, st_address, in_country_id, in_state_id, in_city_id, st_pincode, st_timezone, dt_dob, st_verification_code, st_phone_verification_code, st_status, st_phone_verified, in_terms_and_conditions, st_register_at, dt_created_at, dt_updated_at FROM tbl_user_master;

DROP TABLE tbl_user_master CASCADE;

ALTER TABLE tbl_user_master_new RENAME TO tbl_user_master;

--=========================================================================================================
-- Upload By : Khushang Bhavnagarwala
-- Date By : 21st Jan 2020
-- Updated on Stage : Done (23rd Jan 2020)
--=========================================================================================================
-- Update the user master table.

CREATE TABLE tbl_user_master_new
(
    in_user_id bigserial,
    st_cobuilders_id character varying(255) DEFAULT 'CB' || nextval('cobuilders_id_seq'),
    st_first_name character varying(255),
    st_last_name character varying(255),
    st_email_address character varying(255),
    st_password character varying(255),
    st_company_name character varying(100),
    st_business_title character varying(100),
    st_website character varying(255),
    st_about character varying(255),
    st_country_code character varying(10),
    st_phone_number character varying(25),
    st_profile_picture character varying(100),
    st_address character varying(255),
    in_country_id bigint,
    in_state_id bigint,
    in_city_id bigint,
    st_pincode character varying(15),
    st_timezone character varying(40),
    dt_dob date,
    st_verification_code character varying(25),
    st_phone_verification_code character varying(25),
    st_status userStatus,
    st_phone_verified userStatus,
    in_terms_and_conditions int,
    st_register_at timestamp with time zone,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_user_id)
);

INSERT INTO tbl_user_master_new(in_user_id, st_cobuilders_id, st_first_name, st_last_name, st_email_address, st_password, st_company_name, st_business_title, st_website, st_country_code, st_phone_number, st_profile_picture, st_address, in_country_id, in_state_id, in_city_id, st_pincode, st_timezone, dt_dob, st_verification_code, st_phone_verification_code, st_status, st_phone_verified, in_terms_and_conditions, st_register_at, dt_created_at, dt_updated_at) SELECT in_user_id, st_cobuilders_id, st_first_name, st_last_name, st_email_address, st_password, st_company_name, st_business_title, st_website, st_country_code, st_phone_number, st_profile_picture, st_address, in_country_id, in_state_id, in_city_id, st_pincode, st_timezone, dt_dob, st_verification_code, st_phone_verification_code, st_status, st_phone_verified, in_terms_and_conditions, st_register_at, dt_created_at, dt_updated_at FROM tbl_user_master;

DROP TABLE tbl_user_master CASCADE;

ALTER TABLE tbl_user_master_new RENAME TO tbl_user_master;

--=========================================================================================================
-- Upload By : Khushang M. Bhavnagarwala
-- Date By : 22nd Jan 2020
-- Updated on Stage : Done (23rd Jan 2020)
--=========================================================================================================

CREATE TYPE faqStatus AS ENUM ('editable', 'uneditable');
CREATE TABLE tbl_faq
(
    in_faq_id bigserial,
    st_faq_title character varying(255),
    st_faq_description text,
    st_editable_status faqstatus,
    st_status userStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_faq_id)
);

--=========================================================================================================
-- Upload By : Abilash
-- Date By : 14 Jan 2020
-- Updated on Stage : Done (23rd Jan 2020)
--=========================================================================================================

CREATE TABLE tbl_users_cards
(
    in_card_id SERIAL,
    st_card_no VARCHAR(20),
    st_card_month VARCHAR(2),
    st_card_year VARCHAR(4),
    in_user_id bigint,
    dt_created timestamp with time zone,
    dt_updated timestamp with time zone
);

ALTER TABLE tbl_transactions ADD COLUMN st_description VARCHAR(200);


ALTER TABLE tbl_transactions ALTER COLUMN st_paypal_id TYPE varchar(40);

ALTER TABLE tbl_transactions ALTER COLUMN st_payment_method TYPE varchar(200);

ALTER TABLE tbl_transactions ALTER COLUMN st_paypal_approval_url TYPE varchar(200);

--=========================================================================================================
-- Upload By : Khushang Bhavnagarwala
-- Date By : 31st Jan 2020
-- Updated on Stage : Done (08th Feb 2020)
--=========================================================================================================

ALTER TYPE proposalStatus ADD VALUE 'review' AFTER 'active';
ALTER TYPE proposalStatus ADD VALUE 'closed' AFTER 'review';
ALTER TYPE proposalStatus ADD VALUE 'reject' AFTER 'closed';

CREATE TABLE tbl_project_milestone_details_new
(
    in_project_milestone_detail_id bigserial,
    in_project_proposal_id bigint,
    st_milestone_description text,
    st_milestone_date timestamp with time zone,
    st_milestone_price numeric(10,2),
    st_status userStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_project_milestone_detail_id)
);

INSERT INTO tbl_project_milestone_details_new(in_project_milestone_detail_id, in_project_proposal_id, st_milestone_description, st_milestone_date, st_milestone_price, dt_created_at) SELECT in_project_milestone_detail_id, in_project_proposal_id, st_milestone_description, st_milestone_date, st_milestone_price, dt_created_at FROM tbl_project_milestone_details;

ALTER TABLE tbl_project_milestone_details RENAME TO x_tbl_project_milestone_details;

ALTER TABLE tbl_project_milestone_details_new RENAME TO tbl_project_milestone_details;

UPDATE public.tbl_project_milestone_details
	SET st_status='active', dt_updated_at='2020-02-03 10:10:08+00'
	WHERE 1=1;

--=========================================================================================================
-- Upload By : Khushang Bhavnagarwala
-- Date By : 04th Feb 2020
-- Updated on Stage : Done (08th Feb 2020)
--=========================================================================================================

ALTER TYPE proposalStatus ADD VALUE 'inProgress' AFTER 'review';
CREATE TYPE milestoneStatus AS ENUM ('created', 'inProgress', 'complete', 'reject', 'delete');

CREATE TABLE tbl_project_milestone_details_new
(
    in_project_milestone_detail_id bigserial,
    in_project_proposal_id bigint,
    st_milestone_description text,
    st_milestone_date timestamp with time zone,
    st_milestone_price numeric(10,2),
    st_status milestoneStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_project_milestone_detail_id)
);

INSERT INTO tbl_project_milestone_details_new(in_project_milestone_detail_id, in_project_proposal_id, st_milestone_description, st_milestone_date, st_milestone_price, dt_created_at, dt_updated_at) SELECT in_project_milestone_detail_id, in_project_proposal_id, st_milestone_description, st_milestone_date, st_milestone_price, dt_created_at, dt_updated_at FROM tbl_project_milestone_details;

ALTER TABLE tbl_project_milestone_details RENAME TO x1_tbl_project_milestone_details;

ALTER TABLE tbl_project_milestone_details_new RENAME TO tbl_project_milestone_details;

UPDATE public.tbl_project_milestone_details
	SET st_status='created'
	WHERE 1=1;

-- --=========================================================================================================
-- -- Upload By : Abilash
-- -- Date By : 06th Feb 2020
-- Updated on Stage : Done (08th Feb 2020)
-- --=========================================================================================================

-- CREATE TABLE tbl_tags
-- (
--     in_tag_id SERIAL,
--     st_tag_name VARCHAR(30),
--     dt_created timestamp with time zone,
--     dt_updated timestamp with time zone
-- );

-- CREATE TABLE tbl_blog_tags
-- (
--     in_blog_tag_id SERIAL,
--     in_item_id bigint,
--     in_tag_id bigint,
--     dt_created timestamp with time zone,
--     dt_updated timestamp with time zone
-- );

-- INSERT into tbl_tags
--     (st_tag_name, dt_created, dt_updated)
-- VALUES
--     ('business', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z'),
--     ('ideas', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z'),
--     ('events', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z'),
--     ('people', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z');

-- INSERT into tbl_blog_tags
--     (in_item_id, in_tag_id, dt_created, dt_updated)
-- VALUES
--     (59, 2,  '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z'),
--     (60, 2,  '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z'),
--     (62, 1,  '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z'),
--     (62, 4,  '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z'),
--     (61, 3,  '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z');

-- UPDATE tbl_blog_items SET st_blog_category = 'people' WHERE st_blog_type='own' AND st_blog_category = 'business';

-- INSERT into tbl_blog_items
--     (st_item_title, st_blog_category, st_item_isodate, st_item_content, st_item_content_snippet, dt_created, dt_updated, st_title_unique, st_blog_type)
-- VALUES
--     ('Ideas Category Third Sample', 'ideas', '2020-01-13T07:23:24Z', 'Third Sample Ideas Post. Hope you like it', 'A Brief Description about sample ideas third post', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z', 'Ideas_Category_Third_Sample', 'own'),
--     ('Ideas Category Fourth Sample', 'ideas', '2020-01-13T07:23:24Z', 'Fourth Sample Ideas Post. Hope you like it', 'A Brief Description about sample ideas fourth post', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z', 'Ideas_Category_Fourth_Sample', 'own'),
--     ('People Category Second Sample', 'people', '2020-01-13T07:23:24Z', 'Second Sample People Post. Hope you like it', 'A Brief Description about sample People second post', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z', 'People_Category_Second_Sample', 'own'),
--     ('People Category Third Sample', 'people', '2020-01-13T07:23:24Z', 'Third Sample People Post. Hope you like it', 'A Brief Description about sample People third post', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z', 'People_Category_Third_Sample', 'own'),
--     ('Events Category Second Sample', 'events', '2020-01-13T07:23:24Z', 'Second Sample Events Post. Hope you like it', 'A Brief Description about sample Events second post', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z', 'Events_Category_Second_Sample', 'own'),
--     ('Events Category Third Sample', 'events', '2020-01-13T07:23:24Z', 'Third Sample Events Post. Hope you like it', 'A Brief Description about sample Events third post', '2020-01-13T07:23:24Z', '2020-01-13T07:23:24Z', 'Events_Category_Third_Sample', 'own');

CREATE TABLE tbl_blog_feed
(
    in_blog_feed_id bigserial,
    in_blog_category_id	bigint,
    st_blog_feed_url character varying(2000),
    st_status userStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_blog_feed_id)
);

CREATE TABLE tbl_blog_category
(
    in_blog_category_id bigserial,
    st_blog_category character varying(100),
    st_status userStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_blog_category_id)
);

CREATE TYPE blogStatus AS ENUM ('pending', 'publish', 'unpublish');
CREATE TABLE tbl_blog_item
(
    in_blog_item_id bigserial,
    in_blog_feed_id bigint,
    st_blog_item_title text,
    st_blog_item_link text,
    st_blog_item_content text,
    st_blog_item_snippet text,
    st_blog_item_guid text,
    st_blog_item_isodate timestamp with time zone,
    st_blog_item_title_unique character varying(255),
    st_blog_item_img_url text,
    st_blog_item_type character varying(25),
    st_blog_item_creator character varying(100),
    st_blog_item_publisher character varying(100),
    st_status blogStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_blog_item_id)
);

--=========================================================================================================
-- Upload By : Khushang
-- Date By : 08th Feb 2020
-- Updated on Stage : Done (08th Feb 2020)
--=========================================================================================================

CREATE TABLE tbl_blog_item_new
(
    in_blog_item_id bigserial,
    in_blog_feed_id bigint,
    in_blog_category_id	bigint,
    st_blog_item_title text,
    st_blog_item_link text,
    st_blog_item_content text,
    st_blog_item_snippet text,
    st_blog_item_guid text,
    st_blog_item_isodate timestamp with time zone,
    st_blog_item_title_unique character varying(255),
    st_blog_item_img_url text,
    st_blog_item_type character varying(25),
    st_blog_item_creator character varying(100),
    st_blog_item_publisher character varying(100),
    st_status blogStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_blog_item_id)
);

INSERT INTO tbl_blog_item_new(in_blog_item_id, in_blog_feed_id, st_blog_item_title, st_blog_item_link, st_blog_item_content, st_blog_item_snippet, st_blog_item_guid, st_blog_item_isodate, st_blog_item_title_unique, st_blog_item_img_url, st_blog_item_type, st_blog_item_creator, st_blog_item_publisher, st_status, dt_created_at, dt_updated_at) SELECT in_blog_item_id, in_blog_feed_id, st_blog_item_title, st_blog_item_link, st_blog_item_content, st_blog_item_snippet, st_blog_item_guid, st_blog_item_isodate, st_blog_item_title_unique, st_blog_item_img_url, st_blog_item_type, st_blog_item_creator, st_blog_item_publisher, st_status, dt_created_at, dt_updated_at FROM tbl_blog_item;

ALTER TABLE tbl_blog_item RENAME TO x1_tbl_blog_item;

ALTER TABLE tbl_blog_item_new RENAME TO tbl_blog_item;

--=========================================================================================================
-- Upload By : Vishnu
-- Date By : 27 Jan 2020
-- Updated on Stage : Done (08-02-2019)
--=============================================================================

CREATE TYPE notificationStatus AS ENUM ('active', 'deleted');
CREATE TABLE tbl_notifications
(
    in_notification_id bigserial,
    in_sender_id bigint,
    in_notification_module_id bigint,
    st_notification_description text,
    st_redirect_url text,
    st_notifier_list jsonb,
    st_status notificationStatus,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_notification_id)
);


-- DELETE THIS -> CREATE TYPE notificationDetailStatus AS ENUM ('read', 'unread' ,'deleted');
CREATE TABLE tbl_notification_template
(
    in_notification_template_id bigserial,
    in_notification_module_id bigint,
    st_notification_template_body text,
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_notification_template_id)
);

CREATE TABLE tbl_notification_module
(
    in_notification_module_id bigserial,
    st_notification_module_type_name character varying(255),
    in_parent_id bigint,
    st_status character varying(255),
    dt_created_at timestamp with time zone,
    dt_updated_at timestamp with time zone,
    PRIMARY KEY (in_notification_module_id)
);

-- Insert Module
INSERT INTO public.tbl_notification_module (
st_notification_module_type_name, in_parent_id, st_status, dt_created_at, dt_updated_at) VALUES (
'Project'::character varying(255), '0'::bigint, 'active'::character varying(255), NULL::timestamp with time zone, NULL::timestamp with time zone);

 INSERT INTO public.tbl_notification_module (st_notification_module_type_name, in_parent_id, st_status, dt_created_at, dt_updated_at) VALUES (
'Project Created'::character varying(255), '1'::bigint, 'active'::character varying(255), NULL::timestamp with time zone, NULL::timestamp with time zone);

 INSERT INTO public.tbl_notification_module (st_notification_module_type_name, in_parent_id, st_status, dt_created_at, dt_updated_at) VALUES (
'Project Updated'::character varying(255), '1'::bigint, 'active'::character varying(255), NULL::timestamp with time zone, NULL::timestamp with time zone);

 INSERT INTO public.tbl_notification_module (st_notification_module_type_name, in_parent_id, st_status, dt_created_at, dt_updated_at) VALUES (
'Project Deleted'::character varying(255), '1'::bigint, 'active'::character varying(255), NULL::timestamp with time zone, NULL::timestamp with time zone);

INSERT INTO public.tbl_notification_module (
st_notification_module_type_name, in_parent_id, st_status, dt_created_at, dt_updated_at) VALUES (
'Project Liked'::character varying(255), '1'::bigint, 'active'::character varying(255), NULL::timestamp with time zone, NULL::timestamp with time zone);

INSERT INTO public.tbl_notification_module (
st_notification_module_type_name, in_parent_id, st_status, dt_created_at, dt_updated_at) VALUES (
'Project Disliked'::character varying(255), '1'::bigint, 'active'::character varying(255), NULL::timestamp with time zone, NULL::timestamp with time zone);

INSERT INTO public.tbl_notification_module (
st_notification_module_type_name, in_parent_id, st_status, dt_created_at, dt_updated_at) VALUES (
'Project Asked Question'::character varying(255), '1'::bigint, 'active'::character varying(255), NULL::timestamp with time zone, NULL::timestamp with time zone);

INSERT INTO public.tbl_notification_module (
st_notification_module_type_name, in_parent_id, st_status, dt_created_at, dt_updated_at) VALUES (
'Project Replied On Question'::character varying(255), '1'::bigint, 'active'::character varying(255), NULL::timestamp with time zone, NULL::timestamp with time zone);

INSERT INTO public.tbl_notification_module (
st_notification_module_type_name, in_parent_id, st_status, dt_created_at, dt_updated_at) VALUES (
'Project Proposal Submitted'::character varying(255), '1'::bigint, 'active'::character varying(255), NULL::timestamp with time zone, NULL::timestamp with time zone);


-- Inserting notification template

INSERT INTO public.tbl_notification_template (
in_notification_module_id, st_notification_template_body, dt_created_at, dt_updated_at) VALUES (
'2'::bigint, '<strong class="tx-medium">{{user_name}}</strong> {{action_type}} Project. {{post_description}}.'::text, 'now()'::timestamp with time zone, 'now()'::timestamp with time zone);

INSERT INTO public.tbl_notification_template (
in_notification_module_id, st_notification_template_body, dt_created_at, dt_updated_at) VALUES (
'3'::bigint, '<strong class="tx-medium">{{user_name}}</strong> {{action_type}} Project. {{post_description}}.'::text, 'now()'::timestamp with time zone, 'now()'::timestamp with time zone);

INSERT INTO public.tbl_notification_template (
in_notification_module_id, st_notification_template_body, dt_created_at, dt_updated_at) VALUES (
'4'::bigint, '<strong class="tx-medium">{{user_name}}</strong> {{action_type}} Project. {{post_description}}.'::text, 'now()'::timestamp with time zone, 'now()'::timestamp with time zone);

INSERT INTO public.tbl_notification_template (
in_notification_module_id, st_notification_template_body, dt_created_at, dt_updated_at) VALUES (
'5'::bigint, '<strong class="tx-medium">{{user_name}}</strong> {{action_type}} Project. {{post_description}}.'::text, 'now()'::timestamp with time zone, 'now()'::timestamp with time zone);

INSERT INTO public.tbl_notification_template (
in_notification_module_id, st_notification_template_body, dt_created_at, dt_updated_at) VALUES (
'6'::bigint, '<strong class="tx-medium">{{user_name}}</strong> {{action_type}} Project. {{post_description}}.'::text, 'now()'::timestamp with time zone, 'now()'::timestamp with time zone);

INSERT INTO public.tbl_notification_template (
in_notification_module_id, st_notification_template_body, dt_created_at, dt_updated_at) VALUES (
'7'::bigint, '<strong class="tx-medium">{{user_name}}</strong> {{action_type}} On Project. {{post_description}}.'::text, 'now()'::timestamp with time zone, 'now()'::timestamp with time zone);

INSERT INTO public.tbl_notification_template (
in_notification_module_id, st_notification_template_body, dt_created_at, dt_updated_at) VALUES (
'8'::bigint, '<strong class="tx-medium">{{user_name}}</strong> {{action_type}} On Project. {{post_description}}.'::text, 'now()'::timestamp with time zone, 'now()'::timestamp with time zone);

INSERT INTO public.tbl_notification_template (
in_notification_module_id, st_notification_template_body, dt_created_at, dt_updated_at) VALUES (
'9'::bigint, '<strong class="tx-medium">{{user_name}}</strong> {{action_type}} On Project. {{post_description}}.'::text, 'now()'::timestamp with time zone, 'now()'::timestamp with time zone);
