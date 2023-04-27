const express = require('express')
const router = express.Router()
const seatinfo_handler = require('../router_handler/seatinfo')

router.get('/seat/list', seatinfo_handler.getSeatInfoList)
router.post('/seat/freetime', seatinfo_handler.getSeatFreeTime)
router.post('/seat/zonelist', seatinfo_handler.getSeatZoneList)
router.post('/seat/reserve', seatinfo_handler.reserveSeat)
router.post('/seat/reservations', seatinfo_handler.reserveHistory)
router.post('/seat/mine', seatinfo_handler.getSeatMine)
router.post('/seat/cancel', seatinfo_handler.cancelSeat)

module.exports = router
