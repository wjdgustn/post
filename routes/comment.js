const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Post = require('../schemas/post');
const Comment = require('../schemas/comment');

const utils = require('../utils');
const setting = require('../setting.json');

const app = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));

app.get('/comment/:id', async (req, res, next) => {
    const comments = await Comment.find({ post_id : mongoose.Types.ObjectId(req.params.id) });
    return res.send(comments);
});

app.post('/comment', utils.isLogin, async (req, res, next) => {
    const post = await Post.findOne({ url : req.body.post });
    if(post == null) return res.redirect('/');
    if(req.body.comment == null || req.body.comment == '') {
        req.flash('commentError', '필수 입력란이 누락되었습니다.');
        return res.redirect(`/post/${req.body.post}`);
    }
    if(req.body.comment.includes('<') || req.body.comment.includes('>')) {
        req.flash('commentError', '댓글에 허용되지 않은 문자 < 또는 >가 포함되어 있습니다.');
        return res.redirect(`/post/${req.body.post}`);
    }

    const newComment = new Comment({
        text: req.body.comment,
        writer: req.user.fullID,
        post_id: post._id
    });
    await newComment.save();

    req.app.get('socket_post').to(req.body.post).emit('msg', { action : 'reload_post' });

    return res.redirect(`/post/${req.body.post}`);
});

app.get('/removecomment/:id', utils.isLogin, async (req, res, next) => {
    const comment = await Comment.findOne({ _id : mongoose.Types.ObjectId(req.params.id) });
    if(comment == null) {
        req.flash('mainError', '존재하지 않는 댓글입니다.');
        return res.redirect(`/`);
    }

    const post = await Post.findOne({ _id : comment.post_id });
    if(comment.writer != req.user.fullID && setting.ADMIN.indexOf(req.user.fullID) == -1) {
        req.flash('commentError', '권한이 없습니다.');
        return res.redirect(`/post/${post.url}`);
    }
    await Comment.deleteOne({ _id : mongoose.Types.ObjectId(req.params.id) });

    req.app.get('socket_post').to(post.url).emit('msg', { action : 'reload_post' });

    return res.redirect(`/post/${post.url}`);
});

module.exports = app;