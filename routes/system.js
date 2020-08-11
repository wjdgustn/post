const express = require('express');

const setting = require('../setting.json');

const app = express.Router();

app.get('/error', (req, res, next) => {
    res.render('error_message', {
        query: req.query,
        logined: req.isAuthenticated(),
        isAdmin: req.isAuthenticated() && setting.ADMIN.indexOf(req.user.snsID) != -1,
        servername: setting.SERVER_NAME
    });
    return;
});

module.exports = app;