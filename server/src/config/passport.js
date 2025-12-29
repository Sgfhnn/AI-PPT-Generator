const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User.model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${SERVER_URL}/api/auth/google/callback`,
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        }

        // Check if user exists by email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // Link google account and mark as verified
            user.googleId = profile.id;
            user.isVerified = true;
            await user.save();
            return done(null, user);
        }

        // Create new user
        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            avatar: profile.photos[0].value,
            isVerified: true // Social login is verified by default
        });

        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${SERVER_URL}/api/auth/github/callback`,
    scope: ['user:email'],
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
            return done(null, user);
        }

        // GitHub email might be private, need to handle that
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
            return done(new Error('No email found from GitHub'), null);
        }

        // Check if user exists by email
        user = await User.findOne({ email });

        if (user) {
            // Link github account and mark as verified
            user.githubId = profile.id;
            user.isVerified = true;
            await user.save();
            return done(null, user);
        }

        // Create new user
        user = await User.create({
            name: profile.displayName || profile.username,
            email: email,
            githubId: profile.id,
            avatar: profile.photos[0].value,
            isVerified: true
        });

        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

module.exports = passport;
