/**
 * This file is in charge of the routes and functions for creating a tutor post on the website. It handles inserting
 * the data into the database when the user posts the form. The createTutorPost function also converts the image
 * uploaded to the server into a thumbnail to be sent to the database as well.
 *
 * @author Cameron Robinson.
 * @date 12/11/2021
 * @since  0.0.1
 */

const express = require('express');
const router = express.Router();
 
const lazyReg = require('../model/lazyRegistration');
const { database, mysql } = require("../model/mysqlConnection");
const sharp = require('sharp');
const multer  = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/***
 * This function is called by the tutor post page when the user successfully submits the create user post form.
 * It pareses out the submitted data and creates the query to insert a new post into the database.
 */
function createTutorPost(request, response, callback) {

    // Ge the course number from the posted data. We do not need the major selected by the
    // user as we just use the major linked to the course in the database.
    const courseNumber = request.body.courseNumber;

    // This is the string of text inserted by the user to be used as the main body of the tutor post.
    const postDetails = request.body.postDetails;

    // To get to this point the user must already be logged in, we get their userId from the session storage here.
    const userId = request.session.userID

    // Load the image from the file buffer created by multer.
    const postImage = request.file.buffer;

    // Attempt to create the thumbnail of the image. We set the thumbnail to be a max of 600px wide at the
    // same aspect ratio. Then we set the data as a buffer and process the rest of the request.
    sharp(postImage)
    .resize(600, null)
    .toBuffer()
    .then(postThumbnail => {
        request.postCreated = false;

        const courseIdQuery = "SELECT course_id FROM course WHERE number = ?";
        const courseIdQueryFormatted = mysql.format(courseIdQuery,[courseNumber]);

        database.query(courseIdQueryFormatted, (err, result) => {

            if(err) {
                console.log(`Encountered an error when performing query: ${courseIdQuery}`)
                throw (err)
            }
            else if(result.length > 0) {

                let courseId = result[0]['course_id']

                // Create a new datetime to be stored as the send time.
                let dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ');

                const sqlInsert = "INSERT INTO tutor_post (user_id, tutoring_course_id, post_created, post_details, post_image, post_thumbnail) VALUES (?,?,?,?,?,?)";
                const insert_query = mysql.format(sqlInsert,[userId, courseId, dateNow, postDetails, postImage, postThumbnail]);
                database.query (insert_query, (err, result)=> {

                    if (err) throw (err);

                    request.postCreated = true;
                })
            }
        });
    })
    .catch(err => console.log(`downisze issue ${err}`))

    callback(request, response)
}

/***
 * This function is called by the router functions below. It selects the courses and majors from the database
 * to be displayed by the page as the drop down selections.
 */
function getTutorPostData(request, response, callback) {

    request.courseData = {}

    const query = `SELECT course.number AS courseNumber,\n`+
                  `       course.major,\n`+
                  `       course.title AS courseTitle,\n` +
                  `       major.major_short_name AS majorShortName\n` +
                  `FROM course\n` +
                  `JOIN major ON course.major = major.major_id\n` +
                  `ORDER BY course.major ASC,\n` +
                  `         course.number ASC;`;
    database.query(query, async (err, result) => {

        if(err) {
            console.log(`Encountered an error when performing query: ${majorIdQuery}`)
            throw (err)
        }
        else {

            let courseData = {}
            for(let item of result) {

                if(item['majorShortName'] in courseData === false) {
                    courseData[item['majorShortName']] = []
                }
                courseData[item['majorShortName']].push({
                    courseNumber: item['courseNumber'],
                    courseLabel: `${item['majorShortName'].toUpperCase()} ${item['courseNumber']} ${item['courseTitle']}`
                })
            }

            request.courseData = courseData
        }

        callback()
    });
}

/***
 * If the user wants to load the create tutor post page we render that here.
 */
router.get('/', getTutorPostData, lazyReg.removeLazyRegistrationObject, (req, res) => {

    res.render("createTutorPost", {
        courseData: req.courseData
    });
});

/***
 * If the user attempts to post data we first check if they are logged in. If not we redirect them to the login page
 * for lazy registration. TODO: Save data to be set back into the form fields here.
 */
router.post('/', getTutorPostData, lazyReg.removeLazyRegistrationObject, upload.single("postImage"), (req, res) => {

    if(req.loginValidated) {
        createTutorPost(req, res, (req, res) => {
            res.redirect("/");
        })
    }
    else {
        res.render("login");
    }
});

module.exports = router