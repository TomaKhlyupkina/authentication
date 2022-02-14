const express = require("express");
const fs = require("fs")
const path = require("path");
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy

const app = express();

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

app.use(session({ secret: "secret key", resave: false, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({ extended: true }))

passport.use(
    new localStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        (user, password, done) => {
            const foundUser = users.find(currentUser => {
                return currentUser.email === user
            })
            if (!foundUser) {
                return done(null, false, {
                    message: "User not found",
                })
            }
            if(password !== foundUser.password) {
                return done(null, false, {
                    message: "Wrong password",
                })
            }
            return done(null, {id: foundUser.id})
        }
    )
)

let users = []
const pathToDB = "./users.json"
readUsersFromDB(users)

function checkAuth(req, res) {
    if (req.user)
        return true
    return false
}

function writeUsersToDB() {
    fs.writeFileSync(pathToDB, JSON.stringify(users));
}

function readUsersFromDB() {
    if (!fs.existsSync(pathToDB)) {
        return
    }
    const data = fs.readFileSync(pathToDB, "utf8")
    if (data.length === 0) {
        return
    }
    users = JSON.parse(data)
}

class Users {
    constructor(name, email, password) {
        this.id = users.length
        this.name = name
        this.email = email
        this.password = password
        this.registrationDate = getDateNow()

        this.lastLoginDate = "TODO"
        this.status = "TODO"
    }
}

function getDateNow() {
    const dateNow = new Date()
    return (dateNow.getMonth() + 1).toString() + "/" +
        dateNow.getDate().toString() + "/" +
        dateNow.getFullYear().toString()
}

app.listen(8080, () => {
    console.log("Application listening on port 8080!");
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.get("/info", (req, res) => {
    if(checkAuth(req, res))
        res.sendFile(`${__dirname}/public/info.html`)
    else
        res.redirect("/")
    console.log(req.user)
})

app.post("/register", (req, res) => {
    if (!req.body) {
        return res.sendStatus(400)
    }
    let user = new Users(req.body.name, req.body.email, req.body.password)
    console.log(users)
    users.push(user)
    writeUsersToDB()
    res.redirect("/")
})

app.post("/login",  passport.authenticate('local', {
    successRedirect: "/info",
    failureRedirect: "/"
}))

app.post("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
})

// TODO: don't send password
app.get("/getData", (req, res) => {
    res.json(users)
})

