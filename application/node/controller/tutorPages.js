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

const lazyReg = require('../model/lazyRegistration')

const database = require('../model/mysqlConnection')

function parseTutorDataFromURL(url) {

    // Pares the tutor ID out of the url. TODO: This can probably be simplified but is working for now.
    let tutor = url.replace("/tutor/", "");
    tutor = tutor.substring(1, tutor.length)

    tutor = tutor.split("-")

    // Get the first name, last name and tutor id from the data.
    let tutorFirstName = tutor[0]
    let tutorLastName = tutor[1]

    let tutorID = tutor[2]
    tutorID = tutorID.substring(1, tutorID.length)

    return {
        tutorFirstName: tutorFirstName,
        tutorLastName: tutorLastName,
        tutorID: tutorID
    }
}

/**
 * sendMessage is responsible for making the insert into the database for the newly added message. To get to this
 * point the user must be logged in and sending a message to a tutor from a valid tutor page.
 * @param request
 * @param response
 */
function sendMessage(request, response) {

    let tutorURLData = parseTutorDataFromURL(request.url)
    let tutorID = tutorURLData.tutorID

    // Get the current userID from the session data and get the message text from the body the form request.
    let fromUserID = request.session.userID;
    let messageText = request.body.messageText;

    // Create a new datetime to be stored as the send time.
    let dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Create the query for inserting the message to the database/
    let query = `INSERT INTO messages (date_sent,message_text,to_user,from_user) VALUES ('${dateNow}', '${messageText}', ${tutorID}, ${fromUserID} )`

    database.query(query, (err) => {

        // If we hit an error we want to display an error on the page so set this bool to false here.
        let messageSent = false

        // If we hit an error with the mysql connection or query we just return the above empty data
        // since we have no data to display from the database. This should never happen in production.
        if(err) {
            console.log(`Encountered an error when performing query: ${query}`)
        }
        else {
            // If there is no error we set messageSent to true to display a success message on the page.
            messageSent = true
        }

        // Render the tutor info page with proper data and the boolean value of if the message was sent.
        response.render('tutorinfo',{
            tutorData: request.tutorData,
            image: request.image,
            messageSent: messageSent
        });
    })
}

/**
 * getTutorInfo handles the retrieval of tutor data from the database to be displayed on a tutor info page.
 * It currently uses the url created on the search page to parse out the first name, last name and tutor id and
 * then performs the query for the tutor data. If the data does not exists or the url doesnt match the found data
 * we send a 404 because something went wrong.
 * @param request
 * @param response
 * @param callback
 */
function getTutorInfo(request, response, callback) {

    let tutorURLData = parseTutorDataFromURL(request.url)
    let tutorID = tutorURLData.tutorID

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
            // Make sure the URL and the requested tutor id are the same, if the passed url names dont match do not continue.
            if(result[0]['first_name'] === tutorURLData.tutorFirstName && result[0]['last_name'] === tutorURLData.tutorLastName) {

                // Append the actual data to the request.
                request.tutorData = result[0];

                // Extract the images from the result and convert from mysql blob to a viewable image.
                let image = result[0]['image'];
                if(image !== null) {
                    /*
                    TODO: according to spec this should be a thumbnail. Not sure if
                     we're supposed to convert here or on upload. Something to ask about?
                    */
                    image = Buffer.from(image.toString('base64'))
                }
                request.image = image;
            }
        }

        callback();
    });
}
router.get('/', (req, res) => {
  res.sendStatus(404);
})

router.post("/contactlogin", (req, res) => {

    req.session.lazyRegistration = lazyReg.getLazyRegistrationObject(req.body.referringTutorPage, req.body.messageText)
    res.redirect('/login')
});

// All requests under products/ will be routed here
router.get("/*", getTutorInfo, (req, res) => {

    // If the data was not found and appended to the request we want to return 404 because something went wrong.
    if(req.tutorData) {

        if(req.loginValidated) {

            if(req.session.lazyRegistration) {
                res.locals.messageText = req.session.lazyRegistration.data
                console.log(req.session)
                delete req.session.lazyRegistration
                console.log(req.session)
            }
        }

        console.log(res.locals)

        res.render('tutorinfo',{
            tutorData: req.tutorData,
            image: req.image
        });
    }else {

        res.sendStatus(404)
    }
});

router.post("/*", getTutorInfo, (req, res) => {

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