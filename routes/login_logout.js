const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')

const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook')

const db = require('../models')
const User = db.User


const { route } = require('./todos')

router.get('/login', (req, res, next)=>{
  return res.render('login')
})

  // 驗證 email 是否存在
  // 驗證密碼是否正確
router.post('/login', passport.authenticate('local', {
  successFlash: true,
  successRedirect: '/logmid',
  failureRedirect: '/login',
  failureFlash: true
}))

router.get('/logmid', (req, res, next)=>{
  console.log('req.session: ', req.session)
  console.log('req.user: ', req.user)
  return res.redirect('/todos')
})

router.post('/logout', (req, res, next)=>{
  console.log('req.user: ', req.user)
  console.log('req.session: ', req.session)
  req.logout((error)=>{
    if(error){
      return next(error)
    }
    req.session.destroy()
    return res.redirect('/login')
  })
})

router.get('/login/facebook', passport.authenticate('facebook', {
  scope: ['email'],
  prompt: 'select_account',
  authType: 'rerequest'
}))

router.get('/oauth2/redirect/facebook', passport.authenticate('facebook', {
  successRedirect: '/todos',
  successFlash: 'email 已存在',
  failureRedirect: '/login',
  failureFlash: true
}))

module.exports = router