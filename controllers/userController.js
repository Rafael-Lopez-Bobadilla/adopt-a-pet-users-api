const createError = require('./../utils/appErrorFunc')
const User = require('./../models/userModel')

exports.updateFavorites = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { "$addToSet": { favorites: req.body.favorites } }, {
      new: true,
      upsert: true,
      runValidators: true
    })
    res.status(200).json({
      status: 'Success',
      user: updatedUser
    })
  } catch (err) {
    return next(createError(err, 400))
  }
}

exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({
      status: 'Success',
      favorites: user.favorites
    })
  } catch (err) {
    return next(createError(err, 400))
  }
}