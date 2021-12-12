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

const express = require('express');
const router = express.Router();

const { database, mysql } = require('../model/mysqlConnection');

const lazyReg = require("../model/lazyRegistration");
const date = require('date-and-time')

/**
 * When the user loads the dashboard this function will retrieve their messages from the database. To get to this point
 * the user will already be logged in and have their userID stored in the session data.
 * @param req request from the user
 * @param res response to be rendered to the user.
 */
function loadDashboard(req, res) {

    let userID = req.session.userID;

    // Set up query to get all of the required message data, only for this user and sorted by newest first.
    let query = `SELECT messages.message_id,\n` +
                `       messages.date_sent,\n` +
                `       messages.message_text,\n` +
                `       messages.to_user,\n` +
                `       messages.from_user,\n` +
                `       messages.is_read,\n` +
                `       users.first_name AS from_user_first_name,\n` +
                `       users.last_name AS from_user_last_name\n` +
                `FROM messages\n` +
                `JOIN users ON users.user_id = messages.from_user\n` +
                `WHERE messages.to_user = ?\n` +
                `ORDER BY messages.date_sent DESC`;
    query = mysql.format(query,[userID]);
    
    // Perform the query on the database passing the result to our anonymous callback function.
    database.query(query, (err, result) => {

        // Set up empty array to be used if no messages are found
        let messages = [];
        let messageIds = [];

        // If we hit an error with the mysql connection or query we just return the above empty data
        // since we have no data to display from the database. This should never happen in production.
        if (err) {
            console.log(`Encountered an error when performing query: ${query}`);
        } else {

            // For each message found unpack the data and push new structure onto the message array
            for (let i = 0; i < result.length; i++) {

                let status = "Unread";
                if(result[i]['is_read']) {
                    status = "Read";
                }

                let newDate = new Date(result[i]['date_sent'] - result[i]['date_sent'].getTimezoneOffset()*60*1000);
                result[i]['date_sent'] = date.format(newDate,'ddd, MMM DD YYYY HH:mm A')

                messages.push({
                    messageId: result[i]['message_id'],
                    from_user: `${result[i]['from_user_first_name']} ${result[i]['from_user_last_name']}`,
                    messageText: result[i]['message_text'],
                    dateTime: result[i]['date_sent'],
                    status: status
                });

                messageIds.push(result[i]['message_id'])
            }
        }

        // Render dashboard, passing messages array to the view.
        res.render("dashboard", {
            messages: messages,
            messageIds: messageIds
        });
    });
}

/**
 * When the user attempts to load the dashboard we check if the user is logged in and if so move forwared with the
 * request, otherwise the user is redirected to the login page.
 */
router.get('/', lazyReg.removeLazyRegistrationObject, (req, res) => {

    if(req.loginValidated === false) {
        res.redirect("/login");
    }
    else {
        loadDashboard(req, res);
    }
});

router.post('/markRead', lazyReg.removeLazyRegistrationObject, (req, res) => {
    let ids = req.body.message_ids.split(',');
    ids = ids.filter((value) => {
        return value !== "";
    })

    let query = `UPDATE messages\n`+
                `SET messages.is_read = 1\n`+
                `WHERE messages.message_id IN (?);`
    query = mysql.format(query,[ids]);

    database.query(query, (err, result) => {
        if (err) {
            console.log(`Encountered an error when performing query: ${query}`);
        } else {
            console.log("Updated messages to read")
        }
        res.redirect("/dashboard");
    });
})

router.post('/markUnread', lazyReg.removeLazyRegistrationObject, (req, res) => {
    let ids = req.body.message_ids.split(',');
    ids = ids.filter((value) => {
        return value !== "";
    })

    let query = `UPDATE messages\n`+
                `SET messages.is_read = 0\n`+
                `WHERE messages.message_id IN (?);`
    query = mysql.format(query,[ids]);

    database.query(query, (err, result) => {
        if (err) {
            console.log(`Encountered an error when performing query: ${query}`);
        } else {
            console.log("Updated messages to unread")
        }
        res.redirect("/dashboard");
    });
})

module.exports = router;