const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const path = require('path')
const fs = require('fs')
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

router.post("/profilePicture", upload.single('croppedImage'), (req, res, next) => {
    if (!req.file) {
        console.log('no file uploaded with ajax request')
        return res.sendStatus(400)
    }
    var filePath = `/uploads/images/${req.file.filename}.png`
    var tempPath = req.file.path
    var targetPath = path.join(__dirname, `../../${filePath}`)
    fs.rename(tempPath, targetPath, async err => {
        if (err != null) {
            console.log(err)
            return res.sendStatus(400)
        }
        
        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePic: filePath }, { new: true })
        res.sendStatus(204)
    })
})
router.post("/coverPhoto", upload.single('croppedImage'), (req, res, next) => {
    if (!req.file) {
        console.log('no file uploaded with ajax request')
        return res.sendStatus(400)
    }
    var filePath = `/uploads/images/${req.file.filename}.png`
    var tempPath = req.file.path
    var targetPath = path.join(__dirname, `../../${filePath}`)
    fs.rename(tempPath, targetPath, async err => {
        if (err != null) {
            console.log(err)
            return res.sendStatus(400)
        }
        
        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath }, { new: true })
        res.sendStatus(204)
    })
})

module.exports = router