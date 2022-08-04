const express = require('express')
const { ensureGuest, ensureAuth } = require('../middleware/auth')
const Story = require('../models/Story')
const router = express.Router()
const User = require('../models/User')

// @desc Login/Landing page
// @route GET /
router.get('/', ensureGuest, (req, res) => {
    res.render('login', { layout: 'login' })
})

// @desc Dashboard
// @route GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    const loggedInUSer = await User.findById(req.user)
    try {
        const stories = await Story.find({ user: req.user }).lean()
        res.render('dashboard', {
            name: loggedInUSer.displayName,
            stories
        })
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

module.exports = router