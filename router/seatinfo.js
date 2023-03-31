const express = require('express')
const router = express.Router()
const seatinfo_handler = require('../router_handler/seatinfo')

router.get('/seat/list', seatinfo_handler.getSeatInfoList)

module.exports = router
