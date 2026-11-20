//need to replace 'your_hostname' 'your_username' 'your_password' and 'your_database' with info from jawsDB

import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session'

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({extended:true}));

const pool = mysql.createPool({
    host: "your_hostname",
    user: "your_username",
    password: "your_password",
    database: "your_database",
    connectionLimit: 10,
    waitForConnections: true
});

app.set('trust proxy', 1) //trust proxy first
app.use(session({
    secret: 'keyboard-cat', //password for lockbox holding every session - realistically should be set to update periodically
    resave: false,
    saveUninitialized: true,
}))

//routes
app.get('/', isUserAuthenticated, (req, res) => {
  res.render('login.ejs');
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/login', async (req, res) => {
    //retireving entered information
    let username = req.body.username;
    let password = req.body.password;

    //select user that matches entered username
    let checkUserQuery = 
    `SELECT * FROM admin 
    WHERE username = ?`;

    let params = [username];
    let [ rows ] = await pool.query(checkUserQuery, params);

    //if no user is found... they typed in the wrong one
    if(rows.length > 0 && await bcrypt.compare(password, rows[0].password)) {

        req.session.authenticated = true;
        req.session.role = 'admin';
        req.session.username = username; //can add more of these

        res.render('home.ejs');
    } else {
        res.render('login.ejs', {error: 'Bad.'}); //need to add part in login.ejs that renders error message
    }

    //only if they have the correct username and password will it let them see the homepage

})

app.get('/newUser', (req, res) => {
    res.render('newUser.ejs');
})

app.post('/createUser', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let createUserSql = `INSERT INTO admin (username, password) VALUES (?, ?)`;

    let hashedPassword = await bcrypt.hash(password, 10);

    let params = [username, hashedPassword];

    const [rows] = await pool.query(createUserSql, params);

    res.redirect('/');
});

app.get('/quotesList', isUserAuthenticated, async (req, res) => {
    let query = 'SELECT * FROM quotes';
    const [rows] = await pool.query(query);
    console.log(rows);
    
    res.render('quotes.ejs', {quotes: rows});
});

app.get('/logout', isUserAuthenticated, async (req, res) => {
    //destroys session assigned to user
    req.session.destroy(callback => {
        //this is what happens after the session is destroyed
        res.redirect('/');
    })
})

app.get("/dbTest", async(req, res) => {
  try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
});


//function to check that the user is authenticated
function isUserAuthenticated(req, res, next) {
    if(req.session.authenticated) {
        next();
    } else {
        res.redirect('/');
    }
}