const mongoose = require('mongoose');

const { Schema } = mongoose;
const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    writer: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('Post', postSchema);