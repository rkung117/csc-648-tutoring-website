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
const { database, mysql } = require("../model/mysqlConnection");

function getCSC(request, response, callback) {

    let query = `SELECT users.user_id,\n` +
        `       users.first_name,\n` +
        `       users.last_name,\n` +
        `       users.major,\n` +
        `       tutors.tutor_id,\n` +
        `       tutors.image,\n` +
        `       tutors.approved,\n` +
        `       major.major_long_name,\n` +
        `       major.major_short_name\n` +
        `FROM tutors\n` +
        `JOIN users ON users.user_id = tutors.tutor_id\n` +
        `JOIN major ON users.major = major.major_id\n` +
        `WHERE major.major_short_name = 'CSC' AND tutors.approved = 1`;

    // Perform the query on the database passing the result to our anonymous callback function.
    database.query(query, (err, result) => {

        // Append default data to the request before calling callback.
        request.searchResult = "";
        request.images = [];

        // If we hit an error with the mysql connection or query we just return the above empty data
        // since we have no data to display from the database. This should never happen in production.
        if(err) {
            console.log(`Encountered an error when performing query: ${query}`);
        }
        else {

            // We have received data from the database.
            // Extract all of the images from the result and convert them from mysql blob to a viewable image.
            let images = [];
            for(let i = 0; i < result.length; i++) {

                let image = result[i]['image'];
                if(image !== null) {
                    /*
                    TODO: according to spec this should be a thumbnail. Not sure if
                     we're supposed to convert here or on upload. Something to ask about?
                    */
                    image = Buffer.from(image.toString('base64'));
                    images.push(image);
                }
            }

            // Append the actual data to the request.
            request.searchResult = result.slice(0, 5); // Only take the first 5 items from the results found.
            request.images = images.slice(0, 5); // Only take the first 5 items from the results found.
        }

        callback();
    });
}

router.get('/', lazyReg.removeLazyRegistrationObject, getCSC, (req, res) => {

    let searchResult = req.searchResult;
    if (Array.isArray(searchResult) === false) {
        searchResult = [];
    }

    res.render("landingPage", {
        results: 1,
        searchResult: searchResult,
        images: req.images
    });
});


/**
 * If the user attempts to post into tutor post , the user is redirected to /
 */
router.post('/tutorPost', lazyReg.removeLazyRegistrationObject, (req, res) => {

    if(req.loginValidated) {

        res.redirect("tutorPost");
    }
    else {
        res.render("login");
    }
});

/**
 * If the user attempts to post into tutor post , the user is redirected to /
 */
 router.get('/tutorPost', lazyReg.removeLazyRegistrationObject, (req, res) => {

    res.render("tutorPost");
});

/**
 * If the user attempts to search a post, the user is redirected to /
 */
 router.get('/tutorPostInfo', (req, res) => {

    res.render("tutorPostInfo");
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

router.get('/PopUp', (req, res) => {
    res.render("PopUp")
});
module.exports = router;