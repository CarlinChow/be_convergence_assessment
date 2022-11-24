const { pool } = require('../config/database')
require('express-async-errors') // wraps all async functions in a try and catch block, and calls next(err) if an error is thrown

// @route:  GET /api/todo
// @desc:   returns all todos items
// @access: PUBLIC
const getTodos = async(req, res) => {
    const getTodosQuery = { text: 'SELECT * FROM todo' }
    const queryRes = await pool.query(getTodosQuery)
    res.status(200).json(queryRes.rows)
}

// @route:  POST /api/todo
// @desc:   create a todo item
// @body:   todo object (name, description, category, dueDate)
// @access: PRIVATE (any authenticated user)
const createTodo = async(req, res) => {
    const { name, description, category, dueDate } = req.body
    const { id: userId } = req.user
    if(!name || !description || !category || !dueDate){
        res.status(400)
        throw new Error('missing fields in body')
    }
    const createTodoQuery = {
        text: 'INSERT INTO todo(name, description, category, due_date, owner_id) VALUES ($1, $2, $3, $4, $5) returning id',
        values: [name, description, category, dueDate, userId]
    }
    const queryRes = await pool.query(createTodoQuery)
    const todoId = queryRes.rows[0].id
    res.status(200).json({
        message: 'todo has been posted',
        id: todoId
    })
}

// @route:  PUT /api/todo
// @desc:   update a todo item
// @body:   updated todo object (id, name, description, category, dueDate)
// @access: PRIVATE (owner of todo obj)
const updateTodo = async(req, res) => {
    const { id: todoId, name, description, category, dueDate } = req.body
    const { id: userId } = req.user
    if(!todoId || !name || !description || !category || !dueDate){
        res.status(400)
        throw new Error('missing fields in body')
    }
    const findTodoQuery = {
        text: 'SELECT owner_id FROM todo WHERE id=$1 LIMIT 1',
        values: [todoId]
    }
    const findTodoQueryRes = await pool.query(findTodoQuery)
    if(findTodoQueryRes.rows.length == 0){
        res.status(400)
        throw new Error('invalid todo id')
    }
    const todoOwnerId = findTodoQueryRes.rows[0].owner_id
    if(todoOwnerId !== userId){ // user does not own todo object
        res.status(401)
        throw new Error('unauthorized access')
    }
    const updateTodoQuery = {
        text: 'UPDATE todo SET name=$1, description=$2, category=$3, due_date=$4 WHERE id=$5',
        values: [name, description, category, dueDate, todoId]
    }
    await pool.query(updateTodoQuery)
    res.status(200).json({ message: 'todo has been updated' })
}

// @route:  DELETE /api/todo/delete/:id
// @desc:   delete a todo item
// @params: id = id of todo item
// @access: PRIVATE (owner of todo obj)
const deleteTodo = async(req, res) => {
    const { id: todoId } = req.params
    const { id: userId } = req.user
    if(!todoId){
        res.status(400)
        throw new Error('missing todo id parameter')
    }
    const findTodoQuery = {
        text: 'SELECT owner_id FROM todo WHERE id=$1 LIMIT 1',
        values: [todoId]
    }
    const findTodoQueryRes = await pool.query(findTodoQuery)
    if(findTodoQueryRes.rows.length == 0){
        res.status(400)
        throw new Error('invalid todo id')
    }
    const todoOwnerId = findTodoQueryRes.rows[0].owner_id
    if(todoOwnerId !== userId){ // user does not own todo object
        res.status(401)
        throw new Error('unauthorized access')
    }
    const deleteTodoQuery = {
        text: 'DELETE FROM todo WHERE id=$1',
        values: [todoId]
    }
    await pool.query(deleteTodoQuery)
    res.status(200).json({ message: `todo ${todoId} has been deleted` })
}

// @route:  GET /api/todo/:filter/:query
// @desc:   search todo items by different filters
// @params: filter = column to search by (eg. category, name, description)
//          query = search string     
// @access: PUBLIC
const searchTodosByFilter = async(req, res) => {
    const { query, filter } = req.params
    if(!query || !filter){
        res.status(400)
        throw new Error('missing parameters')
    }
    if(!['name', 'category', 'description'].includes(filter.toLowerCase())){
        res.status(400)
        throw new Error('invalid filter')
    }
    const searchTodosQuery = {
        text: `SELECT * FROM todo WHERE LOWER(${filter}) LIKE '%'||$1||'%'`,
        values: [query.toLowerCase()]
    }
    const queryRes = await pool.query(searchTodosQuery)
    res.status(200).json(queryRes.rows)
}

module.exports = {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    searchTodosByFilter,
}