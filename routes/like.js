const express = require('express');
const User = require('../models/user');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();

router.post('/cancle/:postId', isLoggedIn, async(req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id }});
        await user.removeLiked(parseInt(req.params.postId, 10));
        res.send('success');
    } catch(err) {
        console.error(err);
        next(err);
    }
});

router.post('/add/:postId', isLoggedIn, async(req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id }});
        await user.addLiked(parseInt(req.params.postId, 10));
        res.send('success');
    } catch(err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;