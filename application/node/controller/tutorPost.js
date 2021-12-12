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
 const sharp = require('sharp');
 const multer  = require('multer');
const { response } = require('express');
 const storage = multer.memoryStorage(); 
 const upload = multer({ storage: storage });

function createTutorPost(request, response, callback) {

    const majorShortName = request.body.majorShortName;
    const courseNumber = request.body.courseNumber;
    const postDetails = request.body.postDetails;
    const majorIdQuery = "SELECT major_id FROM major WHERE major_short_name = ?";
    const majorIdQueryFormatted = mysql.format(majorIdQuery,[majorShortName]);

    const courseIdQuery = "SELECT course_id FROM course WHERE number = ?";
    const courseIdQueryFormatted = mysql.format(courseIdQuery,[courseNumber]);

    const userId = request.session.userID
    const postImage = request.file.buffer;

    sharp(postImage)
    .resize(600, null)
    .toBuffer()
    .then(postThumbnail => {
        request.postCreated = false;
        database.query(majorIdQueryFormatted, async (err, result) => {  
    
            if(err) {
                console.log(`Encountered an error when performing query: ${majorIdQuery}`)
                throw (err)
            }
            else if(result.length >= 0) {
                console.log(result)

                console.log("Getting major id.")

                let major_id = result[0]['major_id'];
                console.log(courseIdQueryFormatted)
                database.query(courseIdQueryFormatted, (err, result) => {
    
                    if(err) {
                        console.log(`Encountered an error when performing query: ${courseIdQuery}`)
                        throw (err)
                    }
                    else if(result.length > 0) {
                        console.log("Inserting to database.")

                        let courseId = result[0]['course_id']

                        // Create a new datetime to be stored as the send time.
                        let dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ');
                        console.log(postThumbnail)
                        const sqlInsert = "INSERT INTO tutor_post (user_id, tutoring_course_id, post_created, post_details, post_image, post_thumbnail) VALUES (?,?,?,?,?,?)";
                        const insert_query = mysql.format(sqlInsert,[userId, courseId, dateNow, postDetails, postImage, postThumbnail]);
                        database.query (insert_query, (err, result)=> {   
                    
                            if (err) throw (err);
        
                            request.postCreated = true;
                        })                    
                    }
                });
            }
        })
    })
    .catch(err => console.log(`downisze issue ${err}`))

    callback(request, response)
}

function getTutorPostData(request, response, callback) {

    request.courseData = {}

    const q = ` SELECT course.number AS courseNumber, 
                       course.major, 
                       course.title AS courseTitle,
                       major.major_short_name AS majorShortName
                FROM course
                JOIN major ON course.major = major.major_id
                ORDER BY course.major ASC,
                         course.number ASC`
    database.query(q, async (err, result) => {  

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

router.get('/', getTutorPostData, lazyReg.removeLazyRegistrationObject, (req, res) => {

    res.render("tutorPostInfo", {
        courseData: req.courseData
    });
});

router.post('/', getTutorPostData, lazyReg.removeLazyRegistrationObject, upload.single("postImage"), (req, res) => {

    // if(req.loginValidated) {

    createTutorPost(req, res, (req, res) => {

        res.redirect("/");
    })
    // }
    // else {
    //     res.render("login");
    // }
});

module.exports = router