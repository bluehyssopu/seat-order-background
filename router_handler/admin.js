// 导入数据库操作模块
const db = require('../db/index')

exports.adminSeatList = (req, res) => {
    const sql = 'select * from seat'

    db.query(sql, (err, results) => {
        if (err) return res.cc(err)

        res.send({
            status: 0,
            message: '获取座位信息成功！',
            data: results,
        })
    })
}

exports.adminUserList = (req, res) => {
    const sql = 'select * from user'

    db.query(sql, (err, results) => {
        if (err) return res.cc(err)

        // 3. 将用户信息响应给客户端
        res.send({
            status: 0,
            message: '获取用户信息成功！',
            data: results,
        })
    })
}

exports.adminReservationList = (req, res) => {
    const sql = 'select * from reservation'

    db.query(sql, (err, results) => {
        if (err) return res.cc(err)

        // 3. 将用户信息响应给客户端
        res.send({
            status: 0,
            message: '获取预约历史信息成功！',
            data: results,
        })
    })
}