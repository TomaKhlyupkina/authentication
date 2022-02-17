const express = require("express");
const fs = require("fs")
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")

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
            passwordField: "password",
        },
        (user, password, done) => {
            const foundUser = findUserByEmail(user)
            if (!foundUser || foundUser.status === "Block") {
                return done(null, false)
            }
            bcrypt.compare(password, foundUser.password, (err, res) => {
                if (res) {
                    foundUser.lastLoginDate = getDateNow()
                    return done(null, {id: foundUser.id})
                }
                return done(null, false)
            })

        }
    )
)

let users = []

const pathToDB = "./users.json"
readUsersFromDB(users)

function checkAuth(req, res) {
    if (!req.user) {
        return false
    }
    let foundUser = findUserById(req.user.id)
    if (!foundUser) {
        return false
    }
    return foundUser.status === "Active";
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
        this.id = getUserId()
        this.name = name
        this.email = email
        this.password = password
        this.registrationDate = getDateNow()
        this.lastLoginDate = ""
        this.status = "Active"
    }
}

function getDateNow() {
    const dateNow = new Date()
    return (dateNow.getMonth() + 1).toString() + "/" +
        dateNow.getDate().toString() + "/" +
        dateNow.getFullYear().toString()
}

function getUserId() {
    if (!users.length) {
        return 0
    }
    let usersId = []
    users.forEach(user => {
        usersId.push(user.id)
    })
    return (Math.max(...usersId) + 1)
}

function findUserById(id) {
    return users.find(currentUser => {
        return currentUser.id === id
    })
}

function findUserByEmail(email) {
    return users.find(currentUser => {
        return currentUser.email === email
    })
}

function changeUsersStatus(usersId, status) {
    users.forEach(user => {
        if (usersId.includes(user.id.toString())) {
            user.status = status
        }
    })
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
})

app.post("/register", (req, res) => {
    const foundUser = findUserByEmail(req.body.email)
    if (foundUser) {
        return res.status(400).send("Email is used")
    }
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        let user = new Users(req.body.name, req.body.email, hash)
        users.push(user)
        writeUsersToDB()
    });

    res.redirect("/")
})

app.post("/login", passport.authenticate('local', {
    successRedirect: "/info",
    failureRedirect: "/"
}))

app.post("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
})

app.get("/getData", (req, res) => {
    let usersData = users.map(a => {return {...a}})
    usersData.forEach(userData => {
        delete userData.password
    })
    res.json(usersData)
})

app.post("/block", (req, res) => {
    let checkedUsersId = JSON.parse(req.body.data)
    changeUsersStatus(checkedUsersId, "Block")
    writeUsersToDB()
    res.sendStatus(200)
})

app.post("/unblock", (req, res) => {
    let checkedUsersId = JSON.parse(req.body.data)
    changeUsersStatus(checkedUsersId, "Active")
    writeUsersToDB()
    res.sendStatus(200)
})

app.post("/delete", (req, res) => {
    let checkedUsersId = JSON.parse(req.body.data)
    users = users.filter((user) => {
        return !checkedUsersId.includes(user.id.toString())
    })
    writeUsersToDB()
    res.sendStatus(200)
})