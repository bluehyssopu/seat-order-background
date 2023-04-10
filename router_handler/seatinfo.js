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

exports.getSeatZoneList = (req, res) => {
    // console.log(req.body);
    const sql = `select seat_area, seat_number, seat_type, status from seat where seat_area=?`

    db.query(sql, req.body.seat_area, (err, results) => {
        // 1. 执行 SQL 语句失败
        if (err) return res.cc(err)
        
        // 2. 执行 SQL 语句成功，但是查询到的数据条数不等于 1
        if (results.length == 0) return res.cc('获取该区域座位信息失败！')
        
        // 3. 将用户信息响应给客户端
        res.send({
            status: 0,
            message: '获取该区域座位信息成功！',
            data: results,
        })
    })
}

exports.reserveSeat = (req, res) => {
    // console.log(req.body);
    const user_id = req.body.user_id
    const seat_id = req.body.seat_id
    const startTime = req.body.startTime; // 前端发送的开始时间，格式为 HH:MM
    const endTime = req.body.endTime; // 前端发送的结束时间，格式为 HH:MM
    const date = new Date().toLocaleDateString()
    // 将开始时间和结束时间转换为 MySQL 格式的日期时间字符串
    const startDateTime = startTime + ':00';
    const endDateTime = endTime + ':00';
  
    // 查询数据库，判断该时间段内是否已经有预约
    const query = 'SELECT * FROM reservation WHERE seat_id = ? AND start_time < ? AND end_time > ?';
    db.query(query, [seat_id, endDateTime, startDateTime], (error, results, fields) => {
        if (error) {
            console.log(error);
            return res.cc("查询出错")
        } else if (results.length > 0) {
            console.log(results);
            return res.cc("该段时间内已有预约。This time slot has been booked")
        } else { // 时间段内没有预约，创建新的预约记录
            const insertQuery = 'INSERT INTO reservation (user_id, seat_id, date, start_time, end_time) VALUES   (?, ?, ?, ?, ?)  '
            db.query(insertQuery, [user_id, seat_id, date, startDateTime, endDateTime], (error, results, fields) => {
                if (error) {
                    console.log(error);
                    return res.cc("创建预约记录出错")
                } else { 
                    return res.cc("创建预约记录成功，返回成功信息")
                }
            })
        }
    })
}

exports.cancelSeat = (req, res) => {
    const id = req.reserveId // 预约记录的 ID
    // 删除数据库中相应的预约记录
    const query = 'DELETE FROM reservation WHERE id = ?'
    db.query(query, [id], (error, results, fields) => { 
        if (error) { // 删除出错，返回错误信息 
            res.status(500).send('Server error'); 
        } else if (results.affectedRows === 0) { // 没有找到相应的预约记录，返回错误信息 
            res.status(404).send('Appointment not found')
        } else { // 删除成功，返回成功信息 
            res.status(200).send('Cancelled successfully')
        } 
    })
}