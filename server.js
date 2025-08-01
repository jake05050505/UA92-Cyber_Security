// This file is built using Tim Edwards' notion documents as a guide --found at:
// (https://dull-ceres-c2a.notion.site/Cyber-Security-Risk-Extra-Material-1aa408bc87ac80c5a62be0bc3ee23023)

// #region configs
// set environment type (:test/prod)
const env = "test"; // "test" will render debug info such as partials/index, partials/viewcount, prod is purely semantic.

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

// database credentials
const mysql = require("mysql2");
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password", // in a production environment (not localhost) this should be a strong password to prevent brute force attacks. This will remain unsafe, including in the secure branch (should be origin/master).
    database: "accounts"
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.use(session({
    secret: "secret password", // Not safe - easily guessable, users can forge cookies and sessions if they know this, such as by setting req.session.username = "admin"
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 30, // 1 hour
        secure: false
    }
}));
// #endregion

// #region GET Routes
app.get("/index", (req, res) => {
    req.session.username = (req.session.username || 0);
    return res.render("index", { env, viewcount: req.session.viewcount });
});

app.get("/signup", (req, res) => {
    req.session.viewcount = (req.session.viewcount || 0) + 1;
    return res.render("signup", { env, viewcount: req.session.viewcount });
});

// helper function to ensure app.get("/") and app.get("/login") do the same thing
function render_login(req, res){
    req.session.viewcount = (req.session.viewcount || 0) + 1;
    return res.render("login", { env, viewcount: req.session.viewcount });
}

app.get('/', render_login);
app.get("/login", render_login);

app.get("/dashboard", (req, res) => {
    req.session.viewcount = (req.session.viewcount || 0) + 1;
    const username = req.session.username || undefined; // if req.session.username is undefined, user should be redirected to login page
    if(typeof username === "undefined"){
        return res.redirect("/login");
    }
    return res.render("dashboard", { username, env, viewcount: req.session.viewcount });
});

app.get("/logout", (req, res) => {
    delete req.session.username;
    res.redirect("/login");
});
// #endregion

// #region POST Routes
app.post("/signup", (req, res) => {
    const { email, username, password } = req.body;

    // Backend validation
    if(!email || !username || !password){
        return res.status(400).render("signup", { error: "Please fill all fields", env, viewcount: req.session.viewcount });
    }
    if(email.length > 64 || username.length > 32 || password.length > 32){
        return res.status(400).render("signup", { error: "Email/Username/Password too long, please try again", env, viewcount: req.session.viewcount }); // Should only show up if the user edits the html to remove the maxlength attribute
    }
    if (!email.includes('@') || !email.includes('.')){
        return res.status(400).render("signup", { error: "Email is not a valid format (user@example.com)", env, viewcount: req.session.viewcount });
    }

    const insertUserQuery = "INSERT INTO `users` (`email`, `username`, `password`) VALUES ('" + email + "', '" + username + "', '" + password + "');";

    db.query(insertUserQuery, (err) => {
        // A user with this username or email already exists
        if (err && err.code === "ER_DUP_ENTRY") {
            return res.status(400).render("signup", { error: "A user with this username/email already exists", env, viewcount: req.session.viewcount });
        } else if(err){throw err;}

        req.session.username = username;
        return res.status(302).redirect("/dashboard");
    });

});

app.post("/login", (req, res) => {
    let username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
        return res.status(400).render("login", { error: "Please fill all fields", env, viewcount: req.session.viewcount });
    }

    const checkUserQuery = "select * from users where username = '" + username + "';";
    db.query(checkUserQuery, (err, result) => {
        // tried to insert username/email which already exists
        if(err && err.code == "ER_PARSE_ERROR"){
            return res.status(500).render("login", { error: "Internal Server Error", env, viewcount: req.session.viewcount });
        } else if(err){throw err;}

        if (result.length == 0){
            return res.status(401).render("login", { error: "Invalid username or password", env, viewcount: req.session.viewcount });
        }

        username = result[0].username;
        stored_password = result[0].password;

        if(password == stored_password){
            req.session.username = username;
            return res.status(200).redirect("/dashboard");
        }
        else{
            return res.status(401).render("login", { error: "Invalid username or password", env, viewcount: req.session.viewcount });
        }
    });

});
// #endregion

// #region Connections
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if(env=="test"){console.log("Debugging enabled, see env variable to toggle");}
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to the MySQL database.");
});
// #endregion