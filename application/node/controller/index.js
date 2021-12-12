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

function getMostRecentFivePosts(request, response, callback) {

    let query = `SELECT users.first_name,\n` +
                `       users.last_name,\n` +
                `       tutor_post.tutor_post_id,\n` +
                `       tutor_post.user_id,\n` +
                `       tutor_post.post_thumbnail AS thumbnail,\n` +
                `       tutor_post.admin_approved,\n` +
                `       tutor_post.tutoring_course_id,\n` +
                `       tutor_post.post_created,\n`+
                `       course.number AS courseNumber,\n` +
                `       course.title AS courseTitle,\n` +
                `       major.major_long_name,\n` +
                `       major.major_short_name\n` +
                `FROM tutor_post\n` +
                `JOIN users ON tutor_post.user_id = users.user_id\n` +
                `JOIN course ON tutor_post.tutoring_course_id = course.course_id\n` +
                `JOIN major ON course.major = major.major_id\n` +
                `WHERE tutor_post.admin_approved = 1\n`+
                `ORDER BY tutor_post.post_created DESC`;

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
            let thumbnails = [];
            for(let i = 0; i < result.length; i++) {

                let thumbnail = result[i]['thumbnail'];
                if(thumbnail !== null) {
                    thumbnail = Buffer.from(thumbnail.toString('base64'));
                    thumbnails.push(thumbnail);
                }
            }

            // Append the actual data to the request.
            request.searchResult = result.slice(0, 5); // Only take the first 5 items from the results found.
            request.thumbnails = thumbnails.slice(0, 5); // Only take the first 5 items from the results found.
        }

        callback();
    });
}

/***
 * This function is called when the user loads to the home page. It first calls the getMostRecentFivePosts and then
 * displays the home page with the results found.
 */
router.get('/', lazyReg.removeLazyRegistrationObject, getMostRecentFivePosts, (req, res) => {

    let searchResult = req.searchResult;
    if (Array.isArray(searchResult) === false) {
        searchResult = [];
    }

    res.render("landingPage", {
        results: 1,
        searchResult: searchResult,
        images: req.thumbnails
    });
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
