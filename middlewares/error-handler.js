module.exports = (error, req, res, next)=>{
  req.flash('error', error.message || '伺服器錯誤')
  res.redirect('back')
  next(error)
}