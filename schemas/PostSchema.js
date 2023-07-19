const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema({
    content: { type: String, trim: true },
    postedBy:
}, {
    timestamps: true
})

var Post = mongoose.model('Post', PostSchema)
module.exports = Post