/**
 *
 * This file handles the loading of the dashboard. When the user attempts to access the dashboard the route will
 * either reject the request if the user is not logged in, redirecting them to the login page, or allow the
 * request to continue and properly make the request to the database for all data required to be displayed on the
 * dashboard.
 *
 * @author Cameron Robinson.
 * @date 11/17/2021
 * @since  0.0.1
 */

const express = require('express')
const router = express.Router()

const search = require("./search");
const login = require("./login");

const database = require('../model/mysqlConnection')

/**
 * When the user loads the dashboard this function will retrieve their messages from the database. To get to this point
 * the user will already be logged in and have their userID stored in the session data.
 * @param req request from the user
 * @param res response to be rendered to the user.
 */
function loadDashboard(req, res) {

    let userID = req.session.userID;
    userID = 2 //TODO: Remove this when we have messaging working, this sets user id to 2 at all times so can view messages in database.

    // Set up query to get all of the required message data, only for this user and sorted by newest first.
    let query = `SELECT messages.message_id,\n` +
                `       messages.date_sent,\n` +
                `       messages.message_text,\n` +
                `       messages.to_user,\n` +
                `       messages.from_user,\n` +
                `       messages.is_unread,\n` +
                `       users.first_name AS from_user_first_name,\n` +
                `       users.last_name AS from_user_last_name\n` +
                `FROM messages\n` +
                `JOIN users ON users.user_id = messages.from_user\n` +
                `WHERE messages.to_user = ${userID}\n` +
                `ORDER BY messages.date_sent DESC`;

    // Perform the query on the database passing the result to our anonymous callback function.
    database.query(query, (err, result) => {

        // Set up empty array to be used if no messages are found
        let messages = []

        // If we hit an error with the mysql connection or query we just return the above empty data
        // since we have no data to display from the database. This should never happen in production.
        if (err) {
            console.log(`Encountered an error when performing query: ${query}`)
        } else {

            // For each message found unpack the data and push new structure onto the message array
            for (let i = 0; i < result.length; i++) {

                let status = "Read"
                if(result[1]['is_unread']) {
                    status = "Unread"
                }

                messages.push({
                    tutorName: `${result[i]['from_user_first_name']} ${result[i]['from_user_last_name']}`,
                    messageText: result[i]['message_text'],
                    dateTime: result[i]['date_sent'],
                    status: status
                })
                console.log(messages)
            }
        }

        // Render dashboard, passing messages array to the view.
        res.render("studentDashboard", {
            messages: messages
        });
    });
}

/**
 * When the user attempts to load the dashboard checks if the user is logged in and if so allows the viewing of the
 * dashboard, otherwise the user is redirected to the login page.
 */
router.get('/', search.getSearchCategories, login.validateUser, (req, res) => {

    if(req.loginValidated === false) {
        res.redirect("/login");
    }
    else {
        loadDashboard(req, res)
    }
});

module.exports = router;