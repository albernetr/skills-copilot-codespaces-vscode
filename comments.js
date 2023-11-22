// Create web server
var express = require('express');
var router = express.Router();

// Load comments model
const Comments = require('../models/comments');

// Load user model
const User = require('../models/user');

// Load post model
const Post = require('../models/post');

// Load auth middleware
const auth = require('../middleware/auth');

// @route   POST /api/comments/:postId
// @desc    Create a comment
// @access  Private
router.post('/:postId', auth, async (req, res) => {
    try {
        // Find user by id
        const user = await User.findById(req.user.id).select('-password');
        // Find post by id
        const post = await Post.findById(req.params.postId);
        // Get comment from req body
        const comment = req.body.comment;

        // Create new comment
        const newComment = new Comments({
            post: post,
            user: user,
            comment: comment
        });

        // Save comment
        await newComment.save();

        // Send response
        res.json(newComment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/comments/:commentId
// @desc    Edit a comment
// @access  Private
router.put('/:commentId', auth, async (req, res) => {
    try {
        // Find comment by id
        const comment = await Comments.findById(req.params.commentId);

        // Get comment from req body
        const newComment = req.body.comment;

        // Update comment
        comment.comment = newComment;

        // Save comment
        await comment.save();

        // Send response
        res.json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:commentId', auth, async (req, res) => {
    try {
        // Find comment by id
        const comment = await Comments.findById(req.params.commentId);

        // Check if user is the owner of the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Delete comment