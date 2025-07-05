// This file is built using Tim Edwards' notion documents found at:
// (https://dull-ceres-c2a.notion.site/Cyber-Security-Risk-Extra-Material-1aa408bc87ac80c5a62be0bc3ee23023)

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// database credentials
// const mysql = require('mysql2');
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'password', // in a production environment (not localhost) this should be a strong password to prevent brute force attacks.
//     database: 'accounts'
// });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// Routes
app.get('/index', (req, res) => {
    res.render('index')
})

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    const { email, username, password } = req.body;

    if(!username || !password || !email){
        res.status(400).send("Please fill all fields");
    };
    db.query(`select * from users where username = ${username} and password = ${password} and email = ${email}`) // unsafe

});

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// db.connect((err) => {
//     if (err) {
//         console.error('Database connection failed: ' + err.stack);
//         return;
//     };
//     console.log('Connected to the MySQL database.');
// });