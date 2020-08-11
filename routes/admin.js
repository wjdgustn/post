const express = require('express');
const User = require('../schemas/user');

const utils = require('../utils');
const setting = require('../setting.json');

const app = express.Router();

app.get('/admin', utils.isAdmin, (req, res, next) => {
    res.render('admin', {
        user: req.user,
        logined: req.isAuthenticated(),
        isAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.snsID) != -1,
        servername: setting.SERVER_NAME
    });
    return;
});

app.get('/admin/:page', utils.isAdmin, async (req, res, next) => {
    switch(req.params.page) {
        case 'user':
            if(req.query.id == '' || req.query.id == null) res.render('admin-user-menu', {
                user: req.user,
                logined: req.isAuthenticated(),
                isAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.snsID) != -1,
                adminFindUserError: req.flash('adminFindUserError'),
                servername: setting.SERVER_NAME
            });
            else {
                const user = await User.findOne({ fullID : req.query.id });
                if(user == null) {
                    req.flash('adminFindUserError', '해당 유저를 찾을 수 없습니다.');
                    return res.redirect('/admin/user');
                }

                res.render('admin-user-edit', {
                    edituser: user,
                    user: req.user,
                    logined: req.isAuthenticated(),
                    isAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.snsID) != -1,
                    servername: setting.SERVER_NAME
                });
            }
            return;
        case 'mail':
            res.render('admin-mail', {
                user: req.user,
                logined: req.isAuthenticated(),
                isAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.snsID) != -1,
                servername: setting.SERVER_NAME
            });
            return;
        default:
            res.redirect('/admin', {
                user: req.user,
                logined: req.isAuthenticated(),
                isAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.snsID) != -1});
            return;
    }
});

module.exports = app;