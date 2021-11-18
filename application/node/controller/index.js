/**
 * The controller that defines the connections to the root page of the website.
 *
 * This file defines the routes and controls the flow of data between the model and the view for the root page.
 * Currently the file serves the vertical prototype and retrieves data from two model functions before rendering
 * the resulting page to the user from the ejs view.
 *
 * @author Cameron Robinson.
 * @date 10/21/2021
 * @since  0.0.1
 */

const express = require('express');
const router = express.Router();

const lazyReg = require('../model/lazyRegistration');

router.get('/', lazyReg.removeLazyRegistrationObject, (req, res) => {

    res.render("landingPage");
});


/**
 * When the user attempts to load the register page checks if the user is logged in, if so redirects to /
 * TODO: Refactor this into a dedicated controller or the registration pages.
 */
router.get('/register', (req, res) => {

    if(req.loginValidated) {

        res.redirect("/");
    }
    else {
        res.render("studentRegister");
    }
});

/**
 * If the user attempts to load into tutor apply after already being a tutor will redirect to the dashboard.
 */
router.get('/tutorApply', lazyReg.removeLazyRegistrationObject, (req, res) => {

    if(res.locals.userIsTutor === undefined || res.locals.userIsTutor  === false) {
        console.log(res.locals.userIsTutor );
        res.render("tutorRegister");
    }
    else {
        res.redirect("/dashboard");
    }
});

/**
 * When a user hits the logout button the session data is destroyed and then the user is redirected to /
 */
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    })
});

module.exports = router;