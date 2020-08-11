const express = require('express');
const Post = require('../schemas/post');

const utils = require('../utils');
const setting = require('../setting.json');

const app = express.Router();

app.get('/', async (req, res, next) => {
    const posts = await Post.find({});
    res.render('main', {
        posts: posts,
        logined: req.isAuthenticated(),
        user: req.user,
        isAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.snsID) != -1,
        mainError: req.flash('mainError'),
        servername: setting.SERVER_NAME
    });
    return;
});

app.get('/main_render', async (req, res, next) => {
    const posts = await Post.find({});
    res.render('main_render', {
        posts: posts
    });
    return;
});

app.get('/debug', utils.isLogin, (req, res, next) => {
    res.render('debug', {
        req,
        res,
        user: req.user,
        logined: req.isAuthenticated(),
        isAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.snsID) != -1,
        servername: setting.SERVER_NAME
    });
    return;
});

app.get('/server', (req, res, next) => {
    return res.json({
        name: setting.SERVER_NAME
    });
});

module.exports = app;