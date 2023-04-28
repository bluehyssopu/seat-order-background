const db = require('../db/index')

module.exports = {
    updateSeatStatus: function (id) {
        const seat_id = id
        // console.log(seat_id);
        const date = new Date().toLocaleDateString()
        const nowTime = new Date().getTime() // yy:mm:dd hh:mm:ss 利用getTime()比较时间戳
        const sql = "SELECT * FROM reservation WHERE seat_id = ? AND date = ? AND status='已通过'";
        db.query(sql, [seat_id, date], (err, results) => {
            if (err) {  
                return err
            } else if (results.length == 0) {
                const statusFreeSql = "update seat set status = '空闲' WHERE seat_number = ?"
                db.query(statusFreeSql, seat_id, (err2, results) => {
                    if (err2) {
                        return err2
                    } else {
                        console.log(seat_id + "座位状态更新为空闲");
                        return "座位状态更新为空闲"
                    }
                })
            } else {
                for (var i = 0; i < results.length; i++) {
                    const startTime = new Date(date + " " + results[i].start_time).getTime()
                    const endTime = new Date(date + " " + results[i].end_time).getTime()
                    console.log(startTime + " " + nowTime + " " + endTime);
                    if (nowTime >= startTime && nowTime < endTime) {
                        // 座位表中 座位号为 seat_number 不是 seat_id
                        const statusSql = "update seat set status = '使用中' WHERE seat_number = ?"
                        db.query(statusSql, seat_id, (results) => {
                            if (err) {
                                return err
                            } else {
                                return "座位状态更新成功"
                            }
                        })
                    }
                }
            }
        })
    },

    // TODO 更新预约记录表
    // 筛选当天记录 比较 endTime 和 nowTime 修改预约表状态 为已通过或已过期 
    // select id, seat_id, end_time from reservation where date=? and status='已通过' ( and username = ? )
    updateReservsationStatus: function() {
        const sql = "SELECT id, seat_id, date, end_time, status FROM reservation WHERE status='已通过'";
        db.query(sql, (err, results) => {
            if (err) {
                return err
            } else {
                for (var i = 0; i < results.length; i++) {
                    const reserveDay = new Date(results[i].date).toLocaleDateString()
                    const end_time = results[i].end_time
                    const reserveTime = new Date(reserveDay + " " + end_time).getTime()
                    const nowTime = new Date().getTime()

                    if (nowTime > reserveTime) {
                        this.changeReservetion(results[i].id)
                    }
                }
            }
        })
    },

    changeReservetion: function(id) {
        const sql = "update reservation set status = '已过期' WHERE id = ?"
        db.query(sql, id, (err, results) => {
            if (err) {
                console.log(err);
                // return
            } else {
                console.log("编号为" + id + "的预约记录已更新");
            }
        })
    },

    // 更新因签到信息改变的诚信值
    updateCredit: function() {
        const date = new Date().toLocaleDateString()
        const sql = "SELECT * from reservation WHERE date=? AND status='已过期' AND checkout='待签到'"
        db.query(sql, date, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                console.log(results);
                const reduceValue = 2
                for (var i = 0; i < results.length; i++) {
                    const username = results[i].user_id
                    const creditSql = "select credit_value from credit WHERE username = ?"
                    db.query(creditSql, username, (error, results2) => {
                        if (error) {
                            console.log(error);
                        } else {
                            const credit = results2[0].credit_value - reduceValue
                            const updateCreditSql = "update credit set credit_value=? WHERE username=?"
                            db.query(updateCreditSql, [credit, username], (err) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("用户：" + username + "的更新诚信值成功");
                                }
                            })
                        }
                    })
                }
            }
        })
    },

    updateCheckout: function() {
        const date = new Date().toLocaleDateString()
        const sql = "update reservation set checkout = '未签到' WHERE date=? AND status='已过期' AND checkout='待签到'"
        db.query(sql, date, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("更新签到状态成功");
            }
        })
    }
}
