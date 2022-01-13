const express = require('express')
const router = express.Router()
/*const {
  getUser,
  updateUser,
  updateUserData
} = require('../controllers/userController')*/
const {
  signup,
  login,
  protect,
  logout
} = require('./../controllers/authController')

router.post('/signup', signup)
router.post('/login', login)

//router.patch('/updateUserData', protect, updateUserData)
router.get('/logout', protect, logout)

/*router.route('/:id')
  .get(getUser)
  .patch(updateUser)*/

module.exports = router