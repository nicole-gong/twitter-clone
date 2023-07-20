const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Post = require('../../schemas/PostSchema')
const User = require('../../schemas/UserSchema')
const session = require('express-session')
const router = express.Router()

app.use(bodyParser.urlencoded({ extended: false }))

router.get("/", (req, res, next) => {
    
})

router.post("/", (req, res, next) => {
    if (!req.body.content) 
        res.sendStatus(400)
    
    var postData = {
        content: req.body.content,
        postedBy: req.session.user
    }
    Post.create(postData)
        .then(async newPost => {
            newPost = await User.populate(newPost, { path: "postedBy"})
            res.status(201).send(newPost)
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
})

module.exports = router
