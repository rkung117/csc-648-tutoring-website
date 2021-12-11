
const express = require('express');
const router = express.Router();

const loginHashing = require("../model/loginHashing");

const {database, mysql} = require('../model/mysqlConnection');

function registerUser(request, response, callback){

    const hashedPassword = loginHashing.hashPasswordForRegistration(request.body.password);

    const email = request.body.email;
    const password_hashed = hashedPassword.hash;
    const password_salt = hashedPassword.salt;
    const first_name = request.body.first_name;
    const last_name = request.body.last_name;
    const major = request.body.major_dropdown;

    const sqlSearch = "SELECT * FROM users WHERE email = ?";
    const search_query = mysql.format(sqlSearch,[email]);

    request.registered = false;

    database.query (search_query, async (err, result) => {  
        
        if (err) throw (err)
        
        if (result.length != 0) {
            console.log("------> User already exists");

            // TODO: Set value to say that user email for username already exists?
            callback()
        } 
        else {
            let majorIdQuery = "SELECT major_id FROM major WHERE major_short_name = ?";
            majorIdQuery = mysql.format(majorIdQuery,[major]);
            
            await database.query (majorIdQuery, async (err, result)=> {  
                
                majorId = result[0]['major_id']

                if (result.length > 0) {

                    // TODO: Remove username here after removed from database, this default is being set here until then.
                    const sqlInsert = "INSERT INTO users (email, username, password_hashed, password_salt, first_name, last_name, major) VALUES (?,?,?,?,?,?,?)";
                    const insert_query = mysql.format(sqlInsert,[email, "TODO_REMOVE", password_hashed, password_salt, first_name, last_name, majorId]);
                    await database.query (insert_query, (err, result)=> {   
                
                        if (err) throw (err);

                        request.registered = true;
                        callback()
                    })
                }
                else {

                    // TODO: Set "unknown error" here. This is if the user
                    // somehow selects an unknown major.
                    callback()
                }
            });

        }
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

router.post('/', registerUser, (req, res) => {

    if(req.registered) {

        res.redirect("/login");
    }
    else {

        // TODO: Display error message here.
        res.render("studentRegister");
    }
});

module.exports = router;