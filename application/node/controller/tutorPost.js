/**
 *
 * @author Cameron Robinson.
 * @date 12/11/2021
 * @since  0.0.1
 */

 const express = require('express');
 const router = express.Router();
 
 const lazyReg = require('../model/lazyRegistration');
 const { database, mysql } = require("../model/mysqlConnection");


router.get('/', lazyReg.removeLazyRegistrationObject, (req, res) => {

    res.render("tutorPost");
});

router.post('/', lazyReg.removeLazyRegistrationObject, (req, res) => {

    if(req.loginValidated) {

        res.redirect("tutorPost");
    }
    else {
        res.render("login");
    }
});

module.exports = router