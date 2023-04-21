// 导入数据库操作模块
const db = require('../db/index')

function updateSeatStatus(id) {
    const seat_id = id
    console.log(seat_id);
    const date = new Date().toLocaleDateString()
    const nowTime = new Date().getTime() // yy:mm:dd hh:mm:ss 利用getTime()比较时间戳
    const sql = 'SELECT * FROM reservation WHERE seat_id = ? AND date = ?';
    let boolStatus = false
    db.query(sql, [seat_id, date], (err, results) => {
        if (err) {
            return err
        } else {
            for (var i = 0; i < results.length; i++) {
                const startTime = new Date(date + " " + results[i].start_time).getTime()
                const endTime = new Date(date + " " + results[i].end_time).getTime()
                console.log(startTime + " " + nowTime + " " + endTime);
                if (nowTime >= startTime && nowTime < endTime) {
                    // 座位表中 座位号为 seat_number 不是 seat_id
                    boolStatus = true
                    const statusSql = "update seat set status = '使用中' WHERE seat_number = ?"
                    db.query(statusSql, seat_id, (results) => {
                        if (err) {
                            return err
                        } else {
                            console.log("座位状态更新成功");
                            return "座位状态更新成功"
                        }
                    })
                }
            }
        }
        if (boolStatus === false) {
            const statusFreeSql = "update seat set status = '空闲' WHERE seat_number = ?"
            db.query(statusFreeSql, seat_id, (err2, results) => {
                if (err2) {
                    return err2
                } else {
                    console.log("座位状态更新为空闲");
                    return "座位状态更新为空闲"
                }
            })
        } else {
            return
        }
    })
}

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

exports.getSeatFreeTime = (req, res) => {
    const date = new Date().toLocaleDateString()
    const nowTime = new Date().toLocaleTimeString()
    const seat_id = req.body.seat_id
    const sql = "SELECT * FROM reservation WHERE seat_id = ? AND date = ?"
    db.query(sql, [seat_id, date], (err, results) => {
        if (err) {
            return res.cc("查询出错")
        } else if (results.length == 0) {
            res.send({
                status: 0,
                message: "今日该座位无人预约",
                data: "今日该座位无人预约"
            })
        } else {
            // console.log(results);
            const free_slots = []
            let strTime = "当前座位已预约时间段为："
            for (var i = 0; i < results.length; i++) {
                free_slots.push({start: results[i].start_time, end: results[i].end_time});
                strTime = strTime + results[i].start_time + "~" + results[i].end_time + "；"
            }
            res.send({
                status: 0,
                message: "查询座位空闲时间成功，返回座位空闲时间",
                data: strTime
            })
        }
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
    const query = 'SELECT * FROM reservation WHERE seat_id = ? AND date = ? AND start_time < ? AND end_time > ?';
    db.query(query, [seat_id, date, endDateTime, startDateTime], (error, results, fields) => {
        if (error) {
            return res.cc("查询出错")
        } else if (results.length > 0) {
            updateSeatStatus(seat_id)
            return res.cc("该段时间内已有预约。")
        } else { // 时间段内没有预约，创建新的预约记录
            const insertQuery = 'INSERT INTO reservation (user_id, seat_id, date, start_time, end_time) VALUES   (?, ?, ?, ?, ?)  '
            db.query(insertQuery, [user_id, seat_id, date, startDateTime, endDateTime], (error, results, fields) => {
                if (error) {
                    return res.cc("创建预约记录出错")
                } else { 
                    updateSeatStatus(seat_id)
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

exports.reserveHistory = (req, res) => {
    const user_id = req.body.user_id
    const query = "select id, seat_id, date, start_time, end_time, status from reservation where user_id=?"
    db.query(query, user_id, (error, results) => {
        if (error) {
            res.cc("预约记录查询出错")
        } else {
            const formattedData = results.map(item => {
                const date = new Date(item.date).toLocaleDateString();
                return {
                    id: item.id,
                    seat_id: item.seat_id,
                    date: date,
                    start_time: item.start_time,
                    end_time: item.end_time,
                    status: item.status
                };
            });
            // console.log(results);
            res.send({
                status: 0,
                message: "用户：" + user_id + '的预约记录查询成功',
                data: formattedData,
            })
        }
    })
}