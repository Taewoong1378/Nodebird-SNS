const express = require('express');

const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');
const { Post } = require('../models');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.addFollowings(parseInt(req.params.id, 10));
      // setFollowings : 팔로잉 목록 수정 (기존에 등록돼있던걸 다 제거하고 새로운걸 추가하기 때문에 주의해야됨)
      // removeFollowings
      // getFollowings
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

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
