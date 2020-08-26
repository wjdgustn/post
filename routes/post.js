const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const User = require('../schemas/user');
const Post = require('../schemas/post');
const Comment = require('../schemas/comment');

const utils = require('../utils');
const setting = require('../setting.json');

const app = express.Router();

app.use(bodyParser.json({ limit : "10mb" }));
app.use(bodyParser.urlencoded({ extended : false , limit : "10mb" }));

app.get('/new', utils.isLogin, async (req, res, next) => {
    let post_title, post_url, post_text;
    if(req.query.post_url != null && req.query.post_url != '') {
        const post = await Post.findOne({ url : req.query.post_url });
        if(post != null) {
            post_title = post.title;
            post_url = post.url;
            post_text = post.text;
        }
    }
    if(req.user.write_permission) return res.render('editor', {
        user: req.user,
        logined: req.isAuthenticated(),
        isAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.snsID) != -1,
        servername: setting.SERVER_NAME,
        post_title: post_title || '',
        post_url: post_url || '',
        post_text: post_text || '',
        EditorError: req.flash('EditorError')
    });
    return res.redirect(`/error?message=권한이 없습니다.`);
});

app.post('/new', utils.isLogin, async (req, res, next) => {
    if(!req.user.write_permission) return res.redirect(`/error?message=권한이 없습니다.`);

    if(req.body.url == '') {
        req.flash('EditorError', '글 주소를 공백으로 둘 수 없습니다.');
        return res.redirect(`/new?title=${req.body.title}&url=${req.body.url}&text=${req.body.text}`);
    }

    const deny_string = [ '/' , ' ' , '\\', '?', '%', '&' ];
    req.body.url.split('').forEach(word => {
        if(deny_string.indexOf(word) != -1) {
            req.flash('EditorError', `글 주소엔 ${word}을(를) 포함할 수 없습니다.`);
            return res.redirect(`/new?title=${req.body.title}&url=${req.body.url}&text=${req.body.text}`);
        }
    });
    const exPost = await Post.findOne({ url : req.body.url });
    if(exPost != null) {
        if(setting.ADMIN.indexOf(req.user.fullID) == -1 && exPost.writer != req.user.fullID) {
            req.flash('EditorError', 'URL이 이미 존재합니다. 자신의 글만 수정할 수 있습니다.');
            return res.redirect(`/new?post_url=${req.body.url}`);
        }
        await Post.updateOne({ url : req.body.url }, {
            title: req.body.title,
            text: req.body.text
        });

        req.app.get('socket_post').to(req.body.url).emit('msg', { action : 'reload_post' });
        req.app.get('socket_main').emit('msg', { action : 'reload_post' });

        return res.redirect(`/post/${req.body.url}`);
    }

    const post = new Post({
        title: req.body.title,
        text: req.body.text,
        url: req.body.url,
        writer: req.user.fullID
    });
    await post.save();
    res.redirect(`/post/${req.body.url}`);
    
    const transport = nodemailer.createTransport(setting.SMTP_INFO);
    const mail_user_list = await User.find({ allow_email_new_post : true }, { _id : 0 , email : 1 });

    let mail_list = [];
    mail_user_list.forEach(user => {
        mail_list.push(user.email);
    });

    const message = {
        from: setting.SMTP_MAIL_ADDRESS,
        envelope: {
            from: setting.SMTP_MAIL_ADDRESS,
            to: mail_list
        },
        subject: `${setting.SERVER_NAME} 새 글 알림`,
        html: `<!DOCTYPE html>
<h1>새 글이 올라왔습니다!</h1>
<h2>제목 : ${req.body.title}</h2>
<h2>작성자 : ${req.user.nickname}</h2>
<h2><a href="${req.protocol}://${req.hostname}/post/${req.body.url}">지금 보러 가기</a></h2>
`
    }
    transport.sendMail(message);

    req.app.get('socket_main').emit('msg', { action : 'reload_post' });
    return;
});

app.get('/removepost/:post', utils.isLogin, utils.canWrite, async (req, res, next) => {
    const post = await Post.findOne({ url : req.params.post });
    if(post == null) return res.redirect(`/error?message=해당 게시글은 존재하지 않습니다.`);

    if(setting.ADMIN.indexOf(req.user.fullID) != -1 || post.writer == req.user.fullID) {
        const post = await Post.findOne({ url : req.params.post });
        await Post.deleteOne({ url : req.params.post });
        await Comment.deleteMany({ post_id : post._id });
        req.app.get('socket_main').emit('msg', { action : 'reload_post' });
        req.app.get('socket_post').to(req.params.post).emit('msg', { action : 'remove_post' });
        return res.redirect('/');
    }
    return res.redirect(`/error?message=권한이 없습니다.`);
});

module.exports = app;