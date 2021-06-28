const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 회원가입 라우터
// 로그인한 사람이 로그인하는 것은 안되니깐 isNotLoggedIn을 넣어줌
// isNotLoggdIn은 !req.isAuthenticated()이기 때문에 로그인이 안돼있으면 next()를 호출함. 
router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    // 뒤에 숫자 12는 해쉬를 얼마나 복잡하게 할건지를 의미함. 숫자가 높을수록 더 복잡하다. 그만큼 소요시간은 더 오래걸림.
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

// /auth/login에 접속하면 autenticate 미들웨어가 실행되면서 localStrategy를 찾는다. localStrategy에서 로그인이 성공할 경우 다시 auth의 다음 미들웨어가 실행된다.
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    // 로그인이 실패한 경우
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    // 로그인이 성공한 경우
    // req.login을 하는 순간 passport의 index.js로 간다. 거기의 serializeUser가 실행됨
    // serializeUser의 done이 실행되는 순간, (loginError)=> 이 부분으로 이동
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      // 여기가 로그인 성공 (메인 페이지로 돌려보내줌)
      // 여기서 세션 쿠키를 브라우저로 보내준다. 따라서 다음 요청부터는 서버가 세션 쿠키를 알고 있기 때문에 누가 요청을 보냈는지 알 수 있다.
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout();   //세션 쿠키가 사라진다
  req.session.destroy();  // 세션 자체를 파괴
  res.redirect('/');  // 메인 페이지로 귀환
});

// 카카오로 로그인하기를 누르면 이게 실행됨
// 이게 실행되면 kakaoStrategy로 이동함
router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/');
});

module.exports = router;
