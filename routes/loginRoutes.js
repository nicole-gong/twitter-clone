const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const User = require('../schemas/UserSchema')
const bcrypt = require('bcrypt')
const router = express.Router()

app.set("view engine", "pug")
app.set("views", "views")
app.use(bodyParser.urlencoded({ extended: false }))

router.get("/", (req, res, next) => {
    var payload = {
        pageTitle: "User Login"
    }
    
    res.status(200).render("login", payload)
})

router.post("/", async (req, res, next) => {
    var logUsername = req.body.logUsername.trim()
    var payload = req.body
    if (logUsername && req.body.logPassword) {
        var user = await User.findOne({
            $or: [{ username: logUsername }, { email: logUsername }]
        })
            .catch((err) => {
                console.log(err)
                payload.errorMessage = "Something went wrong with your registration. Please try again."
                res.status(200).render("login", payload)
            })

        if (user != null) {
            if (await bcrypt.compare(req.body.logPassword, user.password)) {
                req.session.user = user
                return res.redirect("/");
            }
            else 
                payload.errorMessage = "Password incorrect. Please try again."
        }
        else
            payload.errorMessage = "Username not found. Please try again."
    }
    else
        payload.errorMessage = "Please make sure each field has a valid value."
    
    res.status(200).render("login", payload)

    var payload = {
        pageTitle: "User Login"
    }

    res.status(200).render("login", payload)
})

module.exports = router
