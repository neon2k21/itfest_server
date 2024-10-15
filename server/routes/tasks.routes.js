const Router = require('express')
const router = new Router()
const tasksController = require('../controller/tasks.controller')

// создание задания
router.post('/createTask', tasksController.createTask)

// изменение состояния задания
router.put('/updateTaskStage', tasksController.updateTaskStage)

// получение всех заданий пользователя
router.post('/getAllUserTasks', tasksController.getAllUserTasks)

// удаление задания
router.delete('/deleteTask', tasksController.deleteTask)

// создание графика или диаграммы по завершенным и не завершенным заданиям на неделю
router.post('/createGraphByFilterForWeek', tasksController.createGraphByFilterForWeek)

// создание графика или диаграммы по завершенным и не завершенным заданиям на месяц
router.post('/createGraphByFilterForMonth', tasksController.createGraphByFilterForMonth)

// создание графика или диаграммы по завершенным и не завершенным заданиям на день
router.post('/createGraphByFilterForDay', tasksController.createGraphByFilterForDay)


router.post('/send', tasksController.sendTask)


module.exports = router