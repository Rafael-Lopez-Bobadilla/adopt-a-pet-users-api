const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  password: {
    type: String,
    required: [true, 'Password required'],
    //select false to never send it to the server
    //when a query is done
    select: false
  },
  favorites: [String]
})

//method avialable to every document
userSchema.methods.correctPassword = async function (candidate, actualPassword) {
  return await bcrypt.compare(candidate, actualPassword)
}

const User = mongoose.model('User', userSchema)

module.exports = User