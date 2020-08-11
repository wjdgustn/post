const express = require('express');
const Post = require('../schemas/post');

const setting = require('../setting.json');

const app = express.Router();

app.get('/post/:name', async (req, res, next) => {
    res.render('post_view', {
        name: req.params.name,
        isAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.fullID) != -1,
        userID: req.isAuthenticated() ? req.user.fullID : null,
        commentError: req.flash('commentError'),
        logined: req.isAuthenticated(),
        user: req.user,
        servername: setting.SERVER_NAME
    });
});

app.get('/raw/:name', (req, res, next) => {
    Post.findOne({ url : req.params.name }, { _id: 1, title: 1, text: 1, writer: 1, createdAt: 1 })
        .then((post) => {
            if(!post) return res.json({ "code" : "error" , "message" : "NotFound" , "error" : true });
            res.json(post);
            return;
        })
        .catch((err) => {
            console.error(err);
            res.send({ "code" : "error" , "message" : "DBError" , "error" : true });
            return;
        });
});

module.exports = app;