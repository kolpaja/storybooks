const express = require('express')
const { ensureAuth } = require('../middleware/auth')
const Story = require('../models/Story')
const router = express.Router()
const User = require('../models/User')

// @desc Add Story Form
// @route GET /stories/add
router.get('/add', ensureAuth, async (req, res) => {
    try {
        res.render('stories/add')
    } catch (error) {
        console.error(error)
        res.render('errors/404')
    }
})

// @desc    Process add form
// @route   POST /stories
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user._id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('errors/500')
    }
})

// @desc View All Stories
// @route GET /stories
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('stories/index', { stories })
    } catch (error) {
        console.error(error)
        res.render('errors/404')
    }
})

// @desc    Show edit page
// @route   GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findOne({
            _id: req.params.id,
        }).lean()

        if (!story) {
            return res.render('errors/404')
        }
        if (story.user.toString() !== req.user._id) {
            res.redirect('/stories')
        } else {
            console.log(story)
            res.render('stories/edit', {
                story,
            })
        }
    } catch (err) {
        console.error(err)
        return res.render('errors/500')
    }
})

// @desc    Show single Story
// @route   GET /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findOne({
            _id: req.params.id,
        }).lean().populate('user')

        if (!story) {
            return res.render('errors/404')
        }
        if (story.user.toString() !== req.user._id && story.status == 'private') {
            res.redirect('/stories')
        } else {
            res.render('stories/view', {
                story,
            })
        }
    } catch (err) {
        console.error(err)
        return res.render('errors/500')
    }
})

// @desc    Update story
// @route   PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()

        if (!story) {
            return res.render('errors/404')
        }

        if (story.user != req.user._id) {
            res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true,
            })

            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        return res.render('errors/500')
    }
})

// @desc    Delete story
// @route   DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()

        if (!story) {
            return res.render('error/404')
        }

        if (story.user != req.user._id) {
            res.redirect('/stories')
        } else {
            await Story.remove({ _id: req.params.id })
            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        return res.render('errors/500')
    }
})

// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
            status: 'public',
        })
            .populate('user')
            .lean()

        res.render('stories/index', {
            stories,
        })
    } catch (err) {
        console.error(err)
        res.render('errors/500')
    }
})
module.exports = router