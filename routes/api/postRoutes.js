const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const User = require('../../schemas/UserSchema')
const router = express.Router()

app.use(bodyParser.urlencoded({ extended: false }))

router.get("/", (req, res, next) => {
    
})

router.post("/", async (req, res, next) => {
    if (!req.body.content) 
        res.sendStatus(400)
    
    res.status(200).send("Request successful")
})

module.exports = router
