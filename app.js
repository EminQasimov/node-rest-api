const express = require("express")
const mongoose = require("mongoose")

const morgan = require("morgan")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")

const productsRoutes = require("./api/routes/products")
const ordersRoutes = require("./api/routes/orders")
const userRoutes = require("./api/routes/user")

dotenv.config()

const dbURI = `mongodb+srv://eminAdmin:${process.env.MONGO_ATLAS_PW}@porto-m30wg.mongodb.net/test?retryWrites=true&w=majority`

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection

db.on("error", console.error.bind(console, "connection error:"))
db.once("open", function() {
  console.log("we're connected!")
})

const app = express()

app.use(morgan("dev"))
app.use("/uploads", express.static("uploads"))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,  X-Requested-With, Content-Type, Accept, Authorization"
  )

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE,PATCH")
    return res.status(200).json({})
  }
  next()
})

// handling routes
app.use("/products", productsRoutes)
app.use("/orders", ordersRoutes)
app.use("/user", userRoutes)

// fallback controller
app.use((req, res, next) => {
  const error = new Error("route not found emin")

  error.status = 404
  next(error)
})

// catching route errors
app.use((error, req, res) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})

module.exports = app
