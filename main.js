// 기본 모듈
const express = require('express');
const http = require('http');
const https = require('https');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const fs = require('fs');

// 유저 데이터베이스 스키마
const User = require('./schemas/user');

// 웹소켓
const webSocket = require('./socket');

// 설정 파일, 유틸
const setting = require('./setting.json');

// app 정의
const app = express();

// 몽고디비 스키마 연결
const connect = require('./schemas');
connect();

// SSL 관련 설정
let options;
if(setting.USE_SSL) {
    options = {
        cert: fs.readFileSync(setting.SSL_CERT),
        key: fs.readFileSync(setting.SSL_KEY)
    }
}

// 로그인 관련 코드
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    User.findOne({ snsID: obj.snsID , provider: obj.provider })
        .then(user => done(null, user))
        .catch(err => done(err));
});

// 세션, REDIS
if(setting.USE_REDIS) {
    const client = redis.createClient({
        host: setting.REDIS_HOST,
        port: setting.REDIS_PORT,
        password: setting.REDIS_PASSWORD,
        logError: true
    })

    app.use(session({
        secret: setting.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new RedisStore({ client: client })
    }));
}
else {
    app.use(session({
        secret: setting.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    }));
}

// 쿠키 파서
app.use(cookieParser());

// Flash 설정
app.use(flash());

// 로그인 관련 코드
app.use(passport.initialize());
app.use(passport.session());

// 정적 파일 제공
const staticoptions = {
    index: setting.INDEX
}
app.use(express.static(__dirname + "/public/", staticoptions));

// view engine을 EJS로 설정
app.set('views', './views');
app.set('view engine', 'ejs');

// 로그인 파일 불러오기
fs.readdirSync('./login').forEach((file) => {
    require(`./login/${file}`)(passport);
});

// 닉네임 설정하지 않은 유저 닉네임 설정시키기
app.use((req, res, next) => {
    if(req.isAuthenticated() && !req.user.nick_set && req.url != '/mypage' && req.url != '/editaccount') return res.redirect('/mypage');
    next();
});


// 라우터 불러오기
console.log('라우터를 불러오는 중...');
fs.readdirSync('./routes').forEach((file) => {
    app.use(require(`./routes/${file}`));
    console.log(`${file} 라우터를 불러왔습니다.`);
});
console.log('라우터를 모두 불러왔습니다.\n');

// 서버 구동
let server;
if(setting.USE_SSL) {
    server = https.createServer(options, app).listen(setting.PORT, () => {
        console.log('보안 서버가 구동중입니다!');
    });
}
else {
    server = http.createServer(app).listen(setting.PORT, () => {
        console.log("서버가 구동중입니다!");
    });
}

webSocket(server, app);