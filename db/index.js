
const res = require('express/lib/response')
const mysql = require('mysql2')

const db = mysql.createPool({
    host: "127.0.0.7", // hostname可以是服务器域名，也可以是服务器IP地址
    user: "root", // 数据库用户名
    password: "123456", // 数据库密码
    database: "seat_manage", // 要连接的数据库名
})

module.exports = db
