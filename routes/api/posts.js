const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Post = require('../../schemas/PostSchema')
const User = require('../../schemas/UserSchema')
const session = require('express-session')
const router = express.Router()

app.use(bodyParser.urlencoded({ extended: false }))

router.get("/", async (req, res, next) => {
    res.status(200).send(await getPosts({}))
})

router.get('/:id', async (req, res, next) => {
    var postID = req.params.id
    var results = await getPosts({ _id: postID })
    // for convenience with getPosts(), which uses find instead of findOne, we need to only grab the first (and only) instance of the array


    res.status(200).send(results)
})

router.post("/", (req, res, next) => {
    if (!req.body.content) 
        res.sendStatus(400)
    
    var postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    if (req.body.replyTo) 
        postData.replyTo = req.body.replyTo

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

async function getPosts(filter) {
    var results = await Post.find(filter)
        .populate("postedBy")
        .populate("repostData")
        .populate("replyTo")
        .sort({ "createdAt": -1 })
        .catch(err => console.log(err))

    var returnVal = await User.populate(results, { path: "repostData.postedBy" })
    return returnVal
}

module.exports = router
