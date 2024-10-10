const db = require('../config')


class UserController{

    //Создание пользователя
    async createUser(req,res){
        
        const { login, pass } = req.body
        const sql = (
            `insert into users (login, pass, token) values (?, ?, "");`
        )
        db.all(sql,[ login, pass ], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)     
        })
        
    }   

    //Получение пользователя
    async getUser(req,res){
        const { login, password} = req.body
        const sql = (
            `select * from users where (login=? AND pass=?);`
        )
        db.all(sql,[login, password], (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }


    //Удаление пользователя
    async deleteUser(req,res){
        const { id } = req.body
        const sql = (
            `delete from users where id =?;`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            else res.json(rows)
         })
    }    

    //Установка токена телефона к юзеру
    async setUserToken(req,res){
        const {user, token} =req.body
        const sql = (
            ` update users set token=? where id=?;`
        )

        db.all(sql,[token, user], (err,rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })
    }

    
}



module.exports = new UserController()