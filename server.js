// This file is built using Tim Edwards' notion documents found at:
// (https://dull-ceres-c2a.notion.site/Cyber-Security-Risk-Extra-Material-1aa408bc87ac80c5a62be0bc3ee23023)
// git branch unsafe-wip-2

const express = require("express");
const path = require("path");

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

function usercheck(username, email = null){ // : bool
    console.log(`usercheck.username = ${username}, usercheck.email = ${email}`)
    let query
    if(!email){
        query = "select exists(select `username` from `users` where `username` = '" + username + "') as userexists;";
    } else{
        query = "select exists(select `email` from `users` where `email` = '" + email + "') as emailexists, exists(select `username` from `users` where `username` = '" + username + "') as userexists";
    }
    return new Promise((resolve, reject) => {
        console.log(`query = ${query}`)
        db.query(query, (err,results) => {
            if(err){return reject(err);}
            console.log(`user or email exists = ${results[0].userexists || results[0].emailexists}`);
            resolve(results[0].userexists || results[0].emailexists);
        });
    });
}

// Routes
app.get("/index", (req, res) => {
    return res.render("index");
})

app.get("/signup", (req, res) => {
    return res.render("signup");
});

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

    console.log(`${email},${username},${password}`);
    const query = "INSERT INTO `users` (`email`, `username`, `password`) VALUES ('" + email + "', '" + username + "', '" + password + "')";
    db.query(query, (err, results) => {
        if(err){throw err;}
        console.log(results)
    });

    return res.status(200).redirect("dashboard");
});

app.get('/', (req, res) => {
    res.render("login");
});

app.get("/login", (req, res) => {
    return res.render("login");
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
        return res.status(400).render("login", { error: "Please fill all fields" });
    }

    function dbquery(username){
        const query = "select `password` from `users` where `username` = '" + username + "'";
            return new Promise((resolve) => {
                db.query(query, (err, result) => {
                    if(err){throw err;}
                resolve(result);
            });
        });
    }
    dbquery(username).then(result => {
        const stored_password = result[0].password;
        console.log(stored_password);

        console.log(`password correct? ${password == stored_password}`);
        if(password == stored_password){
            return res.redirect(`/dashboard?username=${username}`);
        } else{
            return res.status(200).render("login", { error: "Invalid username or password" });
        }
    });
});

app.get("/dashboard", (req, res) => {
    const username = req.query.username || undefined;
    console.log("Username from query:", req.query.username);
    return res.render("dashboard", { username });
});

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