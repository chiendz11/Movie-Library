require("dotenv").config();
const express = require('express');
const app = express();
const port = 8000;

// MySQL
const db = require('./config/database');

// used for session cookie
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Passport
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');

// cookie-parser
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// include layouts
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);

// for styling static files
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

// static files
app.use(express.static('./assets'));

// EJS Set-up
app.set('view engine', 'ejs');
app.set('views', './views');

// MySQLStore for session cookies
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'MovieApp',
    port: process.env.DB_PORT
});

app.use(session({
    name: 'MovieApp',
    secret: 'blahsomething',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 100 // 100 minutes
    },
    store: sessionStore
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

// Routes
app.use('/', require('./routes'));

// Start server
app.listen(port, function (err) {
    if (err) {
        console.log("Error: ", err);
        return;
    }
    console.log("Successfully running on port", port);
});
