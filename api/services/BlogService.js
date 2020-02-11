var Parser = require('rss-parser')
var parser = new Parser({
  customFields: {
    feed: ['image', 'img'],
    item: ['image', 'media:content']
  }
})

module.exports = {
  /**
   *
   * @author Abilash kumara
   * @description Blog Service
   * @date 02 Jan 2020
   *
   */
  createTable: async function () {
    return await sails.sendNativeQuery(`CREATE TABLE tbl_blogs
(
in_blog_id SERIAL,
st_blog_url CHAR(200),
st_blog_category CHAR(30),
dt_created TIMESTAMP with time zone,
dt_updated TIMESTAMP with time zone
)`
    )
  },
  createBlogItemTable: async function () {
    await sails.sendNativeQuery(`CREATE TYPE blogType AS ENUM ('own', 'rss')`)
    return await sails.sendNativeQuery(`CREATE TABLE tbl_blog_items
(
in_item_id SERIAL,
in_blog_id integer,
st_item_title CHAR(100),
st_item_link CHAR(200),
st_item_content CHAR(400),
st_item_content_snippet CHAR(300),
st_item_guid CHAR(200),
st_item_isoDate TIMESTAMP with time zone,
dt_created TIMESTAMP with time zone,
dt_updated TIMESTAMP with time zone,
st_title_unique CHAR(110),
st_blog_type blogType
)`
    )
  },
  createBlogCommentTable: async function () {
    return await sails.sendNativeQuery(`CREATE TABLE tbl_blog_comments
(
in_comment_id SERIAL,
in_blog_id integer,
st_comment VARCHAR(255),
in_user_id integer,
dt_created TIMESTAMP with time zone
)`
    )
  },
  alterBlogItemTable: async function () {
    await sails.sendNativeQuery(`CREATE TYPE blogType AS ENUM ('own', 'rss')`)
    return await sails.sendNativeQuery(`alter table tbl_blog_items add column st_blog_type blogType`)
  },
  add: async function (dataArr) {
    return await sails.sendNativeQuery(`INSERT INTO tbl_blogs ( st_blog_url, st_blog_category, dt_created, dt_updated)
VALUES ( $1, $2, $3, $4)
RETURNING *`,
      dataArr
    )
  },
  addComment: async function (dataArr) {
    return await sails.sendNativeQuery(`INSERT INTO tbl_blog_comments ( in_blog_id, st_comment, in_user_id, dt_created)
VALUES ( $1, $2, $3, $4)
RETURNING *`,
      dataArr
    )
  },
  addBlogItem: async function (dataArr) {
    return await sails.sendNativeQuery(`INSERT INTO tbl_blog_items
      ( in_blog_id, st_item_title, st_item_link, st_item_content, st_item_content_snippet, st_item_guid, st_item_isoDate, dt_created, dt_updated, st_title_unique, st_blog_type, st_blog_category, st_img_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      returning *`, dataArr
    )
  },
  subscribe: async function (data) {
    return await sails.sendNativeQuery(`INSERT INTO tbl_subscriptions
    (st_email_address, st_status, dt_created, dt_updated)
    VALUES ($1, $2, $3, $4)
    RETURNING *`, data)
  },
  getRecommended: async function (data) {
    return await sails.sendNativeQuery(`select * from tbl_blog_items where in_item_id != '${data.in_item_id}' and st_blog_category = '${data.st_blog_category}' and st_blog_type = '${data.st_blog_type}'`)
  },
  updateItems: async function (data) {
    return await sails.sendNativeQuery(`update tbl_blog_items set st_blog_category = $1 where in_item_id = $2`, data)
  },
  updateTable: async function (data) {
    return await sails.sendNativeQuery(`update tbl_blog_items set st_blog_type = $1 where st_blog_type is NULL`, data)
  },
  getCategory: async function () {
    return await sails.sendNativeQuery(`select DISTINCT st_blog_category from tbl_blog_items where st_blog_type='rss'`)
  },
  getAllItems: async function () {
    return await sails.sendNativeQuery(`select * from tbl_blog_items`)
  },
  getComments: async function (dataArr) {
    return await sails.sendNativeQuery(`select tbl_blog_comments.*, tbl_user_master.st_first_name, tbl_user_master.st_last_name from tbl_blog_comments left join tbl_user_master on tbl_user_master.in_user_id = tbl_blog_comments.in_user_id where tbl_blog_comments.in_blog_id = $1 order by tbl_blog_comments.dt_created`, dataArr)
  },
  getOwn: async function () {
    let query = `select tbl_blog_items.* from tbl_blog_items where tbl_blog_items.st_blog_type = 'own'`
    return await sails.sendNativeQuery(`${query}`)
  },
  getOwnLatest: async function () {
    let query = `select tbl_blog_items.* from tbl_blog_items where tbl_blog_items.st_blog_type = 'own' order by in_item_id desc limit 4`
    return await sails.sendNativeQuery(`${query}`)
  },
  getRss: async function (data) {
    let select = `select itm.* from tbl_blog_items itm where itm.st_blog_type='rss'`
    if (data.selectedCategory !== 'all') {
      select += ` and st_blog_category = '${data.selectedCategory}'`
    }
    select += ` order by itm.dt_created desc limit 9`
    return await sails.sendNativeQuery(select)
  },
  getNextBlog: async function(offset){
    return await sails.sendNativeQuery(`select st_title_unique from tbl_blog_items where st_blog_type = 'own' and in_item_id > '${offset}' order by in_item_id limit 1`)
  },
  getPreviousBlog: async function(offset){
    return await sails.sendNativeQuery(`select st_title_unique from tbl_blog_items where st_blog_type = 'own' and in_item_id < '${offset}' order by in_item_id desc limit 1`)
  },
  getTags: async function(id){
    return await sails.sendNativeQuery(`select tbl_tags.* from tbl_blog_tags join tbl_tags on tbl_blog_tags.in_tag_id = tbl_tags.in_tag_id where tbl_blog_tags.in_item_id = '${id}'`)
  },
  getBlogs: async function () {
    return await sails.sendNativeQuery(`select * from tbl_blogs`)
  },
  getBlogItems: async function (data) {
    return await sails.sendNativeQuery(`select st_item_link as link from tbl_blog_items where in_blog_id = $1`, data)
  },
  getBlogDetail: async function (data) {
    return await sails.sendNativeQuery(`select tbl_blog_items.* from tbl_blog_items where tbl_blog_items.st_title_unique LIKE $1`, data)
  },
  getCategoryCount: async function(){
    return await sails.sendNativeQuery(`select st_blog_category, count(st_blog_category) as count from tbl_blog_items where st_blog_type = 'own' group by st_blog_category`)
  },
  parseRssUrl: async function (data) {
    let responseData = []
    for (let i = 0; i < data.length; i++) {
      responseData.push(new Promise(async (resolve, reject) => {
        await parser.parseURL(data[i].st_blog_url.trim(), (err, feed) => {
          if (err) {
            reject(err)
          }
          else {
            let urlData = {
              category: data[i].st_blog_category.trim(),
              blogs: feed
            }
            resolve(urlData)
          }
        })
      })
      )
    }
    let response = await Promise.all(responseData)
    return response
  },
  filterOwnRecords: async function(ownRecords, uniqueCategory){
    let filteredRecords = []
    if(ownRecords.rowCount> 0){
      for (let i = 0; i < uniqueCategory.length; i++) {
        filteredRecords.push(new Promise(async (resolve, reject) => {
          let data=[]
          let dataLength = i === 0 ? 4 : 3
          for(let j=0; j<ownRecords.rowCount; j++){
            let own = ownRecords.rows[j]
            if (own.st_blog_category === uniqueCategory[i].st_blog_category && data.length < dataLength) {
              let tags = await BlogService.getTags(own.in_item_id)
              if(tags.rowCount>0){
                own['tags'] = tags.rows
              }
              data.push(own)
            }
            if(j===(ownRecords.rowCount-1)){
              resolve(data)
            }
          }
        }))
      }
      return await Promise.all(filteredRecords)
    }
    else{
      return Promise.resolve(filteredRecords)
    }
  },
  getOwnTags: async function(ownRecords){
    let filteredRecords = []
    if(ownRecords.rowCount>0){
      for(let j=0; j<ownRecords.rowCount; j++){
        filteredRecords.push(new Promise(async (resolve, reject) => {
          let own = ownRecords.rows[j]
          let tags = await BlogService.getTags(own.in_item_id)
          if(tags.rowCount>0){
            own['tags'] = tags.rows
          }
          resolve(own)
        }))
      }
      return await Promise.all(filteredRecords)
    }
    else{
      return Promise.resolve(filteredRecords)
    }
  },
  getPopularTags: async function (){
    return await sails.sendNativeQuery(`select * from tbl_tags order by dt_created limit 10`)
  }
}
