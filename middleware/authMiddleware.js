const jwt = require('jsonwebtoken')
const { pool } = require('../config/database')
require('express-async-errors') // wraps all async functions in a try and catch block, and calls next(err) if an error is thrown

const requireAuth = async(req, res, next) => {
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1] // obtain token from request header
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const findUserQuery = {
          text: 'SELECT id, username from \"user\" WHERE id = $1 limit 1',
          values: [decodedToken.id]
        }
        const queryRes = await pool.query(findUserQuery)
        const user = queryRes.rows[0]
        if(!user){ // user not found in database
          res.status(401)
          throw new Error('not authorized')
        }
        req.user = user; // set user "id" & "username" in user field of "req" variable
        next()
    }
    if(!token){ // no token provided
        res.status(401)
        throw new Error('not authorized')
    }
}

module.exports = { requireAuth }