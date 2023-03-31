// 导入数据库操作模块
const db = require('../db/index')

exports.getSeatInfoList = (req, res) => {
    const sql = `SELECT
        SUM(CASE WHEN status = '空闲' AND seat_area = 'A' THEN 1 ELSE 0 END) AS A_free,
        SUM(CASE WHEN seat_area = 'A' THEN 1 ELSE 0 END) AS A_all,
        SUM(CASE WHEN status = '空闲' AND seat_area = 'B' THEN 1 ELSE 0 END) AS B_free,
        SUM(CASE WHEN seat_area = 'B' THEN 1 ELSE 0 END) AS B_all,
        SUM(CASE WHEN status = '空闲' AND seat_area = 'R' THEN 1 ELSE 0 END) AS R_free,
        SUM(CASE WHEN seat_area = 'R' THEN 1 ELSE 0 END) AS R_all,
        COUNT(*) AS seat_all
        FROM seat;`

    db.query(sql, req, (err, results) => {
        // 1. 执行 SQL 语句失败
        if (err) return res.cc(err)
        
        // 2. 执行 SQL 语句成功，但是查询到的数据条数不等于 1
        // if (results.length == 0) return res.cc('获取座位总数失败！')
        
        // 3. 将用户信息响应给客户端
        res.send({
            status: 0,
            message: '获取座位总数成功！',
            data: results,
        })
    })
}