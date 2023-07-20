const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Post = require('../../schemas/PostSchema')
const User = require('../../schemas/UserSchema')
const session = require('express-session')
const router = express.Router()

app.use(bodyParser.urlencoded({ extended: false }))

router.get("/", (req, res, next) => {
    // band-aid code for fixing "undefined" users
    Post.find()
        .populate({
            path: 'postedBy',
            populate: {
                path: 'firstName',
                path: 'lastName',
                path: 'username',
                path: 'email',
                path: 'password',
                path: 'profilePic'
            }
        })
        .sort({ "createdAt": -1})
        .then(foundPost => {
            res.status(200).send(foundPost)
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
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
            // this may not be necessary, but i'm too scared to work with populate some more
            newPost = await User.populate(newPost, { path: "postedBy"})
            res.status(201).send(newPost)
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
})

module.exports = router
