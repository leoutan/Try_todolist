const express = require('express')
const router = express.Router()
const todos = require('./todos')
const register = require('./register')
const loginAndLogout = require('./login_logout')
const auth = require('../middlewares/auth-handler')

router.use('/todos', auth, todos)
router.use('/register', register)
router.use('/', loginAndLogout)

router.get('/', (req, res)=>{
  res.redirect('/todos')
})

module.exports = router