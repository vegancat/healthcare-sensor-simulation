var express = require('express')
var request = require('request')
require('dotenv').config()
var app = express()
const mongoose = require('mongoose')

const { Schema } = require('mongoose')
const sensorSchema = new Schema({
  temperature: Number,
  registrationDate: Date,
})

const dataInspector = require('./data-inspector')


const SensorModel = mongoose.model('sensor', sensorSchema)

app.get('/', function (req, res) {
  res.send('WebSense DB')
})

var dataPusher = setInterval(async function () {
  await request.get(
    `http://[aaaa::212:7404:4:404]/`,
    // --------------------------------
    // change the ip address from line above if .env files are hidden
    // --------------------------------
    async function (err, res, body) {
      if (err) {
        console.log(err)
        return
      }

      let [lightSensor, tempSensor] = dataInspector(body)

      let sensorDoc = new SensorModel({
        temperature: tempSensor,
        registrationDate: new Date().toISOString(),
      })

      await sensorDoc.save()
    }
  )
}, 5000)

mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
mongoose
  .connect('mongodb+srv://mahdi:44TbZ4qNI2eywBZW@cluster0.fuyyc.mongodb.net/sensor-db?retryWrites=true&w=majority')
  .then((res) => {
    console.log(`server is listening at port 3000`)
    app.listen(3000)
  })
  .catch((err) => {
    throw err
  })
