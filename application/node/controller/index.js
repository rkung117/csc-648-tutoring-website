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

const express = require('express')
const router = express.Router()

const searchModel = require('../model/search');

// Right now our root path is rendered here, we first pass the call to searchCategories to retrieve the categories from
// the database. Then we pass to the search method to actually search if we have data to search with. Search and
// searchCategories are both mart of the model which hold code that performs the interaction with the SQL database.
// The searchModel method then calls the final callback (anonymous function here) that renders the data for the client.
router.get('/search', searchModel.searchCategories, searchModel.search, (req, res) => {

    // If the search result is not an array we create an empty array
    // to keep from type errors in the template. This is temporary
    // because of loading the index page into a black VP template page
    // when we have a real search bar across the site this will be removed.
    let searchResult = req.searchResult;
    if (Array.isArray(searchResult) === false) {
        searchResult = []
    }

    // Render the vertical prototype template, passing data from
    // model
    res.render("search", {
        results: 1,
        searchTerm: req.searchTerm,
        searchResult: searchResult,
        category: req.category,
        images: req.images
    });
});

router.get('/login', searchModel.searchCategories, (req, res) => {

    res.render("login");
});

module.exports = router;