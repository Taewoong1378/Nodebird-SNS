const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
// const helmet = require('helmet');
// const hpp = require('hpp');
// const redis = require('redis');
// const RedisStore = require('connect-redis')(session);

dotenv.config();
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const likeRouter = require('./routes/like');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
passportConfig(); // 패스포트 설정
// 개발할 때 포트와 배포할 때 포트를 다르게 한다
// 나중에는 .env에 PORT=80을 넣어줄 것.
app.set('port', process.env.PORT || 8001);
// 넌적스 설정
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});
// 시퀄라이즈 설정
// force: true를 하면 테이블이 지워졌다가 다시 생성된다. 대신에 이렇게하면 데이터가 날아가기 때문에 주의해야한다.

// alter: true를 하면 데이터를 유지하면서 테이블을 바꿔주는 대신 컬럼과 데이터가 안 맞아 오류가 나는 경우가 많다.

// 기본적으로 개발용일 때는 force: false를 해놨다가 만약 테이블을 수정하면 force: true를 해줘서 테이블을 재생성해준 뒤 다시 force: false로 바꿔주기. 실무에서는 보통 alter: true를 사용해준다.
sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });


app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

// express-session보다 아래에 위치해야됨. session을 받아서 실행해야하기 때문에.
// passport.session이 실행될 때, index.js의 deserializeUser가 실행된다
app.use(passport.initialize());   // 요청(req 객체)에 passport 설정을 심는다.
app.use(passport.session());      // req.session 객체에 passport 정보를 저장한다. 따라서 express-session 뒤에서 실행

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);
app.use('/like', likeRouter);

// 404처리 미들웨어
app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  // 개발 모드일 떄는 에러를 보여주게 하고, 배포일 때는 보여주지 않게 하는 코드
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;