const db = require('../config')
const { format } = require('date-fns');
const { getMessaging } = require("firebase-admin/messaging")
const moment = require('moment');


class TasksController {

    // создание задания
    async createTask(req, res) {
        const now = new Date();
        const date_of_creation = format(now, 'dd/MM/yy HH:mm');
    
        const { user_id, name, description, deadline } = req.body;
    
        const sql = `
            INSERT INTO tasks (user_id, name, description, date_of_creation, deadline, completed) 
            VALUES (?, ?, ?, ?, ?, 0);
        `;
        
        db.all(sql, [user_id, name, description, date_of_creation, deadline], (err, rows) => {
            if (err) return res.json(err);
            return res.json(rows);
        });
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
        WHERE date_of_creation = date('now') and user_id=? 
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
        WHERE date_of_creation BETWEEN date('now', 'start of month') AND date('now') and user_id=?
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

}

const sendNotification = (token, task) => {

    const message = {
      notification: {
        title: 'Напоминание о задаче',
        body: `Задача "${task.name}" скоро истекает. Дедлайн: ${task.deadline}`,
      },
      token: token,
    };
  
    getMessaging().send(message)
      .then((response) => {
        console.log('Уведомление отправлено:', response);
      })
      .catch((error) => {
        console.error('Ошибка при отправке уведомления:', error);
      });
  };
  
  // Функция для вычисления процента оставшегося времени
  const calculatePercentage = (creationDate, deadline) => {
    const now = moment();
    const start = moment(creationDate, 'DD/MM/YY HH:mm');
    const end = moment(deadline, 'DD/MM/YY HH:mm');
    const totalDuration = end.diff(start);
    const timeLeft = end.diff(now);
  
    if (timeLeft <= 0) {
      return 100; // Задача уже просрочена
    }
  
    const percentageLeft = ((totalDuration - timeLeft) / totalDuration) * 100;
    return percentageLeft;
  };
  
  // Функция для проверки задач
  const checkTasks = () => {
    const query = `
      SELECT t.id, t.name, t.description, t.deadline, t.date_of_creation, u.token
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE t.completed = 0
    `;
  
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Ошибка запроса:', err);
        return;
      }
  
      rows.forEach((task) => {
        const percentage = calculatePercentage(task.date_of_creation, task.deadline);
        // Отправляем уведомление, если процент совпадает с одним из заданных значений
        if ([10, 15, 20, 25, 30].includes(Math.floor(percentage))) {
          sendNotification(task.token, task);
        }
      });
    });
  };
  
  // Запускаем проверку раз в 5 минут
  setInterval(checkTasks, 5 * 60 * 1000);



module.exports = new TasksController()