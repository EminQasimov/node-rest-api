const express = require("express")
const mongoose = require("mongoose")
const multer = require("multer")
const Product = require("../models/product")
const checkAuth = require("../middleware/check-auth")

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads")
  },
  filename: function(req, file, cb) {
    const name = file.originalname.split(".")

    cb(null, name[0] + "-" + Date.now() + "." + name[1])
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter(req, file, cb) {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true)
    } else {
      cb(null, false)
    }
  }
})

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

// get all products
router.get("/", (req, res) => {
  Product.find()
    .select("-__v")
    .exec()
    .then(products => {
      if (products.length > 0) {
        res.status(200).json({
          message: `all product`,
          products: products
        })
      } else {
        res.status(404).json({
          message: `not have products`
        })
      }
    })
    .catch(handleError(res))
})

// get product
router.get("/:productId", (req, res) => {
  const id = req.params.productId

  Product.findById(id)
    .exec()
    .then(product => {
      if (product) {
        return res.status(200).json({
          message: `${id} getting single product`,
          product
        })
      }
      return res.status(404).json({
        message: `${id}  product not found`
      })
    })
    .catch(handleError(res))
})

// create product
router.post("/", checkAuth, upload.single("productImage"), (req, res) => {
  const product = new Product({
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  })

  product
    .save()
    .then(product => {
      res.status(201).json({
        message: "created new product",
        product
      })
    })
    .catch(handleError(res))
})

// update product
router.patch("/:productId", (req, res) => {
  const _id = req.params.productId

  Product.updateOne(
    { _id },
    {
      $set: {
        ...req.body
      }
    }
  )
    .then(product => {
      res.status(201).json({
        message: "product was updated",
        product
      })
    })
    .catch(handleError(res))
})

// delete product
router.delete("/:productId", (req, res) => {
  const _id = req.params.productId

  Product.remove({ _id })
    .exec()
    .then(product => {
      res.status(200).json({
        message: `${_id} was deleted`,
        product
      })
    })
    .catch(handleError(res))
})

module.exports = router
