const bcrypt = require('bcryptjs')

const db = require('./models')
const User = db.User
const {Op} = require('sequelize')
const passport = require('passport')



// User.findAll({
//   attributes: ['email', 'password'],
//   raw: true
// })
// .then((todos)=>{
//   const newTodos = todos.filter((todo)=>{
//     if (todo.password.startsWith('$2') && todo.password.length === 60) {
//       return false
//     }
//     return true
//   })
//   return newTodos
// })
// .then((newTodos)=>{
//   console.log(newTodos)
// })

async function updateTohashedPassword() {
  try {
    // 先取出所有使用者資料
    const todos = await User.findAll({
    attributes: ['id', 'email', 'password'],
    raw: true
    })
    console.log(todos)  

    // 篩選出沒有被 crypt 處理的使用者
    UnhashedTodos = todos.filter((todo)=>{
      if (todo.password.startsWith('$2') && todo.password.length === 60) {
        return false
      }
      return true5
    })
    console.log(UnhashedTodos)

    // 遍歷所有使用者對每個做 crypt 處理，都會回傳 promise
    const updates = UnhashedTodos.map(async (UnhashedTodo)=>{
      const hashedPassword = await bcrypt.hash(UnhashedTodo.password, 10)
      return User.update({password: hashedPassword}, {
        where:{id: UnhashedTodo.id}
      })
    })

    // 等待所有 promise 都被處理完成，才顯示更新完成
    await Promise.all(updates)
    console.log('更新完成')
  } catch (error) {
    console.log('失敗')
  }
  

}
updateTohashedPassword()