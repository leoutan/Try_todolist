const express = require('express')
const router = express.Router()

const db = require('../models')
const { raw } = require('mysql2')
const Todotry = db.TodoTry
const { Op, where } = require('sequelize')

// todos 清單
// router.get('/', (req, res, next)=>{
//   const page = parseInt(req.query.page) || 1
//   const limit = 2
//   // const {keyword} = req.query
//   return Todotry.findAll({
//     attributes: ['id', 'name', 'isComplete'],
//     // offset: (page-1)*limit,
//     // limit,
//     raw: true
//   })
//   .then((todos)=>{
//     const keyword = req.query.keyword?.toLowerCase().trim()
//     const filterKeys = ['name']
//     const filteredTodos = keyword?todos.filter((todo)=>{
//       return Object.keys(todo).some((key)=>{
//         if(filterKeys.includes(key)) {
//           return todo[key].toLowerCase().includes(keyword)
//         }
//         return false
//       })
//     }):todos
//     // req.flash('success', '資料載入完成')
//     return res.render('index', {
//       todos: filteredTodos,
//       page,
//       prev: page-1>0?page-1:page,
//       next: page+1,
//     })
//   })
//   .catch((error)=>{
//     error.message = '資料載入失敗'
//     next(error)
//   })
  
// })

router.get('/', (req, res, next)=>{
  const keyword = req.query.keyword?.toLowerCase().trim()
  const page = parseInt(req.query.page) || 1
  const limit = 4
  const condition = keyword?{name : {[Op.like]: `%${keyword}%`}}:{}
  const sortOption = req.query.sort
  const userId = req.user.id
  let sortCondition = []
  switch (sortOption) {
    case 'ASC':
    case 'DESC':
      sortCondition = [['name', sortOption]]
      break;
    case 'updatedAt_ASC':
      sortCondition = [['updatedAt', 'ASC']]
      break;
    case 'updatedAt_DESC':
      sortCondition = [['updatedAt', 'DESC']]
      break;
  }
  return Todotry.findAndCountAll({
    attributes: ['id', 'name', 'isComplete'],
    offset: (page-1)*limit,
    limit,
    where: {[Op.and]:[
      {userId},
      condition
    ]},
    order: sortCondition,
    raw: true
  })
  .then(({count, rows: todos})=>{
    const maxPage = Math.ceil(count/limit)
    console.log('keyword: ', keyword)
    return res.render('index', {
      page,
      maxPage,
      prev: page-1>0 ? page-1 : page,
      next: page+1>maxPage ? page : page+1,
      keyword,
      sort: sortOption,
      todos
    })
  })
  .catch((error)=>{
    next(error)
  })
})

// 分頁功能 
// 新增 isComplete 欄位

// 新增 todo
router.get('/new', (req, res)=>{
  res.render('new')
})

router.post('/', (req, res, next)=>{
  const {name} = req.body
  const userId = req.user.id
  return Todotry.create({name, userId})
  .then(()=>{
    req.flash('success', '新增成功')
    return res.redirect('/todos')
  })
  .catch((error)=>{
    console.log('error.message: ', error.message)
    console.log('##################################')
    console.log('error: ', error)
    console.log('##################################')
    error.message = '新增失敗'
    console.log('error.message: ', error.message)
    console.log('##################################')
    if (error.original.code === 'ER_DATA_TOO_LONG') {
      error.message = '新增失敗(todo名稱長度過長)'
    }
    next(error)
  })
  
})

// 單一todo
router.get('/:id', (req, res, next)=>{
  const id = req.params.id
  const userId = req.user.id
  return Todotry.findByPk(id, {
    raw: true
  })
  .then((todo)=>{
    if(!todo){
      req.flash('error', '資料不存在')
      return res.redirect('back')
    }
    if(todo.userId !== userId) {
      req.flash('error', '權限不足')
      return res.redirect('back')
    }
    // req.flash('success', '資料載入完成')
    return res.render('todo', {todo})
  })
  .catch((error)=>{
    error.message = '資料載入失敗'
    next(error)
  })
  
})

// 編輯 todo
router.get('/:id/edit', (req, res, next)=>{
  const id = req.params.id
  const userId = req.user.id
  return Todotry.findByPk(id, {
    raw: true
  })
  .then((todo)=>{
    if(!todo){
      req.flash('error', '資料不存在')
      return res.redirect('back')
    }
    if(todo.userId !== userId) {
      req.flash('error', '權限不足')
      return res.redirect('back')
    }
    return res.render('edit', {todo})
  })
  .catch((error)=>{
    error.message = '資料載入失敗'
    next(error)
  })
})

router.put('/:id', (req, res, next)=>{
  const {name, isComplete} = req.body
  const id = req.params.id
  const userId = req.user.id
  return Todotry.findByPk(id, {
    attributes: ['id', 'userId']
  })
  .then((todo)=>{
    if(!todo) {
      req.flash('error', '資料不存在')
      return res.redirect('back')
    }
    if(todo.userId !== userId) {
      req.flash('error', '權限不足')
      return res.redirect('back')
    }
    return todo.update({name, isComplete: isComplete === 'completed'})
    .then(()=>{
      req.flash('success', '更新成功')
      return res.redirect(`/todos/${id}`)
    })
  })
  .catch((error)=>{
    error.message = '更新失敗'
    console.log(error.original.code)
    if(error.original.code === 'ER_DATA_TOO_LONG') {
      error.message = '更新失敗，因為名稱太長'
    }
    next(error)
  })
})

// 刪除 todo
router.delete('/:id', (req, res, next)=>{
  const id = req.params.id
  const userId = req.user.id
  return Todotry.findByPk(id, {
    attributes: ['id', 'userId']
  })
  .then((todo)=>{
    if(!todo){
      req.flash('error', '資料不存在')
      return res.redirect('back')
    }
    if(todo.userId !== userId) {
      req.flash('error', '權限不足')
      return res.redirect('back')
    }
    return todo.destroy()
    .then(()=>{
      req.flash('success', '刪除成功')
      return res.redirect('/todos')
    })
  })
  .catch((error)=>{
    error.message = '刪除失敗'
    next(error)
  })
})

module.exports = router