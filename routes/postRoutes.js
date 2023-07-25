const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const User = require('../schemas/UserSchema')
const router = express.Router()

app.set("view engine", "pug")
app.set("views", "views")
app.use(bodyParser.urlencoded({ extended: false }))

router.get("/:id", (req, res, next) => {
    var payload = {
        pageTitle: "View Creet",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user),
        postID: req.params.id
    }

    res.status(200).render("postPage", payload)
})

module.exports = router