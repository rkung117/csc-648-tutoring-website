
/*
TODO:
 Should move this connection out of this file to a more global declaration.
 keeping here for now.
*/
const mysql = require("mysql");

const database = mysql.createConnection({
    host: 'localhost',
    user: 'dev',
    password: '',
    database: 'development'
})
database.connect((err) => {
    if(err) throw err;
    console.log("connected");
});

/***
 * This function performs the search of the mysql database and passes all values found into a callback function.
 *
 * @param request The request from the user sent to the server, contains all data needed to perform the search
 * @param callback The function that we pass the data to after finishing the search.
 */
function search(request, response, callback) {

    // Extract the search query and category from the request. These are set by the form on the page.
    let searchTerm = request.query.search;
    let category = request.query.category;

    // Create the query based on the data passed. By default we return everything from the table.
    let query = 'SELECT * FROM courses';
    if(searchTerm != '' && category != '') {
        query = `SELECT * FROM courses WHERE major = '${category}' AND (name LIKE '%${searchTerm}%')`;
    }
    else if(searchTerm != '' && category == '') {
        query = `SELECT * FROM courses WHERE (name LIKE '%${searchTerm}%')`;

    }
    else if(searchTerm == '' && category != '') {
        query = `SELECT * FROM courses WHERE major = '${category}'`;
    }

    // Perform the query on the database passing the result to our anonymous callback function.
    database.query(query, (err, result) => {

        // Append default data to the request before calling callback.
        request.searchResult = "";
        request.searchTerm = "";
        request.category = "";
        request.images = []

        // If we hit an error with the mysql connection or query we just return the above empty data
        // since we have no data to display from the database. This should never happen in production.
        if(err) {
            console.log(`Encountered an error when performing query: ${query}`)
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
                    image = Buffer.from(image.toString('base64'))
                    images.push(image)
                }
            }

            // Append the actual data to the request.
            request.searchResult = result;
            request.searchTerm = searchTerm;
            request.category = category;
            request.images = images;
        }

        callback();
    });
}

module.exports = search;