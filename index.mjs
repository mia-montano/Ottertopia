//need to replace 'your_hostname' 'your_username' 'your_password' and 'your_database' with info from jawsDB

import express from 'express';
import mysql from 'mysql2/promise';

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

//route localhost:3000/
app.get('/', (req, res) => {
  res.send('Hello Express app!')
});

app.get("/dbTest", async(req, res) => {
  try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest from canvas, not meant for our database yet but can use as outline in future

app.listen(3000, ()=>{
    console.log("Express server running")
})