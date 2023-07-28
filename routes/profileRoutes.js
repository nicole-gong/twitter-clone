const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const User = require('../schemas/UserSchema')
const router = express.Router()

app.set("view engine", "pug")
app.set("views", "views")
app.use(bodyParser.urlencoded({ extended: false }))

router.get("/", (req, res, next) => {
    var payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        profileUser: req.session.user
    }

    res.status(200).render("profilePage", payload)
})

router.get("/:username", async (req, res, next) => {
    var payload = await getPayload(req.params.username, req.session.user)
    res.status(200).render("profilePage", payload)
})
router.get("/:username/replies", async (req, res, next) => {
    var payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = 'replies'
    res.status(200).render("profilePage", payload)
})

async function getPayload(username, userLoggedIn) {
    var user = await User.findOne({ username: username })
    if (user == null) {
        user = await User.findById(username)
        if (user == null) 
            return {
                pageTitle: "User not Found",
                userLoggedIn: userLoggedIn,
                userLoggedInJS: JSON.stringify(userLoggedIn),
            }
    }
    
    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        userLoggedInJS: JSON.stringify(userLoggedIn), 
        profileUser: user
    }
}

module.exports = router