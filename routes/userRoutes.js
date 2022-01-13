const express = require('express')
const router = express.Router()
const {
  updateFavorites,
  getFavorites
} = require('../controllers/userController')

const {
  signup,
  login,
  protect,
  logout
} = require('./../controllers/authController')

router.post('/signup', signup)
router.post('/login', login)

router.patch('/updateFavorites', protect, updateFavorites)
router.get('/getFavorites', protect, getFavorites)
router.get('/logout', protect, logout)

module.exports = router