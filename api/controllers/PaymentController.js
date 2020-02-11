/**
 * PaymentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * @author Abilash kumar
   * @description authenticate restapi details method.
   * @date 14 Dec 2019
   * Following function created only for testing purpose.....
   *
  */
  getCardDetails: async function (req, res){
    const fetchUserDetails = await CustomService.fetchUserDetails(
      req,
      req.body.response
    )
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: []
    }
    try{
      let cards = await PaymentService.getCardDetails(fetchUserDetails.userId)
      if(cards.rowCount>0){
        response.data = cards.rows
        response.status = 'success'
        response.msg='Got Some Cards'
      }
      else{
        response.status = 'success'
        response.msg = 'No Cards'
      }
    }
    catch(err){
      console.log(err)
    }
    finally{
      return res.json(response)
    }
  },
  clientAuth: async function (req, res) {
    const fetchUserDetails = await CustomService.fetchUserDetails(
      req,
      req.body.response
    )
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: []
    }

    try {
      // Create a transaction data and getting the id to pass it in paypal create method
      let insert = []
      let projectId
      for(let i=0; i<req.body.cartItems.length; i++){
        projectId = CustomService.decrypt(req.body.cartItems[i].projectDetails.in_project_id)
        let addData = [
          fetchUserDetails.userId,
          projectId,
          req.body.paymentType,
          parseFloat(req.body.cartItems[i].amount),
          CustomService.currentDate(),
          'initiated',
          req.body.cartItems[i].description
        ]
        let add = await PaymentService.add(addData)
        insert.push(add.rows[0])
      }
      let updateData = []
      await PaymentService.braintreePayment(req.body)
        .then(async (data) => {
          let status = ''
          if (data.status === 'settled') {
            status = 'paid'
            response.msg = 'Payment Successfull'
          }
          else {
            status = 'pending'
            response.msg = 'Payment Pending'
          }
          for(let j=0; j<insert.length; j++){
            updateData.push([
              data.transaction.id,
              data.transaction.paymentInstrumentType,
              req.body.payload.nonce,
              data.transaction.createdAt,
              data.transaction.updatedAt,
              status,
              insert[j].in_transaction_id
            ])

          }
        })
        .catch((error) => {
          response.msg = error
        })
      if (updateData.length > 0) {
        for(let k=0; k<updateData.length; k++){
          let update = await PaymentService.updatePaypalSuccess(updateData[k])
          response.data.push(update)
          if(k===updateData.length-1){
            response.status = 'success'
          }
        }
        if(req.body.saveCard){
          let addData = [
            req.body.cardDetails.number,
            req.body.cardDetails.expirationMonth,
            req.body.cardDetails.expirationYear,
            fetchUserDetails.userId,
            CustomService.currentDate(),
            CustomService.currentDate()
          ]
          let cardAdd = await PaymentService.addCard(addData)
        }
      }
    } catch (error) {
      console.log(error)
      response.msg = CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    }
    finally {
      return res.json(response)
    }
  },
  donate: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    // const transactionId = CustomService.decrypt(req.body.transactionId)
    try {
      await PaymentService.braintreePayment(req.body)
        .then(async (data) => {
          response.data = data
          response.status = 'success'
          response.msg = sails.__('msgRecordsFound', 'success')
        })
        .catch((error) => {
          response.msg = error
        })
    } catch (error) {
      console.log('ERROR:::', error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return res.json(response)
    }
  },
  refund: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    let updateData = []
    try {
      await PaymentService.braintreeRefund(req.body.data)
        .then(async (data) => {
          updateData = [
            data.transaction.id,
            new Date(),
            'returned',
            req.body.data.reason,
            req.body.data.in_transaction_id
          ]

        })
        .catch((error) => {
          response.msg = error
          console.log(error)
        })
      if (updateData.length > 0) {
        let update = await PaymentService.updateRefund(updateData)
        if (update.rowCount > 0) {
          response.data = update.rows[0]
          response.status = 'success'
          response.msg = 'Refund Successfull'
        }

      }
    } catch (error) {
      console.log('ERROR:::', error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return res.json(response)
    }
  },
  checkRefund: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    try {
      await PaymentService.checkRefund(req.body.data)
        .then((data) => {
          response.data = {
            status: data.status
          }
          if (data.status === 'settled') {
            response.msg = 'Continue for Refund'
          }
          else {
            response.msg = 'Cannot Refund, since transaction is not Successfull or Pending'
          }
          response.status = 'success'
        })
        .catch((error) => {
          response.msg = error
          console.log(error)
        })
    } catch (error) {
      console.log('ERROR:::', error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return res.json(response)
    }
  },
  checkPaymentStatus: async function (req, res) {
    let response = {
      status: 'error',
      msg: sails.__('msgSomethingWentWrong'),
      data: ''
    }
    let updateData
    try {
      let pendingPayments = await PaymentService.getPendingPayments()
      if (pendingPayments.rowCount > 0) {
        await PaymentService.checkMultipleRefund(pendingPayments.rows)
          .then(async (result) => {
            let updatingData = await result.map((payment) => {
              if (payment.status === 'settled') {
                return payment
              }
            })
            response.msg = 'All up to date'
            for (let i = 0; i < updatingData.length; i++) {
              updateData = [
                'paid',
                updatingData[i].updatedAt,
                updatingData[i].in_transaction_id
              ]
              await PaymentService.updateSettled(updateData)
              response.msg = 'Updated SuccessFully'
            }
            response.status = 'success'
            response.data = ''
          })
          .catch((error) => {
            console.log(error)
            return
          })
      }
    } catch (error) {
      console.log('ERROR:::', error)
      response.msg = await CustomService.errorHandler(
        process.env.NODE_ENV,
        error
      )
    } finally {
      return res.json(response)
    }
  }
}
