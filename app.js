const express = require('express')
const {engine} = require('express-handlebars')
const app = express()
const port = 3000

if(process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

const router = require('./routes')

const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')

const messageHandler = require('./middlewares/message-handler')
const errorHandler = require('./middlewares/error-handler')


const handlebars = require('handlebars')
const passport = require('./config/passport') //分離路由中的 passport



app.engine('.hbs', engine({extname:'.hbs'}))
app.set('view engine', '.hbs')
app.set('views', './views')

handlebars.registerHelper('eq', (arg1, arg2)=>{
  return arg1 === arg2
})



app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

app.use(messageHandler)
app.use(router)
app.use(errorHandler)

app.listen(port, ()=>{
  console.log(`server is on http://localhost:${port}`)
})