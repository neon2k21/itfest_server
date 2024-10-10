const Router = require('express')
const router = new Router()
const userController = require('../controller/user.controller')

//Создание пользователя
router.post('/createUser', userController.createUser)

//Получение пользователя
router.post('/getuser', userController.getUser)

//Удаление пользователя
router.delete('/user', userController.deleteUser)

//Установка токена телефона к юзеру
router.put('/setusertoken', userController.setUserToken)


module.exports = router

