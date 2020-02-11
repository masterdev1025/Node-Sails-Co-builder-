var paypal = require('paypal-rest-sdk')
var braintree = require('braintree')
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: 'hh7r98z434g6rhsp',
  publicKey: 'gzd6qbtkrx4b39ng',
  privateKey: 'd0c90ba5d5599a675995b122386b213c'
})

module.exports = {
  /**
     *
     * @author Abilash kumar
     * @description client auth.
     * @date 14 Dec 2019
     *
     */
  add: async function (dataArr) {
    return await sails.sendNativeQuery(`INSERT INTO tbl_transactions (in_user_id, in_project_id, st_payment_type, in_amount, dt_initiated, st_status, st_description)
       VALUES ( $1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      dataArr
    )
  },
  updatePaypalSuccess: async function (dataArr) {
    return await sails.sendNativeQuery(
      `update tbl_transactions
      SET st_paypal_id = $1, st_payment_method = $2, st_paypal_approval_url = $3, dt_paypal_create_time = $4, dt_paid = $5, st_status = $6
      where in_transaction_id = $7
      RETURNING *`,
      dataArr
      // `select * from tbl_transactions`
    )
  },
  updateSettled: async function (data) {
    return await sails.sendNativeQuery(`update tbl_transactions
      SET st_status = $1, dt_paid = $2
      where in_transaction_id = $3
      returning *`, data)
  },
  updateRefund: async function (dataArr) {
    return await sails.sendNativeQuery(`update tbl_transactions
      SET st_paypal_id = $1, dt_returned = $2, st_status = $3, st_reason = $4
      where in_transaction_id = $5
      RETURNING *`,
      dataArr
    )
  },
  clientAuth: async function (req) {
    const clientId = sails.config.custom.paypalClientId
    const secret = sails.config.custom.paypalSecret

    paypal.configure({
      'mode': 'sandbox', //sandbox or live
      'client_id': clientId,
      'client_secret': secret
    })
    var createPayment = {
      'intent': 'sale',
      'payer': {
        'payment_method': 'paypal'
      },
      'redirect_urls': {
        'return_url': sails.config.custom.appUrl + '/project/donate?id=' + req.returnProjectId + '&result=success&transactionId=' + req.transactionId,
        'cancel_url': sails.config.custom.appUrl + '/project/donate?id=' + req.returnProjectId + '&result=failure&transactionId=' + req.transactionId
      },
      'transactions': [{
        'item_list': {
          'items': [{
            'name': 'item',
            'sku': 'item',
            'price': req.amount,
            'currency': 'USD',
            'quantity': 1
          }]
        },
        'amount': {
          'currency': 'USD',
          'total': req.amount
        },
        'description': 'This is the payment description.'
      }]
    }
    let responseData = {
      url: '',
      id: '',
      error: true,
      time: '',
      payment_method: ''
    }
    return new Promise((resolve, reject) => {
      paypal.payment.create(createPayment, (error, payment) => {
        var links = {}

        if (error) {
          responseData['error'] = true
          resolve(responseData)
        } else {
          // Capture HATEOAS links
          payment.links.forEach((linkObj) => {
            links[linkObj.rel] = {
              href: linkObj.href,
              method: linkObj.method
            }
          })
          // If the redirect URL is present, redirect the customer to that URL
          if (links.hasOwnProperty('approval_url')) {
            // Redirect the customer to links['approval_url'].href
            responseData['url'] = links['approval_url'].href
            responseData['id'] = payment.id
            responseData['error'] = false
            responseData['time'] = payment.create_time
            responseData['payment_method'] = payment.payer.payment_method
            resolve(responseData)

          } else {
            responseData['error'] = true
            resolve(responseData)
          }
        }
      })
    })
  },
  donate: async function (req) {
    var paymentId = req.paymentId
    var payerId = { payer_id: req.PayerID }
    const clientId = sails.config.custom.paypalClientId
    const secret = sails.config.custom.paypalSecret
    return new Promise((resolve, reject) => {
      if (req.result === 'success') {
        paypal.configure({
          'mode': 'sandbox', //sandbox or live
          'client_id': clientId,
          'client_secret': secret
        })
        paypal.payment.execute(paymentId, payerId, (error, payment) => {
          if (error) {
            reject(JSON.stringify(error))
          } else {
            if (payment.state === 'approved') {
              resolve('Payment Successful')
            } else {
              reject('payment not successful')
            }
          }
        })
      }
      else {
        reject('payment not successful')
      }
    })
  },
  getUserDonationDetails: async function (data) {
    return await sails.sendNativeQuery(`select sum(in_amount) from tbl_transactions where in_project_id= $1 and st_status=$2 and in_user_id= $3`, data)
  },
  getTotalDonationDetails: async function (data) {
    return await sails.sendNativeQuery(`select sum(in_amount) from tbl_transactions where in_project_id = $1 and st_status = $2`, data)
  },
  getPendingPayments: async function () {
    return await sails.sendNativeQuery(`select in_transaction_id, st_paypal_id, st_status from tbl_transactions where st_status = 'pending'`)
  },
  braintreePayment: async function (data) {
    try {
      return new Promise((resolve, reject) => {
        gateway.transaction.sale({
          amount: data.amount,
          paymentMethodNonce: data.payload.nonce,
          options: {
            submitForSettlement: true
          }
        }, (err, result) => {
          if (err) {
            console.error(err)
            reject(err)
            return
          }

          if (result.success) {
            resolve(result)
          } else {
            console.error(result.message)
            reject(result.message)
          }
        })
      })
    }
    catch (err) {
      console.log(err)
    }
  },
  braintreeRefund: async function (data) {
    console.log('DATA:::',data)
    try {
      return new Promise((resolve, reject) => {
        gateway.transaction.refund(data.st_paypal_id, data.in_amount, (err, result) => {
          if (err) {
            console.log('ERT:',err)
            reject('Oops, Something went wrong!1')
            return
          }

          if (result.success) {
            resolve(result)
          } else {
            console.log(result)
            reject('Oops, Something went wrong!!')
          }
        })
      })
    }
    catch (err) {
      console.log('ERROR:::',err)
    }
  },
  checkRefund: async function (data) {
    console.log('ch-ref::', data)
    try {
      return new Promise((resolve, reject) => {
        if (data.st_paypal_id) {
          gateway.transaction.find(data.st_paypal_id)
            .then((details) => {
              resolve(details)
            })
            .catch((err) => {
              console.log(err)
              reject('Oops, Something went wrong!2')
            })
        }
        else {
          reject('You can only ask for refund after donation is in "Paid" status.')
        }
      })
    }
    catch (err) {
      console.log(err)
      reject('Oops, Something went wrong!!')
    }
  },
  checkMultipleRefund: function (data) {
    try {
      let responseData = []

      for (let i = 0; i < data.length; i++) {
        responseData.push(new Promise((resolve, reject) => {
          if (data[i].st_paypal_id) {
            gateway.transaction.find(data[i].st_paypal_id)
              .then((details) => {
                data[i]['status'] = details.status
                data[i]['updatedAt'] = details.updatedAt
                resolve(data[i])
              })
              .catch((err) => {
                console.log(err)
                reject({
                  st_paypal_id: data[i].st_paypal_id,
                  message: 'Oops, Something went wrong!'
                })
              })
          }
          else {
            reject({
              st_paypal_id: data[i].st_paypal_id,
              message: 'Invalid Transaction'
            })
          }
        }))
      }
      return Promise.all(responseData)
    }
    catch (err) {
      console.log(err)
      reject('Oops, Something went wrong!!')
    }
  },
  getCardDetails: async function(id){
    return await sails.sendNativeQuery(`select * from tbl_users_cards where in_user_id = ${id}`)
  },
  addCard: async function(data){
    return await sails.sendNativeQuery(`INSERT into tbl_users_cards (st_card_no, st_card_month, st_card_year, in_user_id, dt_created, dt_updated)
    VALUES ($1, $2, $3, $4, $5, $6)
    returning *`, data)
  }
}
