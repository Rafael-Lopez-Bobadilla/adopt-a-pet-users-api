const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: './config.env' })
const app = require('./app')

const DB = process.env.DATABASE.replace('<password>',
  process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(conection => {
  console.log('database conected')
})

const port = process.env.PORT
//solo declaro server para poder cerrarlo en caso de error
const server = app.listen(port, () => {
  console.log('app running')
})

process.on('unhandledRejection', err => {
  console.log(err.name, err.message)
  console.log('Shutting Down')
  server.close(() => {
    process.exit(1)
  })
})