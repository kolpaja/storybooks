const express = require('express')
const passport = require('passport')
const router = express.Router()

// @desc Auth Google Login
// @route GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

// @desc Google Callback
// @route GET /auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google',
        { failureRedirect: '/', failureMessage: true }), (req, res) => {
            res.redirect('/dashboard')
        })

//@desc Logout
//@route GET /auth/logout
router.get("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err);
        res.redirect("/");
    });
});


module.exports = router