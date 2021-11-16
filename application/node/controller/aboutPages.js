/**
 * This file contains all of the paths and routes for the about pages. This is refactored out of the index file to
 * keep the struture more clean.
 *
 * @author Cameron Robinson.
 * @date 11/16/2021
 * @since  0.0.1
 */

const express = require('express')
const router = express.Router()
const searchModel = require("../model/search");

// When a user enters site/about express first looks for /about in app.js which forwards to this file. Then becuase there
// is no further path looks for the root path in this file, which will be the response below that renders the about page.
router.get('/', searchModel.searchCategories,  (req, res) => {
    res.render("about")
});

// Should store our data in the database and use a template for each of these requests but have not
// started work on it. Is low priority.
router.get('/ckRobinson', searchModel.searchCategories, (req, res) => {
    res.render('about/ckRobinson')
})
router.get('/dsElnaggar', searchModel.searchCategories, (req, res) => {
    res.render('about/dsElnaggar')
})
router.get('/jamespratt', searchModel.searchCategories, (req, res) => {
    res.render('about/jamespratt')
})
router.get('/rKung', searchModel.searchCategories, (req, res) => {
    res.render('about/rKung')
})
router.get('/snehalP', searchModel.searchCategories, (req, res) => {
    res.render('about/snehalP')
})
router.get('/srRoy', searchModel.searchCategories, (req, res) => {
    res.render('about/srRoy')
})

module.exports = router;