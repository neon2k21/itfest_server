const db = require('../config')
const { format } = require('date-fns');
const { getMessaging } = require("firebase-admin/messaging")


class TasksController {

    // создание задания
    async createTask(req, res) {

        const now = new Date();
        let date_of_creation = format(now, 'dd/MM/yy HH:mm');

        const { user_id, name, description, deadline, category_id } = req.body
        const sql = (
            `insert into tasks (user_id, name, description, date_of_creation, deadline, completed, category_id) 
            values (?,?,?,?,?,0, ?);`
        )
        db.all(sql,[ user_id, name, description, date_of_creation, deadline, category_id ], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)     
        })

    }

    // изменение состояния задания
    async updateTaskStage(req, res) {
        
        const { task_id, completed } = req.body
        const sql = (
            `update tasks set completed=? where id= ?;`
        )
        db.all(sql,[ completed, task_id  ], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)     
        })

    }

    // получение всех заданий пользователя по фильтру
    async getAllUserTasksByFilter(req, res) {
        
        const { user_id, category } = req.body
        const sql = (
            `select * from tasks where user_id = ? and category = ?;`
        )
        db.all(sql,[ user_id, category ], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)     
        })

    }
    
    // получение всех заданий пользователя
    async getAllUserTasks(req, res) {
        const { user_id } = req.body
        const sql = (
            `select * from tasks where user_id = ?;`
        )
        db.all(sql,[ user_id ], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)     
        })

    }
    
    // открытие конкретного задания
    async getCurrentTask(req, res) {
        const { task_id } = req.body
        const sql = (
            `select * from tasks where id = ?;`
        )
        db.all(sql,[ task_id ], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)     
        })
    }

    // удаление задания
    async deleteTask(req, res) {
        const { task_id } = req.body
        const sql = (
            `delete from tasks where id = ?;`
        )
        db.all(sql,[ task_id ], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)     
        })
    }

    // создание графика или диаграммы по завершенным и не завершенным заданиям на неделю
    async createGraphByFilterForWeek(req, res) {

        const { user_id } = req.body
            const sql = `
                SELECT 
                  completed,
                  COUNT(*) as task_count
                FROM tasks
                WHERE date_of_creation BETWEEN date('now', '-7 days') AND date('now') and user_id=?
                GROUP BY completed;
            `;
        
            db.all(sql, [user_id], (err, rows) => {
                if (err) return res.json({ error: err.message });
                
                // Инициализируем объект с результатами
                const result = {
                    completed: 0,
                    uncompleted: 0
                };
        
                // Обрабатываем строки, чтобы заполнить количество завершенных и незавершенных задач
                rows.forEach(row => {
                    if (row.completed === 1) {
                        result.completed = row.task_count;
                    } else if (row.completed === 0) {
                        result.uncompleted = row.task_count;
                    }
                });
        
                // Возвращаем JSON с результатом
                return res.json(result);
            });
    }

    

    // создание графика или диаграммы по завершенным и не завершенным заданиям на день
    async createGraphByFilterForDay(req, res) {
        const { user_id } = req.body

        const sql = `
        SELECT 
          completed,
          COUNT(*) as task_count
        FROM tasks
        WHERE date_of_creation = date('now') and where user_id=? 
        GROUP BY completed;
    `;

    db.all(sql, [user_id], (err, rows) => {
        if (err) return res.json({ error: err.message });
        
        const result = {
            completed: 0,
            uncompleted: 0
        };

        rows.forEach(row => {
            if (row.completed === 1) {
                result.completed = row.task_count;
            } else if (row.completed === 0) {
                result.uncompleted = row.task_count;
            }
        });

        return res.json(result);
    });
    }

    // создание графика или диаграммы по завершенным и не завершенным заданиям на месяц
    async createGraphByFilterForMonth(req, res) {
        const { user_id } = req.body
        const sql = `
        SELECT 
          completed,
          COUNT(*) as task_count
        FROM tasks
        WHERE date_of_creation BETWEEN date('now', 'start of month') AND date('now') and where user_id=?
        GROUP BY completed;
    `;

    db.all(sql, [user_id], (err, rows) => {
        if (err) return res.json({ error: err.message });
        
        const result = {
            completed: 0,
            uncompleted: 0
        };

        rows.forEach(row => {
            if (row.completed === 1) {
                result.completed = row.task_count;
            } else if (row.completed === 0) {
                result.uncompleted = row.task_count;
            }
        });

        return res.json(result);
    });
    }


    //async writecommentpublication(req, res) {sendNotifeIfComment(publication_id)    }

}




// async function getPubOwnerToken(task_id) {
//     return new Promise((resolve, reject) => {
//         db.get(
//             `SELECT u.token
//                 FROM users u
//                 JOIN tasks t ON u.id = t.user_id
//                 WHERE t.id = ?;`, [task_id], (err, row) => {
//             if (err) reject(err); 
//             resolve(row);
//         });
//     });
// }

// async function sendNotife(task_id) {
//     const receiveToken = await getPubOwnerToken(task_id)
    
//     const message = {
//         notification: {
//             title: `Задача ${task_name}`,
//             body:  `Срок ${deadline}`,
//         },
//         token: receiveToken.token
//     }
//     getMessaging().send(message)

// }



module.exports = new TasksController()