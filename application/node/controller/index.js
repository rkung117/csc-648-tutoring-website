const express = require('express')
const router = express.Router()

const searchModel = require('../model/search');

// Right now our root path is rendered here, we first pass the call to searchModel which interacts with the SQL database
// the searchModel then calls the callback here that renders the data for the client.
router.get('/', searchModel, (req, res) => {

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
    res.render("vp", {
        results: 1,
        searchTerm: req.searchTerm,
        searchResult: searchResult,
        category: req.category,
        images: req.images
    });
});

// Render the about page.
router.get('/about', (req, res) => {
        res.render("about")
});

// Not sure if there is an easier way to do this, still investigating.
router.get('/about/ckRobinson', (req, res) => {
    res.render('about/ckRobinson')
})
router.get('/about/dsElnaggar', (req, res) => {
    res.render('about/dsElnaggar')
})
router.get('/about/jamespratt', (req, res) => {
    res.render('about/jamespratt')
})
router.get('/about/rKung', (req, res) => {
    res.render('about/rKung')
})
router.get('/about/snehalP', (req, res) => {
    res.render('about/snehalP')
})
router.get('/about/srRoy', (req, res) => {
    res.render('about/srRoy')
})

module.exports = router;