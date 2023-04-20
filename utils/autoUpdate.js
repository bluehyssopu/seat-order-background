const db = require('../db/index')

module.exports = {
    updateStatus: function (id) {
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
                return "座位状态为忙碌"
            }
        })
    }
}
