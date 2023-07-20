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
        .populate("postedBy")
        .populate("repostData")
        .sort({ "createdAt": -1})
        .then(async foundPost => {
            foundPost = await User.populate(foundPost, { path: "repostData.postedBy"})
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

router.put("/:id/like", async (req, res, next) => {
    var postID = req.params.id
    var userID = req.session.user._id

    var isLiked = req.session.user.likes && req.session.user.likes.includes(postID)
    
    // Likes and unlikes post using ternary operator, removing and adding like to likes array
    var ternary = isLiked ? "$pull" : "$addToSet" 
    req.session.user = await User.findByIdAndUpdate(userID, { [ternary]: { likes: postID } }, { new: true })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
    var post = await Post.findByIdAndUpdate(postID, { [ternary]: { likes: userID } }, { new: true })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
    
    res.status(200).send(post)
})

router.post("/:id/repost", async (req, res, next) => {
    var postID = req.params.id
    var userID = req.session.user._id
    var deletedPost = await Post.findOneAndDelete({ postedBy: userID, repostData: postID })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })
    var ternary = deletedPost != null ? "$pull" : "$addToSet"
    var repost = deletedPost
    if (repost == null) 
        repost = await Post.create({ postedBy: userID, repostData: postID })
            .catch(err => {
                console.log(err)
                res.sendStatus(400)
            })
    req.session.user = await User.findByIdAndUpdate(userID, { [ternary]: { reposts: repost._id } }, { new: true })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
    var post = await Post.findByIdAndUpdate(postID, { [ternary]: { repostUsers: userID } }, { new: true })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })
    
    res.status(200).send(post)
})
    
module.exports = router
