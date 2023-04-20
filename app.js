// 使用 express 框架
const express = require('express')

// 创建 express 的服务器实例
const app = express()
const joi = require('joi')

// 导入并配置 cors 中间件
const cors = require('cors')
app.use(cors())

// 配置解析表单数据的中间件
// extended: false 只能解析 www-data-form 的数据
app.use(express.urlencoded({ extended: false }))

// res.send()数据响应封装（一定要放在路由之前）
app.use(function (req, res, next) {
    // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
    res.cc = function (err, status = 1) {
        res.send({
            // 状态
            status,
            // 状态描述，判断 err 是 错误对象 还是 字符串
            message: err instanceof Error ? err.message : err
        })
    }
    next()
})

// 错误中间件
app.use(function (err, req, res, next) {
    // 数据验证失败
    if (err instanceof joi.ValidationError) return res.cc(err)
    // 捕获身份认证失败的错误
    if (err.name === "UnauthorizedError") return res.cc('身份认证失败！')
})


// 配置 token 中间件 一定要在路由之前
const expressJWT = require('express-jwt')
const config = require('./config/config')

// 指明不需要验证token的路径
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] }))

// 注册并导入路由模块
const userRouter = require('./router/user')
// 导入并使用用户信息路由模块
const userInfoRouter = require('./router/userinfo')
// 导入座位信息路由模块
const seatInfoRouter = require('./router/seatinfo')

app.use('/api', userRouter)
app.use('/api', seatInfoRouter)
// 注意：以 /my 开头的接口，都是有权限的接口，需要进行 Token 身份认证
app.use('/my', userInfoRouter)

const CronJob = require('cron').CronJob;
const updateStatus = require('./utils/autoUpdate');
console.log(updateStatus);

const getSeatListId = require('./utils/getSeatListId')
const seatListId = getSeatListId.getSeatListId.seatListId

console.log(seatListId);
// '* * 8-22 * * *'
const job = new CronJob('0 */20 8-22 * * *', function() {
    for (var i = 0; i < seatListId.length; i++) {
        updateStatus.updateStatus(seatListId[i]);
    }
});

job.start();

// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(4000, function () {
    console.log('api server running at http://127.0.0.1:4000')
})

module.exports = app;
