const express = require('express')
const router = express.Router()
const seatinfo_handler = require('../router_handler/seatinfo')

router.get('/seat/list', seatinfo_handler.getSeatInfoList)
router.post('/seat/zonelist', seatinfo_handler.getSeatZoneList)
router.post('/seat/reserve', seatinfo_handler.reserveSeat)

module.exports = router
