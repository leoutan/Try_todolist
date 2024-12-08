const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook')

const db = require('../models')
const User = db.User

const { Op } = require('sequelize')

const bcrypt = require('bcryptjs')

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
  return User.findOne({
    attributes : ['id', 'name', 'email', 'password'],
    where : {email : {[Op.eq] : email}},
    raw : true
  })
  .then((user)=>{
    if(!user) {
      return done(null, false, {type: 'error', message: 'email 不存在'})
    }
    return bcrypt.compare(password, user.password)
    .then((isMatch)=>{
      console.log(isMatch)
      if(!isMatch) {
        return done(null, false, {type: 'error', message: '密碼不正確'})
      }
      return done(null, user, {type: 'success', message: '登入成功'})
    })
    // 沒加密的做法
    // if(user.password !== password) {
    //   return done(null, false, {type: 'error', message: '密碼錯誤'})
    // }
    // return done(null, user, {type: 'success', message: '登入成功'})
  })
  .catch((error)=>{done(error)})
}))

passport.use(new FacebookStrategy({
  clientID : process.env.FACEBOOK_CLIENT_ID,
  clientSecret : process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL : process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['email', 'displayName'],
  passReqToCallback: true,
  authType: 'rerequest',
  prompt: 'select_account'
}, async (req, accessToken, refreshToken, profile, done)=>{
  const email = profile.emails[0].value
  const name = profile.displayName
  req.session.accessToken = accessToken
  console.log('--------------------')
  console.log('req.user: ', req.user)
  return User.findOne({
    attributes: ['id', 'name', 'email'],
    where: {email},
    raw: true
  })
  .then((user)=>{
    if(user) return done(null, user)
    const randomPwd = Math.random().toString(36).slice(-8)
    console.log('req.user: ', req.user)
    return bcrypt.hash(randomPwd, 10)
    .then((hash)=>User.create({name, email, password:hash}))
    .then((user)=>done(null, {id:user.id, name:user.name, email:user.email}))
  })
  .catch((error)=>{
    error.errorMessage='登入失敗'
    done(error)
  })
  

  // async await 寫法
  // const user = await User.findOne({
  //   attributes: ['id', 'name', 'email'],
  //   where: {email: {[Op.eq]: email}},
  //   raw: true
  // })
  // if(user) {
  //   console.log('已存在')
  //   return done(null, user)
  // }
  // const randomPwd = Math.random().toString(36).slice(-8)

  // const hash = await bcrypt.hash(randomPwd, 10)
  // const createUser = await User.create({email, password: hash})
  // done(null, {id: createUser.id, name: createUser.name, email: createUser.email})
}
))
    

passport.serializeUser((user, done)=>{
  const {id, email, password} = user
  return done(null, {id, email})
})

passport.deserializeUser((user, done)=>{
  return User.findByPk(user.id)
  .then((user)=>{
    const {id, email, password} = user
    done(null, {id, email, password})
  })
})

module.exports = passport