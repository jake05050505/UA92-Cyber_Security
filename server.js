// This file is built using Tim Edwards' notion documents found at:
// (https://dull-ceres-c2a.notion.site/Cyber-Security-Risk-Extra-Material-1aa408bc87ac80c5a62be0bc3ee23023)

// Adds Express to our project
const express = require('express');
const path = require('path');

// Creates the Express application
const app = express();
const PORT = 3000;

// Used for database connection
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',    // Since your database runs locally, use 'localhost'
    user: 'root',         // Your MySQL username
    password: 'password', // Your MySQL password
    database: 'accounts'  // The database you created for this project
});

app.set('view engine', 'ejs'); // Sets the view engine to EJS
app.set('views', path.join(__dirname, 'views')); // Make sure views are served from the "views" folder that we created

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// -- SIGN UP ROUTES
app.get('/', (req, res) => {
    res.render('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    

});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

//Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    };
    console.log('Connected to the MySQL database.');
});
