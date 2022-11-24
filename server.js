const express = require('express')
const { errorHandler } = require("./middleware/errorMiddleware")
require('dotenv').config() // loads enviroment variables from .env file

const app = express()

// middleware for handling requests
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/todo', require('./routes/todoRoutes'))

// error handling
app.use(errorHandler)

app.listen(process.env.PORT, ()=>console.log(`server running on port ${process.env.PORT}`))

module.exports = app