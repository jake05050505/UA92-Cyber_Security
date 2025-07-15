// This file is built using Tim Edwards' notion documents found at:
// (https://dull-ceres-c2a.notion.site/Cyber-Security-Risk-Extra-Material-1aa408bc87ac80c5a62be0bc3ee23023)

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

function user_exists(username, email = null){ // : bool_int
    return new Promise((resolve, reject) => {
        let query
        if(!email){
            query = "select exists(select `username` from `users` where `username` = '" + username + "') as userexists;";
        } else {
            query = "select exists(select `email` from `users` where `email` = '" + email + "') as emailexists, exists(select `username` from `users` where `username` = '" + username + "') as userexists";
        }

        db.query(query, (err, result) => {
            if(err){return reject(err);}
            if(!email){
                resolve(result[0].userexists);
            }
            resolve(result[0].userexists || result[0].emailexists);
        });
    });

}

// #region Routes
app.get("/index", (req, res) => {
    return res.render("index");
})

app.get("/signup", (req, res) => {
    return res.render("signup");
});

app.get('/', (req, res) => {
    return res.render("login");
});

app.get("/login", (req, res) => {
    return res.render("login");
});
// #endregion
app.get("/dashboard", (req, res) => {
    const username = req.query.username || undefined;
    console.log("Username from query:", username);
    return res.render("dashboard", { username });
});

app.post("/signup", (req, res) => {
    const { email, username, password } = req.body;
    // #region input validation
    if(!email || !username || !password){
        return res.status(400).render("signup", { error: "Please fill all fields" });
    }
    if(email.length > 64 || username.length > 32 || password.length > 32){
        return res.status(400).render("signup", { error: "Email/Username/Password too long, please try again"}); // Should only show up if the user edits the html to remove the maxlength attribute
    }
    if (!email.includes('@') || !email.includes('.')){
        return res.status(400).render("signup", { error: "Email is not a valid format (user@example.com)" });
    }
    // #endregion
    
    user_exists(username, email).then((result) => {
        if(result==true){
            return res.status(200).render("signup", { error: "This username/email already exists." })
        }
        else{
            const query = "INSERT INTO `users` (`email`, `username`, `password`) VALUES ('" + email + "', '" + username + "', '" + password + "')";
            db.query(query, (err, results) => {
                if(err){throw err;}
                console.log(results)
            });

            return res.status(200).redirect("dashboard");
        
        }
    });

});


app.post("/login", (req, res) => {
    let username = req.body['username'];
    const password = req.body['password'];
    
    function fetchusername(username){ // : str
        const query = "select `username` from `users` where `username` = '" + username + "';";
        return new Promise((resolve,reject) => {
            db.query(query, (err, result) => {
                if(err){return reject(err);}
                resolve(result);
            });
        });
    }

    function fetchpassword(username){ // : str
        const query = "select `password` from `users` where `username` = '" + username + "';";
        return new Promise((resolve,reject) => {
            db.query(query, (err, result) => {
                if(err){return reject(err);}
                resolve(result);
            });
        });
    }

    if(!username || !password){
        return res.status(400).render("login", { error: "Please fill all fields" });
    }

    user_exists(username).then(result => {
        if(result == 0){
            return res.status(200).render("login", { error : "Invalid username or password" });
        }
        else{
            fetchusername(username).then((result) => {
                console.log(result);
                username = result[0].username;
                fetchpassword(username).then(result => {
                    const stored_password = result[0].password;
        
                    if(password == stored_password){
                        return res.redirect(`/dashboard?username=${username}`);
                    } else{
                        return res.status(200).render("login", { error: "Invalid username or password" });
                    }
                });
            });
        }
    });

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