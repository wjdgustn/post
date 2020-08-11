const mongoose = require('mongoose');

const { Schema } = mongoose;
const commentSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    writer: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    post_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    reply_comment_id: {
        type: Schema.Types.ObjectId
    },
    is_reply: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('Comment', commentSchema);