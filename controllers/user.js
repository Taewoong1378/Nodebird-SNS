const User = require('../models/user');

exports.addFollowing = async (req, res, next) => {
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
  }