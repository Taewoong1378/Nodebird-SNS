// 직접 미들웨어를 2개 만든거임

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // req.isAutenticated가 true면 로그인이 돼있다는 것
    next();
  } else {
    res.status(403).send('로그인 필요');
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.');
    res.redirect(`/?error=${message}`);
  }
};
