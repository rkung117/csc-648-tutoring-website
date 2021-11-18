/**
 *
 * This file is in charge of connecting to the database and retrieving the tutor data when
 * the user clicks on a link to the view a tutor page link.
 *
 * @author Cameron Robinson.
 * @date 11/16/2021
 * @since  0.0.1
 */

const express = require('express')
const router = express.Router()
const searchModel = require("../model/search");
const login = require("../controller/login");

const database = require('../model/mysqlConnection')

// TODO: Clean this up and document.
function sendMessage(request, response) {
    let tutor = request.url.replace("/tutor/", "");
    tutor = tutor.substring(1, tutor.length)

    let tutorID = tutor.split("-")[2]
    tutorID = tutorID.substring(1, tutorID.length)

    let fromUserID = request.session.userID;
    let messageText = request.body.message_text;
    let dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let query = `INSERT INTO messages (date_sent,message_text,to_user,from_user) VALUES ('${dateNow}', '${messageText}', ${tutorID}, ${fromUserID} )`
    database.query(query, (err, result) => {

        let messageSent = false
        // If we hit an error with the mysql connection or query we just return the above empty data
        // since we have no data to display from the database. This should never happen in production.
        if(err) {
            console.log(`Encountered an error when performing query: ${query}`)
        }
        else {
            messageSent = true
        }

        response.render('tutorinfo',{
            tutorData: request.tutorData,
            image: request.image,
            messageSent: messageSent
        });
    })
}

function getTutorInfo(request, response, callback) {
    let tutor = request.url.replace("/tutor/", "");
    tutor = tutor.substring(1, tutor.length)

    let tutorFirstName = tutor.split("-")[0]
    let tutorLastName = tutor.split("-")[1]
    let tutorID = tutor.split("-")[2]
    tutorID = tutorID.substring(1, tutorID.length)

    let query = `SELECT users.user_id,\n` +
        `       users.first_name,\n` +
        `       users.last_name,\n` +
        `       users.major,\n` +
        `       tutors.tutor_id,\n` +
        `       tutors.image,\n` +
        `       tutors.approved,\n` +
        `       tutors.tutor_description,\n` +
        `       major.major_long_name\n` +
        `FROM tutors\n` +
        `JOIN users ON users.user_id = tutors.tutor_id\n` +
        `JOIN major ON users.major = major.major_id\n` +
        `WHERE tutors.tutor_id = ${tutorID} AND tutors.approved = 1`;

    // Perform the query on the database passing the result to our anonymous callback function.
    database.query(query, (err, result) => {

        // If we hit an error with the mysql connection or query we just return the above empty data
        // since we have no data to display from the database. This should never happen in production.
        if(err) {
            console.log(`Encountered an error when performing query: ${query}`)
        }
        else {

            // We have received data from the database.
            // Extract all of the images from the result and convert them from mysql blob to a viewable image.
            let image = null;
            for(let i = 0; i < result.length; i++) {

                image = result[i]['image'];
                if(image !== null) {
                    /*
                    TODO: according to spec this should be a thumbnail. Not sure if
                     we're supposed to convert here or on upload. Something to ask about?
                    */
                    image = Buffer.from(image.toString('base64'))
                }
            }

            // Make sure the URL and the requested tutor id are the same.
            if(result[0]['first_name'] === tutorFirstName && result[0]['last_name'] === tutorLastName) {
                // Append the actual data to the request.
                request.tutorData = result[0];
                request.image = image;
            }
        }

        callback();
    });
}

// All requests under products/ will be routed here
router.get("/*", searchModel.searchCategories, getTutorInfo, (req, res) => {

    // If the data was not found and appended to the request we want to return 404 because something went wrong.
    if(req.tutorData) {

        res.render('tutorinfo',{
            tutorData: req.tutorData,
            image: req.image
        });
    }else {

        res.sendStatus(404)
    }
});

router.post("/*", searchModel.searchCategories, getTutorInfo, login.validateUser, (req, res) => {

    // If the data was not found and appended to the request we want to return 404 because something went wrong.
    if(req.tutorData) {

        if(req.loginValidated) {

            sendMessage(req, res)
        }
        else {
            //TODO: Need lazy registration here.
            res.render('tutorinfo',{
                tutorData: req.tutorData,
                image: req.image
            });
        }
    }else {

        res.sendStatus(404)
    }
});
module.exports = router;