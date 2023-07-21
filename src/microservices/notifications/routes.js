const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).json('my msg')
})
// define the about route
router.get('/about', (req, res) => {
  res.status(200).json('my msg')
})

module.exports = router