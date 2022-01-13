const handleCastError = err => {
  return `Invalid ${err.path}: ${err.value}`
}

const handleDuplicateError = err => {
  let value = ''
  let qoutesFound = 0
  for (i = 0; i < err.errmsg.length; i++) {
    if (err.errmsg[i - 1] === '"') qoutesFound++
    if (err.errmsg[i] === '"' && qoutesFound === 1) qoutesFound++
    if (qoutesFound === 1) value += err.errmsg[i]
  }
  return `Duplicate field value: ${value}. Please use another one!`
}

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(el => el.message)
  return `Invalid input data. ${errors.join('. ')}`
}

const createError = (err, statusCode) => {
  //Message variable and if staments are there to create more personalized messages
  //but i can actually use:
  //const newErr = new Error(err) directly and get a very descent err message. In this case i actually
  //do get descent error messages for errors not specified on the if statements because message (original
  //error)does not change
  //i can also personalized messages even better adding some logic to the error handler functions
  let message = err
  if (err.name === 'CastError') message = handleCastError(err)
  if (err.code === 11000) message = handleDuplicateError(err)
  if (err.name === 'ValidationError') message = handleValidationError(err)
  if (err.name === 'JsonWebTokenError') message = 'Invalid Token'
  if (err.name === 'TokenExpiredError') message = 'Token has expired'
  const newErr = new Error(message)
  newErr.statusCode = statusCode || 500
  newErr.status = `${statusCode}`[0] === '4' ? 'fail' : 'error'
  newErr.isOperational = true
  return newErr
}

module.exports = createError