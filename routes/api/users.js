const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const router = express.Router()
const Post = require('../../schemas/PostSchema')
const User = require('../../schemas/UserSchema')

app.use(bodyParser.urlencoded({ extended: false }))

router.put("/:userID/follow", async (req, res, next) => {
    var userID = req.params.userID
    var user = await User.findById(userID)
    if (user == null)
        res.sendStatus(404)
    var isFollowing = user.followers && user.followers.includes(req.session.user._id)
    var ternary = isFollowing ? '$pull' : '$addToSet'
    req.session.user = await User.findByIdAndUpdate(req.session.user._id, { [ternary]: { following: userID } }, { new: true })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
    User.findByIdAndUpdate(userID, { [ternary]: { followers: req.session.user._id } })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
    res.status(200).send(req.session.user)
})

router.get("/:userID/following", async (req, res, next) => {
    User.findById(req.params.userID)
    .populate('following')
        .then(results => {
            res.status(200).send(results)
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
})
router.get("/:userID/followers", async (req, res, next) => {
    User.findById(req.params.userID)
    .populate('followers')
        .then(results => {
            res.status(200).send(results)
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
})

module.exports = router
