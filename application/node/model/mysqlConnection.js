const mysql = require("mysql");

const database = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "admin-648T3",
    database: process.env.DATABASE || "csc648t3_testing"
})
database.connect((err) => {
    if(err) throw err;
    console.log("connected");
});

module.exports = database;