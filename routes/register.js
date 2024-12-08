const express = require('express')
const { Model } = require('sequelize')
const router = express.Router()
const bcrypt = require('bcryptjs')

const db = require('../models')
const User = db.User

const { Op } = require('sequelize')

router.get('/', (req, res, next)=>{
  return res.render('register')
})

router.post('/', (req, res, next)=>{
  const { name, email, password, confirmPassword } = req.body
  if(!email || !password) {
    req.flash('error', 'email 和 password 為必填')
    return res.redirect('back')
  }
  if(password !== confirmPassword) {
    req.flash('error', 'password 和 confirmPassword 不一樣')
    return res.redirect('back')
  }
  return User.count({
    where:{email:{[Op.eq]:email}}
  })
  .then((amount)=>{
    if(amount>0) {
      req.flash('error', 'email 被註冊了')
      return res.redirect('back')
    }
    return bcrypt.hash(password, 10)
    .then((hash)=>{
      return User.create({email, password: hash})
    })
    // return User.create({email, password})
  })
  .then((user)=>{
    if(!user){
      return res.redirect('back')
    }
    req.flash('success', '註冊成功')
    return res.redirect('login')
  })
  .catch((error)=>{
    error.message = '失敗'
    next(error)
  })
})

module.exports = router