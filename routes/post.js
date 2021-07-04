const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Post = require('../models/post');
const { Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();


try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});


router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    console.log(req.user);
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    // [#노드, #익스프레스]
    // [노드, 익스프레스]
    // [findOrCreate(노드), findOrCreate(익스프레스)]
    // findOrCreate는 중복저장되지 않도록 해줌
    // 중복된건 false, 중복되지 않은건 true가 출력됨
    // [[해시태그, false], [해시태그, true]...]
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),
      );
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.postId }});
    await post.addLiker(req.user.id);
    res.send('Ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:postId/like', isLoggedIn, async (req, res, next) => { // DELETE /post/1/like
  try {
    const post = await Post.findOne({ where: { id: req.params.postId }});
    await post.removeLiker(req.user.id);
    res.send('Ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:postId', isLoggedIn, async (req, res, next) => {
  try {
    await Post.destroy({
      where: {
        id: req.params.postId,
        UserId: req.user.id,
      },
    });
    res.status(200).json({ PostId: parseInt(req.params.postId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
