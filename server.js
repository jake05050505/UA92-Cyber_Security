// This file is built using Tim Edwards' notion documents found at:
// (https://dull-ceres-c2a.notion.site/Cyber-Security-Risk-Extra-Material-1aa408bc87ac80c5a62be0bc3ee23023)

const express = require("express");
const path = require("path");
const { rateLimit } = require("express-rate-limit"); // edited from https://www.npmjs.com/package/express-rate-limit

const app = express();
const PORT = 3000;

// Limiter config - copied from https://www.npmjs.com/package/express-rate-limit, comments edited
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
	limit: 100, // user can make 15 requests in 15 minute window (1 request/min)
	// standardHeaders: 'draft-8',
	// legacyHeaders: false,
});

// database credentials
const mysql = require("mysql2");
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password", // in a production environment (not localhost) this should be a strong password to prevent brute force attacks.
    database: "secure"
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.use(limiter) // copied from https://www.npmjs.com/package/express-rate-limit

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
    if(email.length > 64 || username.length > 32 || password.length > 64){
        return res.status(400).render("signup", { error: "Email/Username/Password too long, please try again"}); // Should only show up if the user edits the html to remove the maxlength attribute
    }
    if (!email.includes('@') || !email.includes('.')){
        return res.status(400).render("signup", { error: "Email is not a valid format (user@example.com)" });
    }

    console.log(`${email},${username},${password}`);
    const query = "INSERT INTO `users` (`email`, `username`, `password`) VALUES (?,?,?)";
    db.query(query, [email, username, password], (err, results) => {
        if(err){throw err;}
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
        const query = "select `password` from `users` where `username` = ?";
            return new Promise((resolve) => {
                db.query(query, [username], (err, result) => {
                    if(err){throw err;}
                resolve(result);
            });
        });
    }
    dbquery(username).then(result => {
        const stored_password = result[0].password;
        

        if(password == stored_password){
            return res.redirect(`/dashboard?username=${username}`);
        } else{
            return res.status(200).render("login", { error: "Invalid username or password" });
        }
    });
});

app.get("/dashboard", (req, res) => {
    const username = req.query.username || undefined;
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