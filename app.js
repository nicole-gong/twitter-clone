const express = require('express')
const app = express()
const mongoose = require('./database')
const bodyParser = require('body-parser')
const middleware = require('./middleware')
const session = require('express-session')
const path = require('path')
const port = 3000

const server = app.listen(port, () => console.log("Server listening on port " + port))

app.set("view engine", "pug")
app.set("views", "views")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "kokosara",
    resave: true,
    saveUninitialized: false,
}))

// routes
const loginRoute = require('./routes/loginRoutes')
const registerRoute = require('./routes/registerRoutes')
const logoutRoute = require('./routes/logoutRoutes')
const postRoute = require('./routes/postRoutes')
app.use("/login", loginRoute)
app.use("/register", registerRoute)
app.use("/logout", logoutRoute)
app.use("/posts", middleware.requireLogin, postRoute)

// api routes
const postApiRoute = require('./routes/api/posts')
app.use("/api/posts", postApiRoute)

app.get("/", middleware.requireLogin, (req, res, next) => {
    var payload = {
        pageTitle: "Critter",
        userLoggedIn: req.session.user,
        userLoggedInJS: JSON.stringify(req.session.user)
    }

    res.status(200).render("home", payload)
})