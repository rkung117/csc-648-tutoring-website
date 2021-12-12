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
 const multer  = require('multer')
 const storage = multer.memoryStorage(); 
 const upload = multer({ storage: storage });

function createTutorPost(request, response, callback) {

    const majorShortName = request.body.majorShortName;
    const courseNumber = request.body.courseNumber;
    const postInfo = request.body.postInfo;
    const majorIdQuery = "SELECT major_id FROM major WHERE major_short_name = ?";
    const majorIdQueryFormatted = mysql.format(majorIdQuery,[majorShortName]);

    const courseIdQuery = "SELECT course_id FROM course WHERE number = ?";
    const courseIdQueryFormatted = mysql.format(courseIdQuery,[courseNumber]);

    const userId = request.session.userID

    sharp(request.file.buffer)
    .resize(600, null)
    .toFile(`tmp.png`)
    .then(data => {
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
                await database.query(courseIdQueryFormatted, (err, result) => {
    
                    if(err) {
                        console.log(`Encountered an error when performing query: ${courseIdQuery}`)
                        throw (err)
                    }
                    else if(result.length > 0) {
                        console.log("Inserting to database.")

                        // TODO: Update this after database refactor.
                        const sqlInsert = "INSERT INTO tutor_post (tutor_id, post_created, post_details, post_image) VALUES (?,?,?,?)";
                        // const insert_query = mysql.format(sqlInsert,[userId, "THIS IS ONLY A TEST"]);
                        // await database.query (insert_query, (err, result)=> {   
                    
                        //     if (err) throw (err);
        
                        //     request.postCreated = true;
                        // })                    
                    }
                });
            }
        })
    })
    .catch(err => console.log(`downisze issue ${err}`))

    callback(request, response)
}

router.get('/', lazyReg.removeLazyRegistrationObject, (req, res) => {

    res.render("tutorPost");
});

router.post('/', lazyReg.removeLazyRegistrationObject, upload.single("postImage"), (req, res) => {

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