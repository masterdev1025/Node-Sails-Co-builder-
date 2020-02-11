var _ = require('lodash')

/**
 * BlogController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * @author Abilash kumar
   * @description Blog Controller
   * @date 02 Jan 2020
   * Following function created only for testing purpose.....
   *
   */

  getBlog: async function (req, res) {
    const fetchUserDetails = await CustomService.fetchUserDetails(
      req,
      req.body.response
    )
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: {
        rss: [],
        own: [],
        categories: []
      }
    }

    try {
      // for Adding URL use this data and call the BlogService.add(addData)
      // let addData = [
      //     'http://feeds.bbci.co.uk/news/business/rss.xml',
      //     'business',
      //     new Date(),
      //     new Date()
      // ]
      let rssDistinctCategory

      if (req.body.selectedCategory === 'all') {
        rssDistinctCategory = await BlogService.getCategory()
        if (rssDistinctCategory.rowCount > 0) {
          rssDistinctCategory.rows.unshift({ st_blog_category: 'all' })
          response.data.categories = rssDistinctCategory.rows
        }
      }
      const rssRecords = await BlogService.getRss(req.body)
      if (rssRecords.rowCount > 0) {
        response.data['rss'] = rssRecords.rows
      }
      else {
        response.data['rss'] = []
      }
      response.status = 'success'
      response.msg = sails.__('msgRecordsFound', 'Blog')
      let ownRecords = await BlogService.getOwn()
      let uniqueCategory = _.uniqBy(ownRecords.rows, 'st_blog_category')
      let filteredRecords = await BlogService.filterOwnRecords(ownRecords, uniqueCategory)
      if (ownRecords.rowCount > 0) {
        response.status = 'success'
        response.msg = sails.__('msgRecordsFound', 'Blog')
        response.data['own'] = filteredRecords
      }
      else {
        response.msg = sails.__('msgNoRecordsFound', 'Blog')
      }
    } catch (error) {
      console.log(error)
    }
    finally {
      return res.json(response)
    }
  },
  blogCorn: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      let data = await BlogService.getBlogs()
      if (data.rowCount > 0) {
        let responseData = await BlogService.parseRssUrl(data.rows)
        for (let i = 0; i < data.rowCount; i++) {
          let rssItems = responseData[i].blogs.items
          let items = rssItems.map((e, index) => {
            if (e.hasOwnProperty('image')) {
              e['imageSrc'] = e.image
              return e
            }
            else {
              e['imageSrc'] = ''
              return e
            }
            // const cutExtraSpacesContent = e.content.replace(/\s\s+/g, '')
            // const regex = /src=+'([^[']+)'|src=+"([^["]+)"/g
            // const matchStr = regex.exec(cutExtraSpacesContent)
            // if (matchStr) {
            //   const filterMatch = matchStr.filter(e => {
            //     return e !== undefined
            //   })
            //   return {
            //     link: e.link,
            //     pubDate: e.pubDate,
            //     imageSrc: matchStr ? filterMatch[1] : null,
            //     title: e.title
            //   }
            // }
            // return {
            //   link: e.link ? e.link : null,
            //   pubDate: e.pubDate ? e.pubDate : null,
            //   imageSrc: e[`media:content`] ? e[`media:content`].$.url : null,
            //   title: e.title ? e.title : null
            // }
          })
          let dbItems = await BlogService.getBlogItems([data.rows[i].in_blog_id])
          dbItems = await dbItems.rows.map(obj => {
            return {
              link: obj.link.trim()
            }
          })
          let difference = _.differenceBy(items, dbItems, 'link')
          response.status = 'success'
          response.data = ''
          if (difference.length > 0) {
            difference = await difference.map(obj => {
              return [
                data.rows[i].in_blog_id,
                obj.title,
                obj.link,
                obj.content,
                obj.contentSnippet,
                obj.guid,
                obj.isoDate,
                new Date(),
                new Date(),
                obj.title.trim().split(' ').join('_'),
                'rss',
                data.rows[i].st_blog_category.trim(),
                obj.imageSrc
              ]
            })
            for (let j = 0; j < difference.length; j++) {
              if (j < 10) {
                let create = await BlogService.addBlogItem(difference[j])
              }
            }
            response.msg = 'Corn Job Finished'
          }
        }
      }
      else {
        response.msg = sails.__('msgNoRecordsFound', 'Blog')
      }
    } catch (error) {
      console.log(error)
    }
    finally {
      return res.json(response)
    }
  },
  getBlogDetail: async function (req, res) {
    const fetchUserDetails = await CustomService.fetchUserDetails(
      req,
      req.body.response
    )
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: {
        blog: {},
        recommended: [],
        categoryCount: [],
        nextBlog: [],
        tags: [],
        popularTags: [],
        latest: [],
        previousBlog: []
      }
    }

    try {
      let data = await BlogService.getBlogDetail([req.body.title + '%'])
      if (data.rowCount > 0) {
        // let responseData = await BlogService.parseRssUrl(data.rows)
        response.status = 'success'
        response.msg = sails.__('msgRecordsFound', 'Blog')
        response.data['blog'] = data.rows[0]
        let latest = await BlogService.getOwnLatest()
        let latestFilter = await BlogService.getOwnTags(latest)
        let recommended = await BlogService.getRecommended(data.rows[0])
        let recommendedFilter = await BlogService.filterOwnRecords(recommended, data.rows)
        let categoryCount = await BlogService.getCategoryCount()
        let tags = await BlogService.getTags(data.rows[0].in_item_id)
        let popularTags = await BlogService.getPopularTags()
        let nextBlog = await BlogService.getNextBlog(data.rows[0].in_item_id)
        let previousBlog = await BlogService.getPreviousBlog(data.rows[0].in_item_id)
        response.data['latest'] = latestFilter
        response.data['popularTags'] = popularTags.rows
        response.data['tags']=tags.rows
        response.data['categoryCount'] = categoryCount.rows
        response.data['previousBlog'] = previousBlog.rows

        response.data['nextBlog'] = nextBlog.rows
        if (recommended.rowCount > 0) {
          response.data['recommended'] = recommendedFilter[0]
        }
      }
      else {
        response.msg = sails.__('msgNoRecordsFound', 'Blog')
      }
    } catch (error) {
      console.log(error)
    }
    finally {
      return res.json(response)
    }
  },
  addComment: async function (req, res) {
    const fetchUserDetails = await CustomService.fetchUserDetails(
      req,
      req.body.response
    )

    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      let data = await BlogService.addComment([
        req.body.feed.in_item_id,
        req.body.comment,
        fetchUserDetails.userId,
        new Date()
      ])
      if (data.rowCount > 0) {
        response.status = 'success'
        response.data = data.rows
        response.msg = sails.__('msgRecordsFound', 'Comment')
      }
      else {
        response.status = 'success'
        response.msg = sails.__('msgNoRecordsFound', 'Comment')
      }
    } catch (error) {
      console.log(error)
    }
    finally {
      return res.json(response)
    }
  },
  getComments: async function (req, res) {
    const fetchUserDetails = await CustomService.fetchUserDetails(
      req,
      req.body.response
    )
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }

    try {
      let data = await BlogService.getComments([
        req.body.in_item_id
      ])
      if (data.rowCount > 0) {
        response.status = 'success'
        response.data = data.rows
        response.msg = sails.__('msgRecordsFound', 'Comment')
      }
    } catch (error) {
      console.log(error)
    }
    finally {
      return res.json(response)
    }
  },
  subscribe: async function (req, res) {
    const fetchUserDetails = await CustomService.fetchUserDetails(
      req,
      req.body.response
    )
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      if (fetchUserDetails.userId) {
        let create = await BlogService.subscribe([
          req.body.email,
          'active',
          new Date(),
          new Date()
        ])
        if (create.rowCount > 0) {
          response.status = 'success'
          response.msg = 'Subscribed Successfully'
          response.data = create.rows[0]
        }
      }
    }
    catch (error) {
      console.log(error)
    }
    finally {
      return res.json(response)
    }
  }
}
