const express = require('express')
const router = express.Router()
const admin_handler = require('../router_handler/admin')

router.get('/admin/seatlist', admin_handler.adminSeatList)
router.get('/admin/userlist', admin_handler.adminUserList)
router.get('/admin/reservation', admin_handler.adminReservationList)

module.exports = router