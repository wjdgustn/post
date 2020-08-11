const express = require('express');
const User = require('../schemas/user');

const app = express.Router();

app.get('/userinfo/:id', async (req, res, next) => {
    const user = await User.findOne({ fullID: req.params.id }, { _id: 0, nickname: 1, snsID: 1 });
    res.json(user);
    return;
});

module.exports = app;