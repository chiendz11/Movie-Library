const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./database'); // Ensure this path is correct to your MySQL configuration

// Authentication using passport
passport.use(new LocalStrategy({
        usernameField: 'email', // Using email as the login field
    },
    async (email, password, done) => {
        try {
            // Find the user by email
            const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

            // If user not found, return false
            if (rows.length === 0) {
                console.log('Invalid Username/Password');
                return done(null, false); // User not found
            }

            const user = rows[0];

            // Check password using bcrypt
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.log('Invalid Username/Password');
                return done(null, false); // Password doesn't match
            }

            // Successful authentication
            return done(null, user);

        } catch (err) {
            console.log('Error in finding user --> Passport');
            return done(err); // Error while querying the database
        }
    }
));

// Serializing user to store the user's ID in the session cookie
passport.serializeUser((user, done) => {
    done(null, user.id); // Save user's ID in the session cookie
});

// Deserializing user from the session cookie to retrieve user from the database
passport.deserializeUser(async (id, done) => {
    try {
        // Retrieve user by id
        const [rows] = await db.promise().query('SELECT * FROM users WHERE id = ?', [id]);

        // If user is not found, return false
        if (rows.length === 0) {
            return done(null, false);
        }

        // Return the user based on the id from session
        return done(null, rows[0]);

    } catch (err) {
        console.log('Error in finding user --> Passport');
        return done(err); // Error while querying the database
    }
});

// Middleware to check if the user is authenticated
passport.checkAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // Proceed to the next controller if the user is logged in
    }
    return res.redirect('/users/signin'); // Redirect to the login page if not authenticated
};

// Middleware to set authenticated user in locals for use in views
passport.setAuthenticatedUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user = req.user; // Attach the logged-in user to the locals object for use in views
    }
    next();
};

module.exports = passport;
