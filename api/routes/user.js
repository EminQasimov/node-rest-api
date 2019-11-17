const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const User = require("../models/user")

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

// login user
router.post("/login", (req, res) => {
  const email = req.body.email
  User.findOne({ email })
    .then(user => {
      if (user) {
        return bcrypt.compare(
          req.body.password,
          user.password,
          (err, result) => {
            if (err) {
              return new Error(err)
            }

            if (result) {
              const token = jwt.sign(
                {
                  email: user.email,
                  id: user._id
                },
                process.env.JWT_KEY,
                {
                  expiresIn: "1hr"
                }
              )

              return res.status(200).json({
                message: `logged in`,
                // user,
                token
              })
            }

            res.status(200).json({
              message: `password inccorect`
            })
          }
        )
      }
      res.status(404).json({
        message: `user not found`
      })
    })
    .catch(handleError(res))
})

// create user
router.post("/signup", (req, res) => {
  const email = req.body.email
  User.findOne({ email })
    .then(user => {
      if (!user) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return handleError(res)(err)
          }
          const user = new User({
            _id: mongoose.Types.ObjectId(),
            email,
            password: hash
          })

          user
            .save()
            .then(user => {
              res.status(201).json({
                message: "created new user",
                user
              })
            })
            .catch(handleError(res))
        })
      } else {
        res.status(409).json({
          message: "email already exist"
        })
      }
    })
    .catch(handleError(res))
})

module.exports = router
