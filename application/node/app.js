/**
 * Main entry point into the application.
 *
 * This file is in charge of defining our required imports, setting up basic information for the app to run.
 * And then start the node server to listen for new connections.
 *
 * @author Cameron Robinson.
 * @date 10/21/2021
 * @since  0.0.1
 */

const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up the basic data for our session cookies. This is used to store user logged in data currently.
app.use(session({
    secret: "SuperSecretSessionKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000 // Time is in milliseconds so this keeps user logged in for 1 hour 60min * 60 sec * 1000ms
    }
}));

// When loading into any page these two pieces of middleware will run. First we get the search categories for the
// header search bar. then we validate if the user is logged in. The result of these calls is stored within the
// request and response values depending on the required functionality.
app.use(require('./controller/search').getSearchCategories);
app.use(require('./controller/login').validateUser);

app.use('/register', require('./controller/register'));

// When someone accesses / we pass the call to the controller/index.js file
app.use('/', require('./controller/index'));

app.use('/search', require('./controller/search').router);

// Pass all calls to the login page to the login router.
app.use('/login', require('./controller/login').router);

app.use('/dashboard', require('./controller/dashboard'));

app.use('/about', require('./controller/aboutPages'));

app.use('/tutor', require('./controller/tutorPages'));

app.use('/tutorPost', require('./controller/tutorPost'))

// Tell node our templates will be under the views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// These lines tell node to look for static files under these paths.
// This is how we can set images directly in the files rather than through the code
app.use( express.static( "public" ) );

// This line sets the port during deployment or sets to default of 3020 before
// starting the server. Do not change this line as it may cause deployment
// to break.
const port = process.env.PORT || 3020;
app.listen(port, () => console.log('Server started on port: ', port));

module.exports = app;