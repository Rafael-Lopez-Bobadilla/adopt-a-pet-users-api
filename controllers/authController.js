const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const createError = require('./../utils/appErrorFunc')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const coockieOptions = (logout) => {
  const options = {
    //expira en 12 horas
    expires: new Date(Date.now() +
      process.env.JWT_COOCKIE_EXPIRES_IN
      * 1000 /*12 milisegundos a segundos*/
      * 60 /*12 segundos a minutos*/
      * 60 /*12 minutos a horas*/),
    secure: false, //only sent over https
    httpOnly: true //this way it cant be manipulated by javascript on the client
  }
  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }
  if (logout) {
    options.expires = new Date(Date.now())
  }
  return options
}

const getJwtCoockie = (coockies) => {
  let token
  for (i = 0; i < coockies.length; i++) {
    if (coockies[i] === 'jwt') {
      token = coockies[i + 1]
    }
  }
  return token
}

const encryptPassword = async (password) => {
  const encryptedPassword = await bcrypt.hash(password, 12)
  return encryptedPassword
}

exports.signup = async (req, res, next) => {
  try {
    if (req.body.password.length < 4) {
      return next(createError('Password min length: 4 characters', 400))
    }
    const encryptedPassword = await encryptPassword(req.body.password)
    const newUser = await User.create({
      name: req.body.name,
      password: encryptedPassword,
    })
    //i send the token on signup to automaticly
    //sign in after signup
    const token = signToken(newUser._id)
    res.cookie('jwt', token, coockieOptions())
    //set to undefined so it is not sent to client
    newUser.password = undefined
    res.status(201).json({
      status: "success",
      data: {
        user: newUser
      }
    })
  } catch (err) {
    next(createError(err, 400))
  }
}

exports.login = async (req, res, next) => {
  try {
    const { name, password } = req.body
    if (!name || !password) {
      return next(createError('email or password no included', 400))
    }
    //select to include password field on the query
    //cause it was told in the model not to include it
    const user = await User.findOne({ name }).select('+password')
    if (!user) {
      //do not specify which filed is
      //incorrect not to give information to
      //potecial attacks
      return next(createError('Incorrect email or password', 401))
    }
    const correct = await user.correctPassword(password, user.password)
    if (!correct) {
      return next(createError('Incorrect email or password', 401))
    }
    const token = signToken(user._id)
    res.cookie('jwt', token, coockieOptions())
    res.status(200).json({
      status: "success"
    })
  } catch (err) {
    next(createError(err, 400))
  }
}

exports.protect = async (req, res, next) => {
  try {
    //verificar si hay coockies en la peticion
    const coockieString = req.headers.cookie
    if (!coockieString) {
      return next(createError('Not logged in', 401))
    }
    //obtener la coockie jtw
    //split separa la cadena de coockies en = y en ;
    const coockies = coockieString.split(/=|;/)
    const token = getJwtCoockie(coockies)
    if (!token) {
      return next(createError('Not logged in', 401))
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    //check if user still exists. but i could simply
    //mark the token invalid when user is deleted
    if (!user) {
      return next(createError('User no longer exists', 401))
    }
    req.user = user;
    next()
  } catch (err) {
    next(createError(err, 401))
  }
}

exports.logout = async (req, res, next) => {
  try {
    res.cookie('jwt', 'null', coockieOptions(true))
    res.status(200).json({
      status: 'Success'
    })
  } catch (error) {
    return next(createError(err, 400))
  }
}