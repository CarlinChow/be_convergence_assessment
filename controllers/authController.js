const { pool } = require('../config/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('express-async-errors') // wraps all async functions in a try and catch block, and calls next(err) if an error is thrown

// route:  POST /api/auth/login
// desc:   authenticate user, returns JSON web token if success
// body:   obj w/ username and password fields
// access: PUBLIC
const loginUser = async(req, res) => {
    const { username, password } = req.body
    if(!username || !password){
        res.status(400)
        throw new error('missing fields in body')
    }
    const findUserQuery = {
        text: "SELECT * from \"user\" WHERE username = $1 LIMIT 1",
        values: [username]
    }
    const queryRes = await pool.query(findUserQuery)
    const user = queryRes.rows[0]
    if(user && (await bcrypt.compare(password, user.password))){ // verify username and password
        res.status(200).json({
            id: user.id,
            username: user.username,
            token: jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: "3d"})
        })
    }else{
        res.status(400)
        throw new Error('invalid credentials')
    }
}

module.exports = {
    loginUser,
}