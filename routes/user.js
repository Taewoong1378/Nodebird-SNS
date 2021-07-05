const express = require('express');

const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');
const { addFollowing } = require('../controllers/user');

const router = express.Router();


router.post('/:id/follow', isLoggedIn, addFollowing);

router.post('/:id/notfollow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (user) {
      await user.removeFollower(parseInt(req.user.id));
      res.send('success');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/profile', isLoggedIn, async(req, res, next)=>{
  try {
  await User.update({ nick: req.body.nick }, {
    where: { id: req.user.id },
  });
  res.redirect('/profile');
  } catch(error) {
    console.error(error);
    next(error);
  } 
});

module.exports = router;
