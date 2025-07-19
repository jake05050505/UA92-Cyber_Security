// This file is built using Tim Edwards' notion documents as a guide --found at:
// (https://dull-ceres-c2a.notion.site/Cyber-Security-Risk-Extra-Material-1aa408bc87ac80c5a62be0bc3ee23023)

// #region configs
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
    password: "password", // in a production environment (not localhost) this should be a strong password to prevent brute force attacks.
    database: "accounts"
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.use(session({
    secret: "secret pass",
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60 * 1000 * 60 // 1 hour
    }
}));
// #endregion

// #region GET Routes
app.get("/index", (req, res) => {
    return res.render("index");
});

app.get("/signup", (req, res) => {
    return res.render("signup");
});

app.get('/', (req, res) => {
    console.log(req.session,'\n',req.session.id);
    res.render("login");
});

app.get("/login", (req, res) => {
    return res.render("login");
});

app.get("/dashboard", (req, res) => {
    const username = req.query.username || undefined;
    return res.render("dashboard", { username });
});
// #endregion

// #region POST Routes
app.post("/signup", (req, res) => {
    const { email, username, password } = req.body;

    if(!email || !username || !password){
        return res.status(400).render("signup", { error: "Please fill all fields" });
    }
    if(email.length > 64 || username.length > 32 || password.length > 32){
        return res.status(400).render("signup", { error: "Email/Username/Password too long, please try again"}); // Should only show up if the user edits the html to remove the maxlength attribute
    }
    if (!email.includes('@') || !email.includes('.')){
        return res.status(400).render("signup", { error: "Email is not a valid format (user@example.com)" });
    }

    const insertUserQuery = "INSERT INTO `users` (`email`, `username`, `password`) VALUES ('" + email + "', '" + username + "', '" + password + "')";

    db.query(insertUserQuery, (err) => {
        if (err && err.code === "ER_DUP_ENTRY") {
            console.log("Duplicate username or email");
            return res.status(400).render("signup", { error: "A user with this username/email already exists" });
        } else if(err){throw err;}

        return res.status(200).redirect(`/dashboard?username=${username}`);
    });

});

app.post("/login", (req, res) => {
    let username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
        return res.status(400).render("login", { error: "Please fill all fields" });
    }

    const checkUserQuery = "select * from users where username = '" + username + "';";
    db.query(checkUserQuery, (err, result) => {
        if(err){throw err;}
        
        if (result.length == 0){
            return res.status(200).render("login", { error: "Invalid username or password" });
        }

        username = result[0].username
        stored_password = result[0].password;

        if(password == stored_password){
            return res.redirect(`/dashboard?username=${username}`)
        }
        else{
            return res.status(200).render("login", { error: "Invalid username or password" });
        }
    });

});
// #endregion

// #region Connections
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to the MySQL database.");
});
// #endregion