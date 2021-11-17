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

const express = require('express')
const router = express.Router()

const searchModel = require('../model/search');
const login = require('./login')

router.get('/', searchModel.searchCategories, login.validateUser, (req, res) => {

    res.render("landingPage");
});

// Right now our root path is rendered here, we first pass the call to searchCategories to retrieve the categories from
// the database. Then we pass to the search method to actually search if we have data to search with. Search and
// searchCategories are both mart of the model which hold code that performs the interaction with the SQL database.
// The searchModel method then calls the final callback (anonymous function here) that renders the data for the client.
router.get('/search', searchModel.searchCategories, login.validateUser, searchModel.search, (req, res) => {

    // If the search result is not an array we create an empty array
    // to keep from type errors in the template. This is temporary
    // because of loading the index page into a black VP template page
    // when we have a real search bar across the site this will be removed.
    let searchResult = req.searchResult;
    if (Array.isArray(searchResult) === false) {
        searchResult = []
    }

    // Render the vertical prototype template, passing data from
    // model
    res.render("search", {
        results: 1,
        searchTerm: req.searchTerm,
        searchResult: searchResult,
        category: req.category,
        images: req.images
    });
});

/**
 * When the user attempts to load the register page checks if the user is logged in, if so redirects to /
 * TODO: Refactor this into a dedicated controller or the registration pages.
 */
router.get('/register', searchModel.searchCategories, login.validateUser, (req, res) => {

    if(req.loginValidated) {

        res.redirect("/")
    }
    else {
        res.render("studentRegister");
    }
});

/**
 * If the user attempts to load into tutor apply after already being a tutor will redirect to the dashboard.
 */
router.get('/tutorApply', searchModel.searchCategories, login.validateUser, (req, res) => {

    if(res.locals.userIsTutor === undefined || res.locals.userIsTutor  === false) {
        console.log(res.locals.userIsTutor )
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
            return console.log(err)
        }
        res.redirect('/')
    })
})

// router.get('/tutorinfo',  searchModel.searchCategories, login.validateUser, (req, res) => {
//     res.render("tutorinfo")
// });

// Removing access to tutor dashboard for now. Don't think it is needed but still investigating
// router.get('/tutorDashboard', searchModel.searchCategories, login.validateUser, (req, res) => {
//
//     res.render("tutorDashboard");
// });

module.exports = router;