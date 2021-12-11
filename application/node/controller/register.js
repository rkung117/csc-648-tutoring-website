
const express = require('express');
const router = express.Router();

const loginHashing = require("../model/loginHashing");

const {database, mysql} = require('../model/mysqlConnection');

function registerUser(request, response, callback){

    const user = request.body.name;
    const hashedPassword = loginHashing.hashPasswordForRegistration(request.body.password);

    database.connect(async (err, connection) => {

        if (err) throw (err);
        
        const sqlSearch = "SELECT * FROM userTable WHERE user = ?";
        const search_query = mysql.format(sqlSearch,[user]);
        const sqlInsert = "INSERT INTO userTable VALUES (0,?,?)";
        const insert_query = mysql.format(sqlInsert,[user, hashedPassword]);
        // ? will be replaced by values
        // ?? will be replaced by string 
        
        await connection.query (search_query, async (err, result) => {  
            
            if (err) throw (err)
            
            console.log("------> Search Results");
            console.log(result.length);
            
            if (result.length != 0) {
                connection.release();
                console.log("------> User already exists");
                res.sendStatus(409) ;
            } 
            else {
                await connection.query (insert_query, (err, result)=> {   
                    connection.release(); 
                    
                    if (err) throw (err);
                    console.log ("--------> Created new User");
                    console.log(result.insertId);
                    res.sendStatus(201);
                })
            }
        })
    })
}

router.get('/', (req, res) => {   

    if(req.loginValidated) {

        res.redirect("/");
    }
    else {
        res.render("studentRegister");
    }
});

router.post('/', (req, res) => {

    if(req.registered) {

        res.redirect("/login");
    }
    else {

        // TODO: Display error message here.
    res.render("studentRegister");    
    }
});

module.exports = router;