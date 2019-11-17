const express = require("express")
const mongoose = require("mongoose")
const Order = require("../models/order")
const Product = require("../models/product")
const checkAuth = require("../middleware/check-auth")

const router = express.Router()

function handleError(res) {
  return err => {
    res.status(500).json({
      error: {
        message: err.message
      }
    })
  }
}

// get all orders
router.get("/", checkAuth, (req, res) => {
  Order.find()
    .select("-__v")
    .populate("productId", "name")
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            _id: doc._id,
            product: doc.productId,
            quantity: doc.quantity
          }
        })
      })

      // res.status(404).json({
      //   message: `not such order`
      // })
    })
    .catch(handleError(res))
})

// get order
router.get("/:orderId", checkAuth, (req, res) => {
  const id = req.params.orderId
  Order.findById(id)
    .select("-__v")
    .populate("productId", "name")
    .then(order => {
      if (order) {
        return res.status(200).json({
          message: `${id} getting single order`,
          order
        })
      }

      return res.status(404).json({
        message: `${id}  order not found`
      })
    })
    .catch(handleError(res))
})

// create order
router.post("/", checkAuth, (req, res) => {
  Product.findById(req.body.productId)
    .then(product => {
      if (product) {
        const order = new Order({
          _id: mongoose.Types.ObjectId(),
          quantity: req.body.quantity,
          productId: req.body.productId
        })

        return order.save().then(order => {
          res.status(201).json({
            message: "created new order",
            order
          })
        })
      }
      res.status(404).json({
        message: "no such product have in store"
      })
    })
    .catch(handleError(res))
})

// update order
router.patch("/:orderId", checkAuth, (req, res) => {
  const _id = req.params.orderId

  Order.updateOne(
    { _id },
    {
      $set: {
        ...req.body
      }
    }
  )
    .then(order => {
      res.status(201).json({
        message: `${_id} order  was updated`,
        order
      })
    })
    .catch(handleError(res))
})

// delete order
router.delete("/:orderId", checkAuth, (req, res) => {
  const _id = req.params.orderId

  Order.remove({ _id })
    .exec()
    .then(order => {
      res.status(200).json({
        message: `${_id} was deleted`,
        order
      })
    })
    .catch(handleError(res))
})

module.exports = router
