const mongoose = require('mongoose');

const { Schema } = mongoose;
const userSchema = new Schema({
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String
    },
    snsID: {
        type: String,
        required: true,
        unique: true
    },
    fullID: {
        type: String,
        required: true,
        unique: true
    },
    provider: {
        type: String,
        required: true
    },
    nick_set: {
        type: Boolean,
        required: true,
        default: false
    },
    allow_email_new_post: {
        type: Boolean,
        required: true,
        default: false
    },
    allow_email_ad: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    password: {
        type: String
    },
    join_finish: {
        type: Boolean,
        required: true,
        default: true
    },
    write_permission: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema);