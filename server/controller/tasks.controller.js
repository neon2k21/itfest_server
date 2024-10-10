const db = require('../config')
const { format } = require('date-fns');
const { getMessaging } = require("firebase-admin/messaging")


class TasksController {

    // создание задания
    async createTask(req, res) {}

    // изменение состояния задания
    async updateTaskStage(req, res) {}

    // получение всех заданий пользователя по фильтру
    async getAllUserTasksByFilter(req, res) {}
    
    // получение всех заданий пользователя
    async getAllUserTasks(req, res) {}
    
    // открытие конкретного задания
    async getCurrentTask(req, res) {}

    // удаление задания
    async deleteTask(req, res) {}

    // создание графика или диаграммы по завершенным и не завершенным заданиям на неделю
    async createGraphByFilterForWeek(req, res) {}

    // создание графика или диаграммы по завершенным и не завершенным заданиям на день
    async createGraphByFilterForDay(req, res) {}

    // создание графика или диаграммы по завершенным и не завершенным заданиям на месяц
    async createGraphByFilterForMonth(req, res) {}


    async writecommentpublication(req, res) {sendNotifeIfComment(publication_id)    }

}




async function getPubOwnerToken(pub_id) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT users.token
            FROM users
            JOIN publications ON users.id = publications.useradd
            WHERE publications.id = ?;`, [pub_id], (err, row) => {
            if (err) reject(err); // I assume this is how an error is thrown with your db callback
            resolve(row);
        });
    });
}

async function sendNotifeIfComment(pub_id) {
    const receiveToken = await getPubOwnerToken(pub_id)
    const message = {
        notification: {
            title: "Новый комментарий",
            body: "Только что кто-то оставил новый комментарий!",
        },
        token: receiveToken.token
    }
    getMessaging().send(message)

}



module.exports = new PublicationController()