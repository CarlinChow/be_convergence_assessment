const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { getTodos, createTodo, updateTodo, deleteTodo, searchTodosByFilter } = require('../controllers/todoController')

const router = express.Router()

// base route: /api/todo
router.route('/').get(getTodos).post(requireAuth, createTodo).put(requireAuth, updateTodo)

router.route('/delete/:id').delete(requireAuth, deleteTodo)

router.route('/search/:filter/:query').get(searchTodosByFilter)

module.exports = router