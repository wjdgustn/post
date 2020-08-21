const express = require('express');
const bodyParser = require('body-parser');
const User = require('../schemas/user');

const utils = require('../utils');
const setting = require('../setting.json');

const app = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));

app.get('/mypage', utils.isLogin, (req, res, next) => {
    res.render('mypage', {
        user: req.user,
        mypageError: req.flash('mypageError'),
        logined: req.isAuthenticated(),
        isAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.snsID) != -1,
        servername: setting.SERVER_NAME
    });
});

app.post('/editaccount', utils.isLogin, async (req, res, next) => {
    const exUser = await User.findOne({ nickname : req.body.nickname });
    if(exUser != null && exUser.fullID != req.user.fullID) {
        req.flash('mypageError', '해당 닉네임이 이미 사용 중입니다!');
        return res.redirect('/mypage');
    }
    if(req.body.nickname.includes('<') || req.body.nickname.includes('>')) {
        req.flash('mypageError', '닉네임에 허용되지 않은 문자 < 또는 >가 포함되어 있습니다!');
        return res.redirect('/mypage');
    }

    try {
        await User.updateOne({
            snsID: req.user.snsID,
            provider: req.user.provider
        }, {
            nickname: req.body.nickname,
            allow_email_new_post: req.body.allow_email_new_post == 'true',
            allow_email_ad: req.body.allow_email_ad == 'true',
            nick_set: true
        });
        res.redirect('/mypage');
    } catch(err) {
        console.error(err);
        req.flash('mypageError', 'DB에 오류가 발생하였습니다.');
        res.redirect('/mypage');
    }
    return;
});

module.exports = app;